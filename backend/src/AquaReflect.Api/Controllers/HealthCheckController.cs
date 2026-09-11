using AquaReflect.Application.Common.Models;
using Microsoft.AspNetCore.Mvc;

namespace AquaReflect.Api.Controllers;

public class HealthCheckController : BaseApiController
{
    [HttpGet]
    public ActionResult<ApiResponse<object>> Get()
    {
        var status = new
        {
            Status = "Healthy",
            Service = "AquaReflect API (Phản ánh Kiến nghị Thủy sản)",
            Version = "1.0.0",
            ServerTime = DateTime.UtcNow,
            Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"
        };

        return HandleResult(ApiResponse<object>.Ok(status, "Hệ thống đang hoạt động bình thường."));
    }
}
