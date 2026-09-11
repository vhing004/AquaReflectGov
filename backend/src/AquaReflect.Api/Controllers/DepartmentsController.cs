using AquaReflect.Application.Common.Models;
using AquaReflect.Application.Features.Departments.DTOs;
using AquaReflect.Application.Features.Departments.Queries;
using Microsoft.AspNetCore.Mvc;

namespace AquaReflect.Api.Controllers;

public class DepartmentsController : BaseApiController
{
    /// <summary>
    /// Lấy danh sách các cơ quan, đơn vị chuyên môn thụ lý hồ sơ (Chi cục Thủy sản, Thanh tra kiểm ngư...)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<DepartmentDto>>>> GetDepartments(CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetDepartmentsQuery(), cancellationToken);
        return HandleResult(result);
    }
}
