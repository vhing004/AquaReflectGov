using AquaReflect.Application.Common.Models;
using AquaReflect.Application.Features.Notifications.Commands;
using AquaReflect.Application.Features.Notifications.DTOs;
using AquaReflect.Application.Features.Notifications.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AquaReflect.Api.Controllers;

/// <summary>
/// API quản lý thông báo nội bộ dành cho cán bộ
/// </summary>
[Authorize(Roles = "SuperAdmin,Dispatcher,Specialist")]
public class NotificationsController : BaseApiController
{
    /// <summary>
    /// Lấy danh sách thông báo và số lượng chưa đọc của cán bộ hiện tại
    /// </summary>
    /// <param name="unreadOnly">Lọc chỉ lấy thông báo chưa đọc</param>
    /// <param name="pageIndex">Số trang (mặc định 1)</param>
    /// <param name="pageSize">Số bản ghi mỗi trang (mặc định 20)</param>
    /// <param name="cancellationToken">CancellationToken</param>
    /// <returns>Danh sách thông báo phân trang kèm số lượng chưa đọc</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<NotificationListResultDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<NotificationListResultDto>>> GetNotifications(
        [FromQuery] bool? unreadOnly,
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = new GetNotificationsQuery(unreadOnly, pageIndex, pageSize);
        var result = await Mediator.Send(query, cancellationToken);
        return HandleResult(ApiResponse<NotificationListResultDto>.Ok(result, "Lấy danh sách thông báo thành công."));
    }

    /// <summary>
    /// Đánh dấu một thông báo cụ thể là đã đọc
    /// </summary>
    /// <param name="id">ID thông báo</param>
    /// <param name="cancellationToken">CancellationToken</param>
    [HttpPut("{id:guid}/read")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<bool>>> MarkAsRead(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new MarkNotificationAsReadCommand(id), cancellationToken);
        return HandleResult(ApiResponse<bool>.Ok(result, "Đã đánh dấu thông báo là đã đọc."));
    }

    /// <summary>
    /// Đánh dấu tất cả thông báo của cán bộ là đã đọc
    /// </summary>
    /// <param name="cancellationToken">CancellationToken</param>
    [HttpPut("read-all")]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<int>>> MarkAllAsRead(CancellationToken cancellationToken)
    {
        var count = await Mediator.Send(new MarkAllNotificationsAsReadCommand(), cancellationToken);
        return HandleResult(ApiResponse<int>.Ok(count, $"Đã đánh dấu {count} thông báo là đã đọc."));
    }
}
