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
    private readonly IWorkingDaysService _workingDaysService;
    private readonly INotificationService _notificationService;
    private readonly IEmailService _emailService;

    private static readonly string[] AllowedExtensions = { ".pdf", ".docx", ".doc", ".jpg", ".jpeg", ".png", ".webp", ".mp4" };
    private const long MaxFileSize = 25 * 1024 * 1024; // 25MB

    public UpdatePetitionResolutionCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IFileStorageService fileStorage,
        IWorkingDaysService workingDaysService,
        INotificationService notificationService,
        IEmailService emailService)
    {
        _context = context;
        _currentUser = currentUser;
        _fileStorage = fileStorage;
        _workingDaysService = workingDaysService;
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

        if (role == UserRole.Dispatcher)
            throw new ForbiddenException("Bộ phận Điều phối không có quyền ban hành kết luận xử lý. Chức năng này dành cho Cán bộ chuyên trách thụ lý (Specialist) hoặc Quản trị viên.");

        if (string.IsNullOrWhiteSpace(request.ConclusionText))
            throw new ValidationException("Nội dung kết luận giải quyết không được để trống.");

        // 2. Tìm hồ sơ phản ánh
        var petition = await _context.Petitions
            .Include(p => p.Resolution)
            .Include(p => p.Attachments)
            .FirstOrDefaultAsync(p => p.Id == request.PetitionId && !p.IsDeleted, cancellationToken);

        if (petition == null)
            throw new NotFoundException($"Không tìm thấy hồ sơ phản ánh với ID: {request.PetitionId}");

        // 3. Quy trình tuần tự: Chỉ được ban hành hoặc cập nhật kết luận khi hồ sơ đang Thẩm tra hoặc đã Giải quyết
        if (petition.Status != PetitionStatus.Investigating && petition.Status != PetitionStatus.Resolved)
        {
            throw new BadRequestException("Chỉ được ban hành kết luận giải quyết khi hồ sơ đang trong giai đoạn Thẩm tra (Investigating) hoặc đã Giải quyết (Resolved).");
        }

        // 4. Specialist chỉ được giải quyết hồ sơ thuộc phòng ban mình
        if (role == UserRole.Specialist)
        {
            if (!_currentUser.DepartmentId.HasValue || petition.DepartmentId != _currentUser.DepartmentId)
            {
                throw new ForbiddenException("Bạn không có quyền ban hành kết luận cho hồ sơ này vì hồ sơ không thuộc thẩm quyền phòng ban bạn.");
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

        // 5. Lưu tệp văn bản quyết định chính thức nếu có
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

        // 6. Lưu tệp minh chứng khắc phục / hiện trường hoàn trả mặt bằng / biên bản xử phạt nếu có
        if (request.EvidenceFiles != null && request.EvidenceFiles.Count > 0)
        {
            if (request.EvidenceFiles.Count > 5)
                throw new ValidationException("Chỉ được đính kèm tối đa 5 tệp minh chứng kết quả xử lý.");

            foreach (var evFile in request.EvidenceFiles)
            {
                if (evFile.Length > MaxFileSize)
                    throw new ValidationException($"Kích thước tệp '{evFile.FileName}' vượt quá 25MB.");

                var ext = Path.GetExtension(evFile.FileName).ToLowerInvariant();
                if (!AllowedExtensions.Contains(ext))
                    throw new ValidationException($"Định dạng tệp '{evFile.FileName}' không được hỗ trợ.");

                var saveEvResult = await _fileStorage.SaveFileAsync(evFile, "resolutions/evidences", cancellationToken);

                var fileType = AttachmentType.Document;
                if (ext is ".jpg" or ".jpeg" or ".png" or ".webp")
                    fileType = AttachmentType.Image;
                else if (ext is ".mp4" or ".mov" or ".webm")
                    fileType = AttachmentType.Video;

                var attachment = new PetitionAttachment
                {
                    Id = Guid.NewGuid(),
                    PetitionId = petition.Id,
                    FileName = Path.GetFileName(saveEvResult.FileUrl),
                    OriginalFileName = evFile.FileName,
                    FileUrl = saveEvResult.FileUrl,
                    FileType = fileType,
                    MimeType = evFile.ContentType,
                    FileSize = evFile.Length,
                    IsDeleted = false,
                    CreatedAt = DateTime.UtcNow
                };
                _context.PetitionAttachments.Add(attachment);
            }
        }

        var oldStatus = petition.Status;

        var sanitizedConclusion = InputSanitizer.SanitizeRichText(request.ConclusionText);
        var sanitizedDocumentNumber = InputSanitizer.SanitizePlainText(request.DocumentNumber);
        var sanitizedPublicSummary = !string.IsNullOrWhiteSpace(request.PublicSummary)
            ? InputSanitizer.SanitizePlainText(request.PublicSummary)
            : sanitizedConclusion;

        // 7. Cập nhật hoặc tạo mới PetitionResolution
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

        // 8. Cập nhật trạng thái hồ sơ sang Resolved & chốt mốc thời gian SLA
        var now = DateTime.UtcNow;
        petition.Status = PetitionStatus.Resolved;
        petition.ResolvedAt = now;
        petition.ConclusionType = request.ConclusionType;
        petition.ResolutionSummary = sanitizedConclusion;
        petition.PublicSummary = sanitizedPublicSummary;

        // Đánh giá trạng thái SLA có tính đến thời gian tạm dừng (NeedInfo)
        var (isOverdue, _) = _workingDaysService.EvaluateSlaStatus(
            petition.DueDate, 
            petition.ResolvedAt, 
            petition.TotalSlaPausedMinutes, 
            null);

        string conclusionTypeName = request.ConclusionType switch
        {
            ConclusionType.Valid => "Đúng sự thật",
            ConclusionType.PartiallyValid => "Đúng một phần",
            ConclusionType.InsufficientEvidence => "Không đủ căn cứ / Sai sự thật",
            _ => "Đã xác minh"
        };

        string slaResultText = isOverdue ? "Quá hạn SLA" : "Đúng hạn SLA";

        // 9. Ghi vết nhật ký Audit Trail
        var historyNote = string.IsNullOrWhiteSpace(request.DocumentNumber)
            ? $"[{conclusionTypeName} - {slaResultText}] Kết luận: {sanitizedConclusion}"
            : $"[{conclusionTypeName} - {slaResultText}] Số hiệu: {request.DocumentNumber.Trim()}. Kết luận: {sanitizedConclusion}";

        var history = new PetitionHistory
        {
            PetitionId = petition.Id,
            FromStatus = oldStatus,
            ToStatus = PetitionStatus.Resolved,
            Action = "Ban hành kết luận xử lý & quyết định chính thức",
            Note = historyNote,
            PerformedByUserId = _currentUser.UserId,
            PerformedByName = officerName
        };
        _context.PetitionHistories.Add(history);

        await _context.SaveChangesAsync(cancellationToken);

        // 10. Bắn thông báo real-time tới cán bộ và live sync trạng thái hoàn tất
        await _notificationService.NotifyPetitionResolvedAsync(
            petition,
            sanitizedConclusion,
            request.DocumentNumber?.Trim(),
            cancellationToken);

        // 11. Gửi Email thông báo kết quả giải quyết chính thức cho công dân
        if (!string.IsNullOrWhiteSpace(petition.CitizenEmail))
        {
            await _emailService.SendPetitionResolutionEmailAsync(
                petition.CitizenEmail,
                petition.CitizenName ?? "Quý công dân",
                petition.TrackingCode,
                petition.Title,
                sanitizedConclusion,
                request.DocumentNumber?.Trim(),
                petition.ResolvedAt ?? DateTime.UtcNow,
                cancellationToken);
        }

        // 12. Trả về DTO kết quả
        return new PetitionResolutionDto
        {
            Id = resolution.Id,
            ConclusionText = resolution.ConclusionText,
            DocumentNumber = resolution.DocumentNumber,
            OfficialDocumentUrl = resolution.OfficialDocumentUrl,
            ApprovedByName = officerName,
            IssuedAt = resolution.IssuedAt,
            ConclusionType = (int)request.ConclusionType,
            ConclusionTypeName = conclusionTypeName,
            PublicSummary = sanitizedPublicSummary,
            IsResolvedOnTime = !isOverdue
        };
    }
}

