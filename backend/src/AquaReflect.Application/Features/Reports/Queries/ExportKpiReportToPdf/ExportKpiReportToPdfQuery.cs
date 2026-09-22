using AquaReflect.Domain.Enums;
using MediatR;

namespace AquaReflect.Application.Features.Reports.Queries.ExportKpiReportToPdf;

/// <summary>
/// Query xuất báo cáo KPI tổng hợp ra file PDF
/// </summary>
public record ExportKpiReportToPdfQuery(
    int Days,
    Guid? DepartmentId
) : IRequest<byte[]>;
