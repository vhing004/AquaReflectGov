using AquaReflect.Api.Extensions;
using AquaReflect.Application.Common.Models;
using AquaReflect.Application.Features.Auth.Commands.ChangePassword;
using AquaReflect.Application.Features.Auth.Commands.Login;
using AquaReflect.Application.Features.Auth.Commands.RefreshToken;
using AquaReflect.Application.Features.Auth.Commands.Register;
using AquaReflect.Application.Features.Auth.DTOs;
using AquaReflect.Application.Features.Auth.Queries.GetCurrentUser;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AquaReflect.Api.Controllers;

public class AuthController : BaseApiController
{
    /// <summary>
    /// Đăng nhập tài khoản cán bộ hoặc người dân
    /// </summary>
    [HttpPost("login")]
    [EnableRateLimiting(RateLimiterExtensions.AuthPolicy)]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login(
        [FromBody] LoginCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Đăng ký tài khoản người dân / ngư dân mới
    /// </summary>
    [HttpPost("register")]
    [EnableRateLimiting(RateLimiterExtensions.AuthPolicy)]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Register(
        [FromBody] RegisterCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Làm mới phiên đăng nhập qua Refresh Token
    /// </summary>
    [HttpPost("refresh-token")]
    [EnableRateLimiting(RateLimiterExtensions.AuthPolicy)]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> RefreshToken(
        [FromBody] RefreshTokenCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Đổi mật khẩu cho người dùng hiện tại
    /// </summary>
    [Authorize]
    [HttpPost("change-password")]
    public async Task<ActionResult<ApiResponse<bool>>> ChangePassword(
        [FromBody] ChangePasswordCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Lấy thông tin tài khoản và phân quyền của phiên đăng nhập hiện tại
    /// </summary>
    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<UserInfoDto>>> GetCurrentUser(CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetCurrentUserQuery(), cancellationToken);
        return HandleResult(result);
    }
}
