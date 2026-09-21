using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Features.Gis.DTOs;
using AquaReflect.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Application.Features.Gis.Queries.GetHeatmapData;

/// <summary>
/// Query lấy tập dữ liệu điểm nhiệt tối ưu hóa dung lượng (Heatmap Data)
/// </summary>
public record GetHeatmapDataQuery(
    PetitionCategoryType? CategoryType = null,
    PetitionStatus? Status = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null,
    int Limit = 1000
) : IRequest<HeatmapDataResultDto>;

public class GetHeatmapDataQueryHandler : IRequestHandler<GetHeatmapDataQuery, HeatmapDataResultDto>
{
    private readonly IApplicationDbContext _context;

    public GetHeatmapDataQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<HeatmapDataResultDto> Handle(GetHeatmapDataQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Petitions
            .AsNoTracking()
            .Include(p => p.Category)
            .Where(p => !p.IsDeleted && p.Latitude.HasValue && p.Longitude.HasValue);

        if (request.CategoryType.HasValue)
            query = query.Where(p => p.Category.CategoryType == request.CategoryType.Value);

        if (request.Status.HasValue)
            query = query.Where(p => p.Status == request.Status.Value);

        if (request.FromDate.HasValue)
            query = query.Where(p => p.CreatedAt >= DateTime.SpecifyKind(request.FromDate.Value, DateTimeKind.Utc));

        if (request.ToDate.HasValue)
            query = query.Where(p => p.CreatedAt <= DateTime.SpecifyKind(request.ToDate.Value, DateTimeKind.Utc));

        var limit = Math.Clamp(request.Limit, 1, 3000);

        var pointsData = await query
            .OrderByDescending(p => p.CreatedAt)
            .Take(limit)
            .Select(p => new
            {
                Latitude = p.Latitude!.Value,
                Longitude = p.Longitude!.Value,
                p.PriorityLevel,
                p.Category.CategoryType,
                p.TrackingCode
            })
            .ToListAsync(cancellationToken);

        var points = pointsData.Select(p =>
        {
            var weight = CalculateIntensityWeight(p.PriorityLevel, p.CategoryType);
            return new HeatmapPointDto
            {
                Latitude = Math.Round(p.Latitude, 6),
                Longitude = Math.Round(p.Longitude, 6),
                Weight = weight,
                CategoryType = p.CategoryType.ToString(),
                TrackingCode = p.TrackingCode
            };
        }).ToList();

        return new HeatmapDataResultDto
        {
            TotalPoints = points.Count,
            MaxWeight = 1.0,
            Points = points
        };
    }

    /// <summary>
    /// Chuẩn hóa trọng số nhiệt từ 0.1 đến 1.0 dựa trên mức ưu tiên và loại sự vụ
    /// </summary>
    private static double CalculateIntensityWeight(PriorityLevel priority, PetitionCategoryType categoryType)
    {
        var baseWeight = priority switch
        {
            PriorityLevel.Urgent => 0.9,
            PriorityLevel.High => 0.7,
            PriorityLevel.Normal => 0.45,
            _ => 0.45
        };

        // Gia số đối với các vấn đề nhạy cảm đặc thù ngành thủy sản
        var bonus = categoryType switch
        {
            PetitionCategoryType.IUUFishing => 0.1,      // Vi phạm vùng biển quốc tế cần cảnh báo đỏ
            PetitionCategoryType.AquaticDisease => 0.1,  // Dịch bệnh lây lan nhanh
            PetitionCategoryType.WaterPollution => 0.05, // Ô nhiễm nguồn nước diện rộng
            _ => 0.0
        };

        return Math.Min(1.0, Math.Round(baseWeight + bonus, 2));
    }
}
