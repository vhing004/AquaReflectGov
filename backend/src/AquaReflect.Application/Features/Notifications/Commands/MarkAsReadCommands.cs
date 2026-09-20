using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Application.Features.Notifications.Commands;

public record MarkNotificationAsReadCommand(Guid NotificationId) : IRequest<bool>;

public class MarkNotificationAsReadCommandHandler : IRequestHandler<MarkNotificationAsReadCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public MarkNotificationAsReadCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(MarkNotificationAsReadCommand request, CancellationToken cancellationToken)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == request.NotificationId && !n.IsDeleted, cancellationToken);

        if (notification == null)
            throw new NotFoundException($"Không tìm thấy thông báo với ID: {request.NotificationId}");

        if (!notification.IsRead)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
        }

        return true;
    }
}

public record MarkAllNotificationsAsReadCommand : IRequest<int>;

public class MarkAllNotificationsAsReadCommandHandler : IRequestHandler<MarkAllNotificationsAsReadCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public MarkAllNotificationsAsReadCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<int> Handle(MarkAllNotificationsAsReadCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId;
        var deptId = _currentUser.DepartmentId;
        var role = _currentUser.Role;

        var unreadNotifications = await _context.Notifications
            .Where(n => !n.IsDeleted && !n.IsRead)
            .Where(n =>
                (userId.HasValue && n.TargetUserId == userId.Value) ||
                (deptId.HasValue && n.TargetDepartmentId == deptId.Value) ||
                (role.HasValue && n.TargetRole == role.Value) ||
                (!n.TargetUserId.HasValue && !n.TargetDepartmentId.HasValue && !n.TargetRole.HasValue)
            )
            .ToListAsync(cancellationToken);

        if (unreadNotifications.Count == 0)
            return 0;

        var now = DateTime.UtcNow;
        foreach (var item in unreadNotifications)
        {
            item.IsRead = true;
            item.ReadAt = now;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return unreadNotifications.Count;
    }
}
