using AquaReflect.Application.Common.Models;
using AquaReflect.Application.Features.AdministrativeUnits.DTOs;
using AquaReflect.Application.Features.AdministrativeUnits.Queries;
using Microsoft.AspNetCore.Mvc;

namespace AquaReflect.Api.Controllers;

public class AdministrativeUnitsController : BaseApiController
{
    /// <summary>
    /// Lấy danh sách đơn vị hành chính (Tỉnh, Huyện, Xã) phục vụ chọn vị trí phản ánh
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<AdministrativeUnitDto>>>> GetUnits(
        [FromQuery] int? parentId,
        [FromQuery] int? level,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetAdministrativeUnitsQuery(parentId, level), cancellationToken);
        return HandleResult(result);
    }
}
