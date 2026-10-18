using System.Security.Cryptography;
using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Common.Security;
using AquaReflect.Domain.Entities;
using AquaReflect.Domain.Enums;
using AquaReflect.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AquaReflect.Application.Features.Petitions.Commands.WithdrawPetition;

/// <summary>
/// Handler xử lý rút phản ánh kiến nghị.
/// State Machine: Submitted → Withdrawn | Assigned → Withdrawn
/// Điều kiện: Người định danh sở hữu đơn HOẶC người vô danh cung cấp PIN đúng.
/// </summary>
public class WithdrawPetitionCommandHandler : IRequestHandler<WithdrawPetitionCommand, WithdrawPetitionResultDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly INotificationService _notificationService;
    private readonly ILogger<WithdrawPetitionCommandHandler> _logger;

    // Các trạng thái cho phép rút đơn
    private static readonly HashSet<PetitionStatus> AllowedWithdrawStatuses =
        [PetitionStatus.Submitted, PetitionStatus.Assigned];

    public WithdrawPetitionCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        INotificationService notificationService,
        ILogger<WithdrawPetitionCommandHandler> logger)
    {
        _context = context;
        _currentUser = currentUser;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<WithdrawPetitionResultDto> Handle(
        WithdrawPetitionCommand request, CancellationToken cancellationToken)
    {
        // 1. Tải hồ sơ
        var petition = await _context.Petitions
            .FirstOrDefaultAsync(
                p => p.TrackingCode == request.TrackingCode.Trim().ToUpperInvariant() && !p.IsDeleted,
                cancellationToken);

        if (petition == null)
            throw new NotFoundException($"Không tìm thấy hồ sơ phản ánh với mã tra cứu: {request.TrackingCode}");

        // 2. Kiểm tra trạng thái cho phép rút đơn
        if (!AllowedWithdrawStatuses.Contains(petition.Status))
        {
            throw new BadRequestException(
                $"Hồ sơ đang ở trạng thái '{GetStatusName(petition.Status)}' — không thể rút đơn. " +
                "Chỉ có thể rút đơn khi hồ sơ chưa được phân công xử lý hoặc mới phân công.");
        }

        // 3. Xác thực quyền rút đơn
        if (petition.IsAnonymous)
        {
            // Đơn vô danh: bắt buộc cung cấp PIN để xác thực
            if (string.IsNullOrWhiteSpace(request.AccessPin))
                throw new BadRequestException("Đơn phản ánh ẩn danh yêu cầu mã PIN bảo mật để thực hiện rút đơn.");

            if (string.IsNullOrWhiteSpace(petition.AccessPinHash))
                throw new BadRequestException("Hồ sơ này không có mã PIN bảo mật. Vui lòng liên hệ bộ phận hỗ trợ.");

            var inputPinHash = HashPin(request.AccessPin.Trim());
            // So sánh timing-safe để tránh tấn công timing attack
            if (!CryptographicOperations.FixedTimeEquals(
                    System.Text.Encoding.UTF8.GetBytes(inputPinHash),
                    System.Text.Encoding.UTF8.GetBytes(petition.AccessPinHash)))
            {
                _logger.LogWarning(
                    "Xác thực PIN rút đơn thất bại cho hồ sơ {TrackingCode}", petition.TrackingCode);
                throw new BadRequestException("Mã PIN bảo mật không chính xác. Vui lòng kiểm tra lại.");
            }
        }
        else
        {
            // Đơn định danh: cán bộ (Dispatcher/SuperAdmin) hoặc chính người tạo đơn
            var isCitizenOwner = _currentUser.IsAuthenticated
                && _currentUser.UserId.HasValue
                && petition.CreatedBy == _currentUser.UserId.Value.ToString();

            var isStaff = _currentUser.IsAuthenticated
                && _currentUser.Role.HasValue
                && _currentUser.Role.Value is UserRole.Dispatcher or UserRole.SuperAdmin;

            if (!isCitizenOwner && !isStaff)
            {
                throw new ForbiddenException(
                    "Bạn không có quyền rút đơn này. Chỉ người tạo đơn hoặc cán bộ điều phối mới có thể thực hiện.");
            }
        }

        // 4. Thực hiện chuyển trạng thái
        var previousStatus = petition.Status;
        var now = DateTime.UtcNow;

        petition.Status = PetitionStatus.Withdrawn;
        petition.WithdrawnAt = now;
        petition.WithdrawnReason = InputSanitizer.SanitizePlainText(request.Reason) ?? "Người dân yêu cầu rút đơn.";
        petition.UpdatedAt = now;
        petition.LastModifiedBy = _currentUser.IsAuthenticated
            ? (_currentUser.Username ?? _currentUser.UserId?.ToString() ?? "citizen")
            : "Công dân (Ẩn danh)";

        // 5. Ghi Audit Trail
        var performerName = petition.IsAnonymous ? "Công dân (Ẩn danh)" : (petition.CitizenName ?? "Công dân");
        if (_currentUser.IsAuthenticated && _currentUser.UserId.HasValue)
        {
            var userEntity = await _context.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == _currentUser.UserId.Value, cancellationToken);
            if (userEntity != null)
                performerName = userEntity.FullName ?? performerName;
        }

        var history = new PetitionHistory
        {
            Id = Guid.NewGuid(),
            PetitionId = petition.Id,
            FromStatus = previousStatus,
            ToStatus = PetitionStatus.Withdrawn,
            Action = "Rút phản ánh kiến nghị",
            Note = $"Lý do: {petition.WithdrawnReason}",
            PerformedByUserId = _currentUser.UserId,
            PerformedByName = performerName,
            CreatedAt = now
        };

        _context.PetitionHistories.Add(history);
        await _context.SaveChangesAsync(cancellationToken);

        // 6. Thông báo SignalR cho Dispatcher/SuperAdmin
        await _notificationService.NotifyPetitionStatusChangedAsync(
            petition,
            previousStatus,
            PetitionStatus.Withdrawn,
            $"Hồ sơ {petition.TrackingCode} đã được rút bởi người gửi.",
            cancellationToken);

        _logger.LogInformation(
            "Rút đơn thành công: {TrackingCode} ({PreviousStatus} → Withdrawn) bởi {Performer}",
            petition.TrackingCode, previousStatus, performerName);

        return new WithdrawPetitionResultDto
        {
            PetitionId = petition.Id,
            TrackingCode = petition.TrackingCode,
            PreviousStatus = GetStatusName(previousStatus),
            NewStatus = "Đã rút đơn",
            WithdrawnAt = now,
            Message = $"Hồ sơ {petition.TrackingCode} đã được rút thành công. Cảm ơn Quý công dân đã sử dụng hệ thống."
        };
    }

    private static string HashPin(string pin)
    {
        var bytes = System.Text.Encoding.UTF8.GetBytes(pin);
        var hash = SHA256.HashData(bytes);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private static string GetStatusName(PetitionStatus status) => status switch
    {
        PetitionStatus.Submitted   => "Mới tiếp nhận",
        PetitionStatus.Assigned    => "Đã phân công",
        PetitionStatus.Investigating => "Đang xử lý",
        PetitionStatus.Resolved    => "Đã giải quyết",
        PetitionStatus.Rejected    => "Từ chối thụ lý",
        PetitionStatus.Closed      => "Đã đóng",
        PetitionStatus.Withdrawn   => "Đã rút đơn",
        PetitionStatus.NeedInfo    => "Chờ bổ sung thông tin",
        PetitionStatus.Merged      => "Đã gộp (Trùng lặp)",
        PetitionStatus.Forwarded   => "Đã chuyển cơ quan",
        _ => status.ToString()
    };
}
