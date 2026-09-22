using AquaReflect.Domain.Enums;
using MediatR;

namespace AquaReflect.Application.Features.Reports.Queries.ExportPetitionsToExcel;

/// <summary>
/// Query xuất danh sách phản ánh kiến nghị ra file Excel (.xlsx)
/// </summary>
public record ExportPetitionsToExcelQuery(
    DateTime? StartDate,
    DateTime? EndDate,
    Guid? DepartmentId,
    PetitionStatus? Status
) : IRequest<byte[]>;
