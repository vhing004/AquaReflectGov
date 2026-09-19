using AquaReflect.Application.Common.Models;
using AquaReflect.Application.Features.Petitions.Queries.GetAdminPetitionList;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AquaReflect.Api.Controllers;

/// <summary>
/// API điều hành và quản lý hồ sơ nghiệp vụ dành riêng cho cán bộ (Dispatcher, Specialist, SuperAdmin)
/// </summary>
[Authorize(Roles = "SuperAdmin,Dispatcher,Specialist")]
public class AdminController : BaseApiController
{
    /// <summary>
    /// Lấy danh sách hồ sơ phân trang với bộ lọc đa tiêu chí (từ khóa, trạng thái, phòng ban, mức ưu tiên, quá hạn, thời gian...)
    /// </summary>
    /// <param name="query">Các tham số lọc, sắp xếp và phân trang</param>
    /// <param name="cancellationToken">CancellationToken</param>
    /// <returns>Danh sách hồ sơ phân trang kèm siêu dữ liệu</returns>
    [HttpGet("petitions")]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResult<AdminPetitionListItemDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<PaginatedResult<AdminPetitionListItemDto>>>> GetPetitions(
        [FromQuery] GetAdminPetitionListQuery query,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(query, cancellationToken);
        return HandleResult(ApiResponse<PaginatedResult<AdminPetitionListItemDto>>.Ok(result, "Lấy danh sách hồ sơ thành công."));
    }
}
