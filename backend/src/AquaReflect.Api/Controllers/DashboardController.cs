using AquaReflect.Application.Common.Models;
using AquaReflect.Application.Features.Dashboard.DTOs;
using AquaReflect.Application.Features.Dashboard.Queries.GetDashboardKpi;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AquaReflect.Api.Controllers;

/// <summary>
/// API báo cáo thống kê và phân tích KPI điều hành dành cho Lãnh đạo và Cán bộ chuyên môn
/// </summary>
[Authorize(Roles = "SuperAdmin,Dispatcher,Specialist")]
public class DashboardController : BaseApiController
{
    /// <summary>
    /// Lấy báo cáo tổng hợp Dashboard KPI bao gồm: Chỉ số tổng thể, Xu hướng ngày, Cơ cấu chuyên mục, Xếp hạng phòng ban và Chỉ số hài lòng CSAT
    /// </summary>
    /// <param name="days">Khoảng thời gian thống kê (mặc định 30 ngày; 7, 30, 90, 365, hoặc 0 là toàn bộ)</param>
    /// <param name="departmentId">Lọc theo phòng ban phụ trách (tùy chọn)</param>
    /// <param name="cancellationToken">CancellationToken</param>
    /// <returns>Báo cáo tổng hợp DashboardReportDto</returns>
    [HttpGet("kpi")]
    [ProducesResponseType(typeof(ApiResponse<DashboardReportDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<DashboardReportDto>>> GetKpiReport(
        [FromQuery] int days = 30,
        [FromQuery] Guid? departmentId = null,
        CancellationToken cancellationToken = default)
    {
        var query = new GetDashboardKpiQuery(days, departmentId);
        var result = await Mediator.Send(query, cancellationToken);
        return HandleResult(ApiResponse<DashboardReportDto>.Ok(result, "Lấy báo cáo KPI thành công."));
    }
}
