using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Features.Gis.DTOs;
using AquaReflect.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Application.Features.Gis.Queries.GetSpatialSummary;

/// <summary>
/// Query tổng hợp số liệu thống kê không gian theo đơn vị hành chính và chuyên mục
/// </summary>
public record GetSpatialSummaryQuery(
    DateTime? FromDate = null,
    DateTime? ToDate = null
) : IRequest<SpatialSummaryResultDto>;

public class GetSpatialSummaryQueryHandler : IRequestHandler<GetSpatialSummaryQuery, SpatialSummaryResultDto>
{
    private readonly IApplicationDbContext _context;

    public GetSpatialSummaryQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<SpatialSummaryResultDto> Handle(GetSpatialSummaryQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Petitions
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.AdministrativeUnit)
            .Where(p => !p.IsDeleted && p.Latitude.HasValue && p.Longitude.HasValue);

        if (request.FromDate.HasValue)
            query = query.Where(p => p.CreatedAt >= DateTime.SpecifyKind(request.FromDate.Value, DateTimeKind.Utc));

        if (request.ToDate.HasValue)
            query = query.Where(p => p.CreatedAt <= DateTime.SpecifyKind(request.ToDate.Value, DateTimeKind.Utc));

        var petitions = await query
            .Select(p => new
            {
                p.Id,
                p.AdministrativeUnitId,
                AdministrativeUnitName = p.AdministrativeUnit != null ? p.AdministrativeUnit.Name : "Chưa xác định",
                AdministrativeUnitCode = p.AdministrativeUnit != null ? p.AdministrativeUnit.Code : "UNKNOWN",
                CategoryId = p.Category.Id,
                CategoryName = p.Category.Name,
                p.Category.CategoryType,
                p.Status,
                p.PriorityLevel,
                p.Latitude,
                p.Longitude,
                p.DueDate,
                p.CreatedAt
            })
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;
        var totalCount = petitions.Count;

        // 1. Thống kê theo từng Đơn vị hành chính
        var districtGroups = petitions
            .GroupBy(p => p.AdministrativeUnitId ?? 0)
            .Select(g =>
            {
                var first = g.First();
                var items = g.ToList();

                var avgLat = items.Where(x => x.Latitude.HasValue).Select(x => x.Latitude!.Value).DefaultIfEmpty(0).Average();
                var avgLng = items.Where(x => x.Longitude.HasValue).Select(x => x.Longitude!.Value).DefaultIfEmpty(0).Average();

                return new DistrictSpatialSummaryDto
                {
                    AdministrativeUnitId = g.Key,
                    DistrictCode = first.AdministrativeUnitCode,
                    DistrictName = first.AdministrativeUnitName,
                    TotalCount = items.Count,
                    SubmittedCount = items.Count(x => x.Status == PetitionStatus.Submitted),
                    InProgressCount = items.Count(x => x.Status == PetitionStatus.Assigned || x.Status == PetitionStatus.Investigating),
                    ResolvedCount = items.Count(x => x.Status == PetitionStatus.Resolved),
                    OverdueCount = items.Count(x => x.DueDate.HasValue && x.DueDate.Value < now && x.Status != PetitionStatus.Resolved && x.Status != PetitionStatus.Closed),
                    IuuCount = items.Count(x => x.CategoryType == PetitionCategoryType.IUUFishing),
                    DiseaseCount = items.Count(x => x.CategoryType == PetitionCategoryType.AquaticDisease),
                    PollutionCount = items.Count(x => x.CategoryType == PetitionCategoryType.WaterPollution),
                    OtherCount = items.Count(x => x.CategoryType != PetitionCategoryType.IUUFishing &&
                                                 x.CategoryType != PetitionCategoryType.AquaticDisease &&
                                                 x.CategoryType != PetitionCategoryType.WaterPollution),
                    CenterLat = avgLat > 0 ? Math.Round(avgLat, 6) : null,
                    CenterLng = avgLng > 0 ? Math.Round(avgLng, 6) : null
                };
            })
            .OrderByDescending(d => d.TotalCount)
            .ToList();

        // 2. Thống kê theo Chuyên mục phản ánh
        var categoryGroups = petitions
            .GroupBy(p => new { p.CategoryId, p.CategoryName, p.CategoryType })
            .Select(g => new CategorySpatialCountDto
            {
                CategoryId = g.Key.CategoryId,
                CategoryName = g.Key.CategoryName,
                CategoryType = g.Key.CategoryType.ToString(),
                Count = g.Count(),
                Percentage = totalCount > 0 ? Math.Round((double)g.Count() / totalCount * 100, 1) : 0
            })
            .OrderByDescending(c => c.Count)
            .ToList();

        return new SpatialSummaryResultDto
        {
            TotalPetitionsWithLocation = totalCount,
            TotalDistrictsCovered = districtGroups.Count,
            DistrictSummaries = districtGroups,
            CategoryDistribution = categoryGroups
        };
    }
}
