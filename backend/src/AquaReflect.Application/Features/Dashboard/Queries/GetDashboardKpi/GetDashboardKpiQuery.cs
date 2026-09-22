using AquaReflect.Application.Features.Dashboard.DTOs;
using MediatR;

namespace AquaReflect.Application.Features.Dashboard.Queries.GetDashboardKpi;

/// <summary>
/// Query lấy báo cáo tổng thể Dashboard KPI
/// </summary>
/// <param name="Days">Khoảng thời gian thống kê (mặc định 30 ngày; 7, 30, 90, 365, hoặc 0 là toàn bộ)</param>
/// <param name="DepartmentId">Lọc theo phòng ban phụ trách (tùy chọn)</param>
public record GetDashboardKpiQuery(int Days = 30, Guid? DepartmentId = null) : IRequest<DashboardReportDto>;
