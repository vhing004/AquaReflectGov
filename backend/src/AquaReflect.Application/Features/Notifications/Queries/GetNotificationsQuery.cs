using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Features.Notifications.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Application.Features.Notifications.Queries;

public record GetNotificationsQuery(
    bool? UnreadOnly = null,
    int PageIndex = 1,
    int PageSize = 20
) : IRequest<NotificationListResultDto>;

public class GetNotificationsQueryHandler : IRequestHandler<GetNotificationsQuery, NotificationListResultDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetNotificationsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<NotificationListResultDto> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId;
        var deptId = _currentUser.DepartmentId;
        var role = _currentUser.Role;

        // Xây dựng điều kiện truy vấn thông báo liên quan đến cán bộ
        var query = _context.Notifications
            .AsNoTracking()
            .Where(n => !n.IsDeleted)
            .Where(n =>
                (userId.HasValue && n.TargetUserId == userId.Value) ||
                (deptId.HasValue && n.TargetDepartmentId == deptId.Value) ||
                (role.HasValue && n.TargetRole == role.Value) ||
                (!n.TargetUserId.HasValue && !n.TargetDepartmentId.HasValue && !n.TargetRole.HasValue)
            );

        // Đếm tổng số chưa đọc
        var unreadCount = await query
            .Where(n => !n.IsRead)
            .CountAsync(cancellationToken);

        if (request.UnreadOnly == true)
        {
            query = query.Where(n => !n.IsRead);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var pageIndex = Math.Max(1, request.PageIndex);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new NotificationDto
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
                TimeAgo = FormatTimeAgo(n.CreatedAt)
            })
            .ToListAsync(cancellationToken);

        return new NotificationListResultDto
        {
            Items = items,
            TotalCount = totalCount,
            UnreadCount = unreadCount,
            PageIndex = pageIndex,
            PageSize = pageSize
        };
    }

    private static string FormatTimeAgo(DateTime createdAt)
    {
        var span = DateTime.UtcNow - createdAt;
        if (span.TotalMinutes < 1) return "Vừa xong";
        if (span.TotalMinutes < 60) return $"{(int)span.TotalMinutes} phút trước";
        if (span.TotalHours < 24) return $"{(int)span.TotalHours} giờ trước";
        if (span.TotalDays < 7) return $"{(int)span.TotalDays} ngày trước";
        return createdAt.ToString("dd/MM/yyyy HH:mm");
    }
}
