namespace AquaReflect.Application.Features.Dashboard.DTOs;

/// <summary>
/// Báo cáo tổng thể Dashboard KPI phục vụ điều hành
/// </summary>
public class DashboardReportDto
{
    public DashboardKpiSummaryDto KpiSummary { get; set; } = new();
    public List<PetitionTrendItemDto> TrendData { get; set; } = [];
    public List<CategoryStatItemDto> CategoryDistribution { get; set; } = [];
    public List<DepartmentPerformanceDto> DepartmentPerformance { get; set; } = [];
    public SatisfactionStatDto Satisfaction { get; set; } = new();
}
