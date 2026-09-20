using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Features.Notifications.DTOs;
using AquaReflect.Domain.Entities;
using AquaReflect.Domain.Enums;
using AquaReflect.Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace AquaReflect.Infrastructure.Services;

/// <summary>
/// Triển khai dịch vụ thông báo thời gian thực qua SignalR kết hợp lưu trữ cơ sở dữ liệu
/// </summary>
public class SignalRNotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly IApplicationDbContext _context;
    private readonly ILogger<SignalRNotificationService> _logger;

    public SignalRNotificationService(
        IHubContext<NotificationHub> hubContext,
        IApplicationDbContext context,
        ILogger<SignalRNotificationService> logger)
    {
        _hubContext = hubContext;
        _context = context;
        _logger = logger;
    }

    public async Task NotifyNewPetitionAsync(Petition petition, CancellationToken cancellationToken = default)
    {
        try
        {
            var title = $"Đơn phản ánh mới: {petition.TrackingCode}";
            var content = $"Công dân đã nộp phản ánh '{petition.Title}' tại địa bàn {petition.AddressText}. Hạn SLA: {petition.DueDate:dd/MM/yyyy HH:mm}.";

            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                Title = title,
                Content = content,
                Type = NotificationType.NewPetition,
                TargetRole = UserRole.Dispatcher,
                PetitionId = petition.Id,
                TrackingCode = petition.TrackingCode,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync(cancellationToken);

            var dto = MapToDto(notification);

            // Bắn thông báo real-time tới nhóm cán bộ trực ban (dispatchers)
            await _hubContext.Clients.Group("dispatchers").SendAsync("ReceiveNotification", dto, cancellationToken);

            // Phát tín hiệu sự kiện đơn mới tạo tới toàn thể cán bộ để cập nhật bảng Kanban / Danh sách
            await _hubContext.Clients.Group("officers").SendAsync("PetitionCreated", new
            {
                PetitionId = petition.Id,
                TrackingCode = petition.TrackingCode,
                Title = petition.Title,
                PriorityLevel = petition.PriorityLevel.ToString(),
                Status = petition.Status.ToString(),
                CreatedAt = petition.CreatedAt,
                DueDate = petition.DueDate
            }, cancellationToken);

            _logger.LogInformation("SignalR: Đã gửi thông báo đơn mới {TrackingCode} đến nhóm dispatchers.", petition.TrackingCode);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SignalR: Lỗi khi gửi thông báo đơn mới {TrackingCode}.", petition.TrackingCode);
        }
    }

    public async Task NotifyPetitionStatusChangedAsync(
        Petition petition,
        PetitionStatus previousStatus,
        PetitionStatus newStatus,
        string? note,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var newStatusName = GetStatusName(newStatus);
            var title = $"Hồ sơ {petition.TrackingCode} chuyển trạng thái";
            var content = $"Hồ sơ đã chuyển sang trạng thái '{newStatusName}'. {(string.IsNullOrWhiteSpace(note) ? string.Empty : $"Ghi chú: {note}")}";

            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                Title = title,
                Content = content,
                Type = NotificationType.StatusChanged,
                TargetDepartmentId = petition.DepartmentId,
                TargetUserId = petition.AssignedUserId,
                PetitionId = petition.Id,
                TrackingCode = petition.TrackingCode,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync(cancellationToken);

            var dto = MapToDto(notification);

            // Gửi thông báo đến phòng ban thụ lý
            if (petition.DepartmentId.HasValue)
            {
                await _hubContext.Clients.Group($"dept_{petition.DepartmentId}").SendAsync("ReceiveNotification", dto, cancellationToken);
            }

            // Gửi thông báo đích danh tới chuyên viên thụ lý
            if (petition.AssignedUserId.HasValue)
            {
                await _hubContext.Clients.Group($"user_{petition.AssignedUserId}").SendAsync("ReceiveNotification", dto, cancellationToken);
            }

            // Phát tín hiệu cập nhật trạng thái chung để live sync Kanban
            await _hubContext.Clients.Group("officers").SendAsync("PetitionStatusChanged", new
            {
                PetitionId = petition.Id,
                TrackingCode = petition.TrackingCode,
                PreviousStatus = (int)previousStatus,
                NewStatus = (int)newStatus,
                NewStatusName = newStatusName,
                DepartmentId = petition.DepartmentId,
                AssignedUserId = petition.AssignedUserId
            }, cancellationToken);

            _logger.LogInformation("SignalR: Đã phát thông báo chuyển trạng thái {TrackingCode} sang {NewStatus}.", petition.TrackingCode, newStatus);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SignalR: Lỗi khi phát thông báo chuyển trạng thái {TrackingCode}.", petition.TrackingCode);
        }
    }

    public async Task NotifyPetitionAssignedAsync(
        Petition petition,
        User assignedOfficer,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var title = $"Bạn được phân công xử lý hồ sơ: {petition.TrackingCode}";
            var content = $"Bạn vừa được phân công chủ trì xác minh, xử lý phản ánh '{petition.Title}'. Hạn chót xử lý: {petition.DueDate:dd/MM/yyyy HH:mm}.";

            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                Title = title,
                Content = content,
                Type = NotificationType.PetitionAssigned,
                TargetUserId = assignedOfficer.Id,
                PetitionId = petition.Id,
                TrackingCode = petition.TrackingCode,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync(cancellationToken);

            var dto = MapToDto(notification);

            // Bắn trực tiếp cho chuyên viên được phân công
            await _hubContext.Clients.Group($"user_{assignedOfficer.Id}").SendAsync("ReceiveNotification", dto, cancellationToken);

            _logger.LogInformation("SignalR: Đã gửi thông báo phân công hồ sơ {TrackingCode} tới cán bộ {Officer}.", petition.TrackingCode, assignedOfficer.FullName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SignalR: Lỗi khi gửi thông báo phân công hồ sơ {TrackingCode}.", petition.TrackingCode);
        }
    }

    public async Task NotifyPetitionResolvedAsync(
        Petition petition,
        string conclusionText,
        string? documentNumber,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var title = $"Hồ sơ {petition.TrackingCode} đã có kết quả giải quyết";
            var content = $"Hồ sơ đã được phê duyệt kết quả thụ lý. {(string.IsNullOrWhiteSpace(documentNumber) ? string.Empty : $"Số văn bản: {documentNumber}. ")}Kết luận: {conclusionText}";

            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                Title = title,
                Content = content,
                Type = NotificationType.ResolutionPublished,
                TargetDepartmentId = petition.DepartmentId,
                PetitionId = petition.Id,
                TrackingCode = petition.TrackingCode,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync(cancellationToken);

            var dto = MapToDto(notification);

            // Bắn cho phòng ban và cán bộ trực ban
            await _hubContext.Clients.Group("dispatchers").SendAsync("ReceiveNotification", dto, cancellationToken);
            if (petition.DepartmentId.HasValue)
            {
                await _hubContext.Clients.Group($"dept_{petition.DepartmentId}").SendAsync("ReceiveNotification", dto, cancellationToken);
            }

            await _hubContext.Clients.Group("officers").SendAsync("PetitionResolved", new
            {
                PetitionId = petition.Id,
                TrackingCode = petition.TrackingCode,
                ResolvedAt = petition.ResolvedAt,
                DocumentNumber = documentNumber
            }, cancellationToken);

            _logger.LogInformation("SignalR: Đã phát thông báo hoàn tất thụ lý hồ sơ {TrackingCode}.", petition.TrackingCode);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SignalR: Lỗi khi phát thông báo hoàn tất thụ lý hồ sơ {TrackingCode}.", petition.TrackingCode);
        }
    }

    public async Task NotifyNewCommentAsync(
        Petition petition,
        PetitionComment comment,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var title = $"Ý kiến mới trong hồ sơ {petition.TrackingCode}";
            var content = $"{comment.AuthorName} vừa ghi nhận ý kiến xử lý: {(comment.Content.Length > 100 ? comment.Content[..100] + "..." : comment.Content)}";

            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                Title = title,
                Content = content,
                Type = NotificationType.NewComment,
                TargetDepartmentId = petition.DepartmentId,
                TargetUserId = petition.AssignedUserId,
                PetitionId = petition.Id,
                TrackingCode = petition.TrackingCode,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync(cancellationToken);

            var dto = MapToDto(notification);

            // Gửi cho chuyên viên thụ lý
            if (petition.AssignedUserId.HasValue)
            {
                await _hubContext.Clients.Group($"user_{petition.AssignedUserId}").SendAsync("ReceiveNotification", dto, cancellationToken);
            }

            // Phát thông báo thêm ý kiến tới cán bộ đang xem chi tiết hồ sơ
            await _hubContext.Clients.Group("officers").SendAsync("NewCommentAdded", new
            {
                PetitionId = petition.Id,
                CommentId = comment.Id,
                AuthorName = comment.AuthorName,
                CreatedAt = comment.CreatedAt
            }, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SignalR: Lỗi khi gửi thông báo ý kiến mới trong hồ sơ {TrackingCode}.", petition.TrackingCode);
        }
    }

    private static NotificationDto MapToDto(Notification n) => new()
    {
        Id = n.Id,
        Title = n.Title,
        Content = n.Content,
        Type = n.Type.ToString(),
        PetitionId = n.PetitionId,
        TrackingCode = n.TrackingCode,
        IsRead = n.IsRead,
        ReadAt = n.ReadAt,
        CreatedAt = n.CreatedAt,
        TimeAgo = "Vừa xong"
    };

    private static string GetStatusName(PetitionStatus status) => status switch
    {
        PetitionStatus.Submitted => "Mới tiếp nhận",
        PetitionStatus.Assigned => "Đã phân công",
        PetitionStatus.Investigating => "Đang xử lý",
        PetitionStatus.Resolved => "Đã giải quyết",
        PetitionStatus.Rejected => "Từ chối thụ lý",
        PetitionStatus.Closed => "Đã đóng",
        _ => status.ToString()
    };
}
