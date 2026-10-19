using System.Security.Cryptography;
using System.Text;
using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Common.Security;
using AquaReflect.Application.Features.Petitions.DTOs;
using AquaReflect.Domain.Entities;
using AquaReflect.Domain.Enums;
using AquaReflect.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AquaReflect.Application.Features.Petitions.Commands.SubmitAdditionalInfo;

/// <summary>
/// Handler xử lý tiếp nhận thông tin / tài liệu bổ sung từ công dân (NeedInfo -> unpause SLA).
/// </summary>
public class SubmitAdditionalInfoCommandHandler : IRequestHandler<SubmitAdditionalInfoCommand, SubmitAdditionalInfoResultDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IFileStorageService _fileStorageService;
    private readonly INotificationService _notificationService;
    private readonly ILogger<SubmitAdditionalInfoCommandHandler> _logger;

    public SubmitAdditionalInfoCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IFileStorageService fileStorageService,
        INotificationService notificationService,
        ILogger<SubmitAdditionalInfoCommandHandler> logger)
    {
        _context = context;
        _currentUser = currentUser;
        _fileStorageService = fileStorageService;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<SubmitAdditionalInfoResultDto> Handle(
        SubmitAdditionalInfoCommand request, CancellationToken cancellationToken)
    {
        // 1. Tải hồ sơ kèm tệp đính kèm
        var cleanTrackingCode = request.TrackingCode.Trim().ToUpperInvariant();
        var petition = await _context.Petitions
            .Include(p => p.Attachments)
            .FirstOrDefaultAsync(p => p.TrackingCode == cleanTrackingCode && !p.IsDeleted, cancellationToken);

        if (petition == null)
        {
            throw new NotFoundException($"Không tìm thấy hồ sơ phản ánh với mã tra cứu: {request.TrackingCode}");
        }

        // 2. Kiểm tra trạng thái hiện tại (bắt buộc phải là NeedInfo)
        if (petition.Status != PetitionStatus.NeedInfo)
        {
            throw new BadRequestException(
                $"Hồ sơ đang ở trạng thái '{GetStatusDisplayName(petition.Status)}', không trong giai đoạn yêu cầu bổ sung thông tin.");
        }

        // 3. Kiểm tra hạn chót bổ sung thông tin
        if (petition.NeedInfoDeadline.HasValue && DateTime.UtcNow > petition.NeedInfoDeadline.Value)
        {
            throw new BadRequestException(
                $"Hồ sơ đã hết thời hạn bổ sung thông tin quy định ({petition.NeedInfoDeadline.Value:dd/MM/yyyy HH:mm} UTC). " +
                "Vui lòng liên hệ cơ quan tiếp nhận để được hướng dẫn xử lý.");
        }

        // 4. Xác thực bảo mật quyền bổ sung
        if (petition.IsAnonymous)
        {
            if (string.IsNullOrWhiteSpace(request.AccessPin))
            {
                throw new BadRequestException("Hồ sơ ẩn danh bắt buộc phải cung cấp mã PIN bảo mật để gửi bổ sung thông tin.");
            }

            if (string.IsNullOrWhiteSpace(petition.AccessPinHash))
            {
                throw new BadRequestException("Hồ sơ này không có mã PIN bảo mật đã đăng ký. Vui lòng liên hệ bộ phận hỗ trợ.");
            }

            var inputPinHash = HashPin(request.AccessPin.Trim());
            if (!CryptographicOperations.FixedTimeEquals(
                    Encoding.UTF8.GetBytes(inputPinHash),
                    Encoding.UTF8.GetBytes(petition.AccessPinHash)))
            {
                _logger.LogWarning("Xác thực PIN bổ sung hồ sơ thất bại cho đơn {TrackingCode}", petition.TrackingCode);
                throw new BadRequestException("Mã PIN bảo mật không chính xác. Vui lòng kiểm tra lại.");
            }
        }
        else
        {
            var isOwnerUser = _currentUser.IsAuthenticated
                && _currentUser.UserId.HasValue
                && petition.CreatedBy == _currentUser.UserId.Value.ToString();

            var isStaff = _currentUser.IsAuthenticated
                && _currentUser.Role.HasValue
                && _currentUser.Role.Value is UserRole.Dispatcher or UserRole.SuperAdmin;

            // Kiểm tra số điện thoại người gửi nếu người dùng tra cứu công khai không đăng nhập
            var isPhoneMatched = false;
            if (!string.IsNullOrWhiteSpace(request.CitizenPhone) && !string.IsNullOrWhiteSpace(petition.CitizenPhone))
            {
                var inputPhone = request.CitizenPhone.Trim().Replace(" ", "").Replace(".", "").Replace("-", "");
                var dbPhone = petition.CitizenPhone.Trim().Replace(" ", "").Replace(".", "").Replace("-", "");
                isPhoneMatched = dbPhone.EndsWith(inputPhone) || inputPhone.EndsWith(dbPhone);
            }

            if (!isOwnerUser && !isStaff && !isPhoneMatched)
            {
                throw new ForbiddenException(
                    "Bạn không có quyền bổ sung thông tin cho hồ sơ này. " +
                    "Vui lòng đăng nhập đúng tài khoản nộp đơn hoặc cung cấp số điện thoại đã đăng ký.");
            }
        }

        // 5. Lưu các tệp đính kèm mới (ảnh, video, tài liệu)
        var newAttachmentDtos = new List<PetitionAttachmentDto>();
        if (request.Files != null && request.Files.Count > 0)
        {
            foreach (var file in request.Files)
            {
                var uploadResult = await _fileStorageService.SaveFileAsync(file, "petitions", cancellationToken);

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

        // 6. Tự động unpause SLA và tính dồn số phút tạm dừng
        var previousStatus = petition.Status;
        var now = DateTime.UtcNow;

        if (petition.SlaPausedAt.HasValue)
        {
            var pausedMinutes = (now - petition.SlaPausedAt.Value).TotalMinutes;
            if (pausedMinutes > 0)
            {
                petition.TotalSlaPausedMinutes += pausedMinutes;
            }
            petition.SlaPausedAt = null;
        }

        // 7. Chuyển trạng thái về trạng thái trước đó
        var newStatus = (petition.AssignedUserId.HasValue || petition.DepartmentId.HasValue)
            ? PetitionStatus.Assigned
            : PetitionStatus.Submitted;

        petition.Status = newStatus;
        petition.UpdatedAt = now;

        var sanitizedContent = InputSanitizer.SanitizePlainText(request.AdditionalContent) ?? string.Empty;
        var actorName = petition.IsAnonymous
            ? "Công dân (Ẩn danh)"
            : (_currentUser.IsAuthenticated ? (_currentUser.Username ?? _currentUser.UserId?.ToString() ?? "Công dân") : (petition.CitizenName ?? "Công dân"));

        petition.LastModifiedBy = actorName;

        // 8. Ghi vết lịch sử (Audit Trail)
        var historyNote = $"Công dân đã gửi thông tin bổ sung: \"{sanitizedContent}\"";
        if (newAttachmentDtos.Count > 0)
        {
            historyNote += $" (Đính kèm {newAttachmentDtos.Count} tệp minh chứng)";
        }

        var history = new PetitionHistory
        {
            Id = Guid.NewGuid(),
            PetitionId = petition.Id,
            FromStatus = previousStatus,
            ToStatus = newStatus,
            Action = "CitizenSubmitAdditionalInfo",
            Note = historyNote,
            PerformedByUserId = _currentUser.UserId,
            PerformedByName = actorName,
            CreatedAt = now
        };

        _context.PetitionHistories.Add(history);

        // 9. Lưu vào Cơ sở dữ liệu
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Công dân đã bổ sung thông tin thành công cho hồ sơ {TrackingCode}. Chuyển trạng thái từ {PrevStatus} sang {NewStatus}. Đã đính kèm {FilesCount} tệp.",
            petition.TrackingCode, previousStatus, newStatus, newAttachmentDtos.Count);

        // 10. Bắn thông báo thời gian thực SignalR tới cán bộ thụ lý / Dispatcher
        await _notificationService.NotifyPetitionStatusChangedAsync(
            petition,
            previousStatus,
            newStatus,
            $"{actorName} đã cung cấp thông tin/tệp minh chứng bổ sung cho hồ sơ {petition.TrackingCode}. Hồ sơ được mở lại xử lý.",
            cancellationToken);

        // 11. Trả về kết quả
        return new SubmitAdditionalInfoResultDto
        {
            PetitionId = petition.Id,
            TrackingCode = petition.TrackingCode,
            PreviousStatus = (int)previousStatus,
            PreviousStatusName = GetStatusDisplayName(previousStatus),
            NewStatus = (int)newStatus,
            NewStatusName = GetStatusDisplayName(newStatus),
            TotalSlaPausedMinutes = Math.Round(petition.TotalSlaPausedMinutes, 1),
            NewAttachmentsCount = newAttachmentDtos.Count,
            Attachments = newAttachmentDtos,
            Message = "Bổ sung thông tin và tệp đính kèm thành công. Hồ sơ đã được chuyển lại cho cán bộ chuyên trách tiếp tục xử lý.",
            SubmittedAt = now
        };
    }

    private static string HashPin(string pin)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(pin.ToUpperInvariant()));
        return Convert.ToHexString(bytes);
    }

    private static string GetStatusDisplayName(PetitionStatus status) => status switch
    {
        PetitionStatus.Submitted => "Mới tiếp nhận (Chờ phân loại)",
        PetitionStatus.Assigned => "Đã chuyển giao đơn vị xử lý",
        PetitionStatus.Investigating => "Đang thẩm tra & Khảo sát thực địa",
        PetitionStatus.Resolved => "Đã ban hành quyết định giải quyết",
        PetitionStatus.Rejected => "Từ chối thụ lý",
        PetitionStatus.Closed => "Đã hoàn tất đóng hồ sơ",
        PetitionStatus.Withdrawn => "Đã rút đơn",
        PetitionStatus.NeedInfo => "Yêu cầu bổ sung thông tin",
        PetitionStatus.Merged => "Gộp vào hồ sơ trùng lặp",
        PetitionStatus.Forwarded => "Đã chuyển cơ quan thẩm quyền",
        _ => status.ToString()
    };
}
