using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Features.Petitions.DTOs;
using AquaReflect.Domain.Entities;
using AquaReflect.Domain.Enums;
using AquaReflect.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AquaReflect.Application.Features.Petitions.Commands.AddInspectionNote;

/// <summary>
/// Handler xử lý ghi chú nghiệp vụ hiện trường kèm ảnh biên bản (Task 4.1).
/// Chỉ dành cho Chuyên viên (Specialist) hoặc SuperAdmin đang thụ lý hồ sơ
/// ở trạng thái Assigned hoặc Investigating.
/// </summary>
public class AddInspectionNoteCommandHandler : IRequestHandler<AddInspectionNoteCommand, InspectionNoteResultDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IFileStorageService _fileStorageService;
    private readonly INotificationService _notificationService;
    private readonly ILogger<AddInspectionNoteCommandHandler> _logger;

    public AddInspectionNoteCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IFileStorageService fileStorageService,
        INotificationService notificationService,
        ILogger<AddInspectionNoteCommandHandler> logger)
    {
        _context = context;
        _currentUser = currentUser;
        _fileStorageService = fileStorageService;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<InspectionNoteResultDto> Handle(AddInspectionNoteCommand request, CancellationToken cancellationToken)
    {
        // 1. Xác thực quyền: Chỉ Specialist hoặc SuperAdmin
        if (!_currentUser.IsAuthenticated)
            throw new UnauthorizedAccessException("Vui lòng đăng nhập để ghi chú nghiệp vụ hiện trường.");

        var role = _currentUser.Role;
        if (role == UserRole.Citizen || role == null)
            throw new ForbiddenException("Chức năng ghi chú hiện trường chỉ dành cho cán bộ thụ lý.");

        // 2. Tải hồ sơ từ DB với tệp đính kèm hiện có
        var petition = await _context.Petitions
            .Include(p => p.Attachments.Where(a => !a.IsDeleted))
            .Include(p => p.Department)
            .FirstOrDefaultAsync(p => p.Id == request.PetitionId && !p.IsDeleted, cancellationToken);

        if (petition == null)
            throw new NotFoundException($"Không tìm thấy hồ sơ phản ánh với ID: {request.PetitionId}");

        // 3. Kiểm tra phạm vi quyền của Specialist
        if (role == UserRole.Specialist)
        {
            if (!_currentUser.DepartmentId.HasValue || petition.DepartmentId != _currentUser.DepartmentId.Value)
                throw new ForbiddenException("Bạn chỉ có quyền ghi chú cho hồ sơ được phân công về phòng ban của mình.");
        }

        // 4. Kiểm tra trạng thái hợp lệ (Assigned hoặc Investigating)
        if (petition.Status != PetitionStatus.Assigned && petition.Status != PetitionStatus.Investigating)
        {
            throw new BadRequestException(
                $"Ghi chú hiện trường chỉ áp dụng khi hồ sơ đang ở trạng thái 'Đã phân công' hoặc 'Đang xử lý'. " +
                $"Trạng thái hiện tại: {petition.Status}.");
        }

        // 5. Lấy tên hiển thị của cán bộ
        string authorName = _currentUser.Username ?? "Cán bộ thụ lý";
        if (_currentUser.UserId.HasValue)
        {
            var currentUserEntity = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == _currentUser.UserId.Value, cancellationToken);
            if (currentUserEntity != null && !string.IsNullOrWhiteSpace(currentUserEntity.FullName))
                authorName = currentUserEntity.FullName;
        }

        // 6. Chuẩn bị nội dung ghi chú với tiền tố loại
        var noteTypeName = request.NoteType switch
        {
            InspectionNoteType.SiteVisitReport    => "📋 Biên bản kiểm tra hiện trường",
            InspectionNoteType.EvidenceCollection => "🔍 Thu thập mẫu & chứng cứ hiện trường",
            InspectionNoteType.InternalNote       => "📝 Ghi chú nội bộ",
            _                                     => "🏞️ Quan sát thực địa"
        };

        var gpsNote = request.FieldLatitude.HasValue && request.FieldLongitude.HasValue
            ? $"\n📍 GPS hiện trường: {request.FieldLatitude:F6}°N, {request.FieldLongitude:F6}°E"
            : string.Empty;

        var fullContent = $"[{noteTypeName}]\n{request.NoteContent.Trim()}{gpsNote}";

        // 7. Tạo PetitionComment ghi chú nội bộ hiện trường
        var comment = new PetitionComment
        {
            Id = Guid.NewGuid(),
            PetitionId = petition.Id,
            AuthorUserId = _currentUser.UserId,
            AuthorName = authorName,
            IsInternal = true,
            Content = fullContent,
            CreatedAt = DateTime.UtcNow
        };

        _context.PetitionComments.Add(comment);

        // 8. Lưu tệp đính kèm hiện trường (ảnh, video, biên bản PDF)
        var newAttachmentDtos = new List<PetitionAttachmentDto>();
        if (request.Files != null && request.Files.Count > 0)
        {
            if (request.Files.Count > 5)
                throw new BadRequestException("Mỗi lần ghi chú chỉ được đính kèm tối đa 5 tệp từ hiện trường.");

            foreach (var file in request.Files)
            {
                var uploadResult = await _fileStorageService.SaveFileAsync(file, "petitions/inspection", cancellationToken);

                var attachment = new PetitionAttachment
                {
                    Id = Guid.NewGuid(),
                    PetitionId = petition.Id,
                    FileName = uploadResult.FileName,
                    OriginalFileName = uploadResult.OriginalFileName,
                    FileUrl = uploadResult.FileUrl,
                    FileType = uploadResult.FileType,
                    MimeType = uploadResult.MimeType,
                    FileSize = uploadResult.FileSize
                };

                petition.Attachments.Add(attachment);

                newAttachmentDtos.Add(new PetitionAttachmentDto
                {
                    Id = attachment.Id,
                    FileName = attachment.FileName,
                    OriginalFileName = attachment.OriginalFileName,
                    FileUrl = attachment.FileUrl,
                    FileType = attachment.FileType.ToString(),
                    MimeType = attachment.MimeType,
                    FileSize = attachment.FileSize
                });
            }
        }

        // 9. Cập nhật thời gian chỉnh sửa hồ sơ
        petition.UpdatedAt = DateTime.UtcNow;
        petition.LastModifiedBy = _currentUser.Username ?? _currentUser.UserId?.ToString();

        await _context.SaveChangesAsync(cancellationToken);

        // 10. Phát thông báo real-time tới cán bộ liên quan
        await _notificationService.NotifyNewCommentAsync(petition, comment, cancellationToken);

        _logger.LogInformation(
            "Cán bộ {AuthorName} ghi chú hiện trường [{NoteType}] cho hồ sơ {TrackingCode}, đính kèm {Count} tệp.",
            authorName, noteTypeName, petition.TrackingCode, newAttachmentDtos.Count);

        return new InspectionNoteResultDto
        {
            CommentId = comment.Id,
            PetitionId = petition.Id,
            TrackingCode = petition.TrackingCode,
            AuthorName = authorName,
            NoteContent = request.NoteContent,
            NoteTypeName = noteTypeName,
            FieldLatitude = request.FieldLatitude,
            FieldLongitude = request.FieldLongitude,
            AttachmentsAdded = newAttachmentDtos.Count,
            Attachments = newAttachmentDtos,
            CreatedAt = comment.CreatedAt,
            Message = $"Đã ghi chú [{noteTypeName}] cho hồ sơ {petition.TrackingCode}" +
                      (newAttachmentDtos.Count > 0 ? $" kèm {newAttachmentDtos.Count} tệp đính kèm." : ".")
        };
    }
}
