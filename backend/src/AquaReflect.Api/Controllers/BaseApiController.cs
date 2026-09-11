using AquaReflect.Application.Common.Models;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AquaReflect.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    private ISender? _mediator;

    protected ISender Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<ISender>();

    protected ActionResult<ApiResponse<T>> HandleResult<T>(ApiResponse<T> result)
    {
        return result.StatusCode switch
        {
            200 => Ok(result),
            201 => StatusCode(201, result),
            400 => BadRequest(result),
            401 => Unauthorized(result),
            403 => StatusCode(403, result),
            404 => NotFound(result),
            _ => StatusCode(result.StatusCode, result)
        };
    }
}
