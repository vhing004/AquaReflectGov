using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Common.Security;
using AquaReflect.Application.Features.Petitions.DTOs;
using AquaReflect.Domain.Entities;
using AquaReflect.Domain.Enums;
using AquaReflect.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Application.Features.Petitions.Commands.UpdateResolution;

public class UpdatePetitionResolutionCommandHandler : IRequestHandler<UpdatePetitionResolutionCommand, PetitionResolutionDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IFileStorageService _fileStorage;
    private readonly INotificationService _notificationService;
    private readonly IEmailService _emailService;

    private static readonly string[] AllowedExtensions = { ".pdf", ".docx", ".doc", ".jpg", ".jpeg", ".png" };
    private const long MaxFileSize = 25 * 1024 * 1024; // 25MB

    public UpdatePetitionResolutionCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IFileStorageService fileStorage,
        INotificationService notificationService,
        IEmailService emailService)
    {
        _context = context;
        _currentUser = currentUser;
        _fileStorage = fileStorage;
        _notificationService = notificationService;
        _emailService = emailService;
    }

    public async Task<PetitionResolutionDto> Handle(UpdatePetitionResolutionCommand request, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra xác thực & phân quyền
        if (!_currentUser.IsAuthenticated)
            throw new UnauthorizedAccessException("Vui lòng đăng nhập để thực hiện ban hành kết luận xử lý.");

        var role = _currentUser.Role;
        if (role == UserRole.Citizen)
            throw new ForbiddenException("Người dân không có quyền ban hành kết luận xử lý hồ sơ.");

        if (string.IsNullOrWhiteSpace(request.ConclusionText))
            throw new ValidationException("Nội dung kết luận giải quyết không được để trống.");

        // 2. Tìm hồ sơ phản ánh
        var petition = await _context.Petitions
            .Include(p => p.Resolution)
            .FirstOrDefaultAsync(p => p.Id == request.PetitionId && !p.IsDeleted, cancellationToken);

        if (petition == null)
            throw new NotFoundException($"Không tìm thấy hồ sơ phản ánh với ID: {request.PetitionId}");

        // 3. Specialist chỉ được giải quyết hồ sơ thuộc phòng ban mình
        if (role == UserRole.Specialist && _currentUser.DepartmentId.HasValue && petition.DepartmentId.HasValue)
        {
            if (petition.DepartmentId != _currentUser.DepartmentId)
            {
                throw new ForbiddenException("Bạn không có quyền ban hành kết luận cho hồ sơ của phòng ban khác.");
            }
        }

        string officerName = _currentUser.Username ?? "Cán bộ thụ lý";
        if (_currentUser.UserId.HasValue)
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == _currentUser.UserId.Value, cancellationToken);
            if (user != null && !string.IsNullOrWhiteSpace(user.FullName))
            {
                officerName = user.FullName;
            }
        }

        // 4. Lưu tệp văn bản quyết định nếu có
        string? documentUrl = petition.Resolution?.OfficialDocumentUrl;

        if (request.DocumentFile != null && request.DocumentFile.Length > 0)
        {
            if (request.DocumentFile.Length > MaxFileSize)
                throw new ValidationException("Kích thước tệp văn bản không được vượt quá 25MB.");

            var extension = Path.GetExtension(request.DocumentFile.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(extension))
                throw new ValidationException("Định dạng tệp văn bản không hợp lệ (hỗ trợ PDF, DOCX, DOC, JPG, PNG).");

            var saveResult = await _fileStorage.SaveFileAsync(request.DocumentFile, "resolutions", cancellationToken);
            documentUrl = saveResult.FileUrl;
        }

        var oldStatus = petition.Status;

        var sanitizedConclusion = InputSanitizer.SanitizeRichText(request.ConclusionText);
        var sanitizedDocumentNumber = InputSanitizer.SanitizePlainText(request.DocumentNumber);

        // 5. Cập nhật hoặc tạo mới PetitionResolution
        var resolution = petition.Resolution;
        if (resolution == null)
        {
            resolution = new PetitionResolution
            {
                PetitionId = petition.Id,
                ConclusionText = sanitizedConclusion,
                DocumentNumber = sanitizedDocumentNumber,
                OfficialDocumentUrl = documentUrl,
                ApprovedByUserId = _currentUser.UserId,
                IssuedAt = DateTime.UtcNow
            };
            _context.PetitionResolutions.Add(resolution);
        }
        else
        {
            resolution.ConclusionText = sanitizedConclusion;
            resolution.DocumentNumber = sanitizedDocumentNumber ?? resolution.DocumentNumber;
            if (!string.IsNullOrEmpty(documentUrl))
            {
                resolution.OfficialDocumentUrl = documentUrl;
            }
            resolution.ApprovedByUserId = _currentUser.UserId;
            resolution.IssuedAt = DateTime.UtcNow;
        }

        // 6. Cập nhật trạng thái hồ sơ sang Resolved
        petition.Status = PetitionStatus.Resolved;
        petition.ResolvedAt = DateTime.UtcNow;
        petition.ResolutionSummary = request.ConclusionText.Trim();

        // 7. Ghi vết nhật ký Audit Trail
        var history = new PetitionHistory
        {
            PetitionId = petition.Id,
            FromStatus = oldStatus,
            ToStatus = PetitionStatus.Resolved,
            Action = "Ban hành kết luận xử lý & quyết định chính thức",
            Note = string.IsNullOrWhiteSpace(request.DocumentNumber)
                ? $"Kết luận: {request.ConclusionText.Trim()}"
                : $"Số hiệu văn bản: {request.DocumentNumber.Trim()}. Kết luận: {request.ConclusionText.Trim()}",
            PerformedByUserId = _currentUser.UserId,
            PerformedByName = officerName
        };
        _context.PetitionHistories.Add(history);

        await _context.SaveChangesAsync(cancellationToken);

        // 8. Bắn thông báo real-time tới cán bộ và live sync trạng thái hoàn tất
        await _notificationService.NotifyPetitionResolvedAsync(
            petition,
            request.ConclusionText.Trim(),
            request.DocumentNumber?.Trim(),
            cancellationToken);

        // 9. Gửi Email thông báo kết quả giải quyết chính thức cho công dân
        if (!string.IsNullOrWhiteSpace(petition.CitizenEmail))
        {
            await _emailService.SendPetitionResolutionEmailAsync(
                petition.CitizenEmail,
                petition.CitizenName ?? "Quý công dân",
                petition.TrackingCode,
                petition.Title,
                request.ConclusionText.Trim(),
                request.DocumentNumber?.Trim(),
                petition.ResolvedAt ?? DateTime.UtcNow,
                cancellationToken);
        }

        // 10. Trả về DTO kết quả
        return new PetitionResolutionDto
        {
            Id = resolution.Id,
            ConclusionText = resolution.ConclusionText,
            DocumentNumber = resolution.DocumentNumber,
            OfficialDocumentUrl = resolution.OfficialDocumentUrl,
            ApprovedByName = officerName,
            IssuedAt = resolution.IssuedAt
        };
    }
}
