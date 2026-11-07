using AquaReflect.Application.Common.Models;
using AquaReflect.Application.Features.Users.Commands.CreateUser;
using AquaReflect.Application.Features.Users.Commands.ToggleUserActive;
using AquaReflect.Application.Features.Users.Commands.UpdateUser;
using AquaReflect.Application.Features.Users.DTOs;
using AquaReflect.Application.Features.Users.Queries.GetUserList;
using AquaReflect.Application.Features.Users.Queries.GetUserPetitions;
using AquaReflect.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AquaReflect.Api.Controllers;

public record UpdateUserRequestDto(
    string FullName,
    string? PhoneNumber,
    UserRole Role,
    Guid? DepartmentId,
    bool IsUnitLead,
    string? NewPassword);

[Authorize(Roles = "SuperAdmin")]
public class UsersController : BaseApiController
{
    /// <summary>
    /// Lấy danh sách người dùng toàn hệ thống (phân trang, lọc theo từ khóa, vai trò, phòng ban, trạng thái)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResult<UserListItemDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<PaginatedResult<UserListItemDto>>>> GetUsers(
        [FromQuery] GetUserListQuery query,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(query, cancellationToken);
        return HandleResult(ApiResponse<PaginatedResult<UserListItemDto>>.Ok(result, "Lấy danh sách người dùng thành công."));
    }

    /// <summary>
    /// Lấy danh sách phản ánh do cán bộ thụ lý (lọc: resolved - đã xử lý, active - đang thụ lý, all - tất cả)
    /// </summary>
    [HttpGet("{id:guid}/petitions")]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResult<UserPetitionDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<PaginatedResult<UserPetitionDto>>>> GetUserPetitions(
        Guid id,
        [FromQuery] string? filterType = "resolved",
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var query = new GetUserPetitionsQuery
        {
            UserId = id,
            FilterType = filterType,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
        var result = await Mediator.Send(query, cancellationToken);
        return HandleResult(ApiResponse<PaginatedResult<UserPetitionDto>>.Ok(result, "Lấy danh sách phản ánh của cán bộ thành công."));
    }

    /// <summary>
    /// Tạo mới tài khoản cán bộ hoặc người dùng hệ thống
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<Guid>>> CreateUser(
        [FromBody] CreateUserCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(ApiResponse<Guid>.Ok(result, "Tạo mới tài khoản người dùng thành công."));
    }

    /// <summary>
    /// Cập nhật thông tin cán bộ / người dùng
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateUser(
        Guid id,
        [FromBody] UpdateUserRequestDto dto,
        CancellationToken cancellationToken)
    {
        var command = new UpdateUserCommand(
            id,
            dto.FullName,
            dto.PhoneNumber,
            dto.Role,
            dto.DepartmentId,
            dto.IsUnitLead,
            dto.NewPassword);

        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(ApiResponse<bool>.Ok(result, "Cập nhật thông tin người dùng thành công."));
    }

    /// <summary>
    /// Khóa hoặc kích hoạt lại tài khoản người dùng
    /// </summary>
    [HttpPost("{id:guid}/toggle-active")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<bool>>> ToggleActive(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new ToggleUserActiveCommand(id), cancellationToken);
        var message = result ? "Đã kích hoạt tài khoản thành công." : "Đã khóa tài khoản thành công.";
        return HandleResult(ApiResponse<bool>.Ok(result, message));
    }
}