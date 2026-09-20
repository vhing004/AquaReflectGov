using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace AquaReflect.Infrastructure.Hubs;

/// <summary>
/// Hub SignalR quản lý kết nối thời gian thực cho hệ thống thông báo AquaReflect
/// </summary>
[Authorize]
public class NotificationHub : Hub
{
    private readonly ILogger<NotificationHub> _logger;

    public NotificationHub(ILogger<NotificationHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var user = Context.User;
        if (user != null)
        {
            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = user.FindFirst(ClaimTypes.Role)?.Value;
            var departmentId = user.FindFirst("departmentId")?.Value;

            // 1. Gia nhập nhóm toàn bộ cán bộ
            await Groups.AddToGroupAsync(Context.ConnectionId, "officers");

            // 2. Gia nhập nhóm trực ban tiếp nhận nếu là Dispatcher hoặc SuperAdmin
            if (role == "Dispatcher" || role == "SuperAdmin")
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "dispatchers");
            }

            // 3. Gia nhập nhóm phòng ban chuyên môn nếu có
            if (!string.IsNullOrEmpty(departmentId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"dept_{departmentId}");
            }

            // 4. Gia nhập nhóm cá nhân cán bộ
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
            }

            _logger.LogInformation(
                "SignalR: Cán bộ {UserId} (Role: {Role}, Dept: {DeptId}) kết nối thành công với ConnectionId {ConnectionId}.",
                userId, role, departmentId, Context.ConnectionId);
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation(
            "SignalR: Kết nối {ConnectionId} đã ngắt kết nối.",
            Context.ConnectionId);

        await base.OnDisconnectedAsync(exception);
    }
}
