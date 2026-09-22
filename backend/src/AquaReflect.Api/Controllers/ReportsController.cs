using AquaReflect.Application.Features.Reports.Queries.ExportKpiReportToPdf;
using AquaReflect.Application.Features.Reports.Queries.ExportPetitionsToExcel;
using AquaReflect.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AquaReflect.Api.Controllers;

/// <summary>
/// API xuất báo cáo định dạng Excel và PDF phục vụ báo cáo điều hành
/// </summary>
[Authorize(Roles = "SuperAdmin,Dispatcher,Specialist")]
public class ReportsController : BaseApiController
{
    private const string ExcelMimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    private const string PdfMimeType = "application/pdf";

    /// <summary>
    /// Xuất danh sách phản ánh kiến nghị ra file Excel (.xlsx)
    /// </summary>
    /// <param name="startDate">Ngày bắt đầu (tùy chọn, định dạng yyyy-MM-dd)</param>
    /// <param name="endDate">Ngày kết thúc (tùy chọn, định dạng yyyy-MM-dd)</param>
    /// <param name="departmentId">Lọc theo phòng ban phụ trách (tùy chọn)</param>
    /// <param name="status">Lọc theo trạng thái (tùy chọn)</param>
    /// <param name="cancellationToken">CancellationToken</param>
    [HttpGet("petitions/excel")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ExportPetitionsToExcel(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] Guid? departmentId = null,
        [FromQuery] PetitionStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        var query = new ExportPetitionsToExcelQuery(startDate, endDate, departmentId, status);
        var fileBytes = await Mediator.Send(query, cancellationToken);

        var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmm");
        var fileName = $"BaoCao_PhanAnh_{timestamp}.xlsx";

        return File(fileBytes, ExcelMimeType, fileName);
    }

    /// <summary>
    /// Xuất báo cáo tổng hợp KPI điều hành ra file PDF
    /// </summary>
    /// <param name="days">Khoảng thời gian thống kê (mặc định 30 ngày; 0 là toàn bộ)</param>
    /// <param name="departmentId">Lọc theo phòng ban phụ trách (tùy chọn)</param>
    /// <param name="cancellationToken">CancellationToken</param>
    [HttpGet("kpi/pdf")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ExportKpiReportToPdf(
        [FromQuery] int days = 30,
        [FromQuery] Guid? departmentId = null,
        CancellationToken cancellationToken = default)
    {
        var query = new ExportKpiReportToPdfQuery(days, departmentId);
        var fileBytes = await Mediator.Send(query, cancellationToken);

        var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmm");
        var fileName = $"BaoCao_KPI_{days}ngay_{timestamp}.pdf";

        return File(fileBytes, PdfMimeType, fileName);
    }
}
