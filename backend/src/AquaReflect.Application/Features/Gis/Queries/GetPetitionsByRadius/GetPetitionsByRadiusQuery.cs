using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Features.Gis.DTOs;
using AquaReflect.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Application.Features.Gis.Queries.GetPetitionsByRadius;

/// <summary>
/// Query tìm kiếm các phản ánh lân cận theo bán kính không gian (Spatial Proximity / Radius Search)
/// </summary>
public record GetPetitionsByRadiusQuery(
    double CenterLat,
    double CenterLng,
    double RadiusKm = 10.0,
    PetitionCategoryType? CategoryType = null,
    PetitionStatus? Status = null,
    int MaxResults = 50
) : IRequest<SpatialRadiusResultDto>;

public class GetPetitionsByRadiusQueryHandler : IRequestHandler<GetPetitionsByRadiusQuery, SpatialRadiusResultDto>
{
    private readonly IApplicationDbContext _context;

    public GetPetitionsByRadiusQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<SpatialRadiusResultDto> Handle(GetPetitionsByRadiusQuery request, CancellationToken cancellationToken)
    {
        var radiusKm = Math.Clamp(request.RadiusKm, 0.1, 200.0);
        var maxResults = Math.Clamp(request.MaxResults, 1, 200);

        // 1. Tính toán Bounding Box thô để lọc nhanh bằng Index CSDL trước
        // 1 độ vĩ độ xấp xỉ 111 km
        var latDelta = radiusKm / 111.0;
        var minLat = request.CenterLat - latDelta;
        var maxLat = request.CenterLat + latDelta;

        // 1 độ kinh độ xấp xỉ 111 * cos(vĩ độ) km
        var radLat = request.CenterLat * Math.PI / 180.0;
        var cosLat = Math.Cos(radLat);
        var lngDelta = cosLat > 0.0001 ? radiusKm / (111.0 * cosLat) : latDelta;
        var minLng = request.CenterLng - lngDelta;
        var maxLng = request.CenterLng + lngDelta;

        // 2. Truy vấn ứng viên sơ bộ từ CSDL với Bounding Box
        var query = _context.Petitions
            .AsNoTracking()
            .Include(p => p.Category)
            .Where(p => !p.IsDeleted && p.Latitude.HasValue && p.Longitude.HasValue)
            .Where(p => p.Latitude >= minLat && p.Latitude <= maxLat &&
                        p.Longitude >= minLng && p.Longitude <= maxLng);

        if (request.CategoryType.HasValue)
            query = query.Where(p => p.Category.CategoryType == request.CategoryType.Value);

        if (request.Status.HasValue)
            query = query.Where(p => p.Status == request.Status.Value);

        var candidates = await query
            .Select(p => new
            {
                p.Id,
                p.TrackingCode,
                p.Title,
                CategoryName = p.Category.Name,
                CategoryType = p.Category.CategoryType.ToString(),
                p.Status,
                p.PriorityLevel,
                p.AddressText,
                Latitude = p.Latitude!.Value,
                Longitude = p.Longitude!.Value,
                p.CreatedAt,
                p.DueDate
            })
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;

        // 3. Tính toán khoảng cách chính xác theo công thức Haversine
        var filteredItems = candidates
            .Select(p =>
            {
                var distance = CalculateHaversineDistanceKm(
                    request.CenterLat, request.CenterLng, p.Latitude, p.Longitude);

                return new
                {
                    Petition = p,
                    DistanceKm = distance
                };
            })
            .Where(x => x.DistanceKm <= radiusKm)
            .OrderBy(x => x.DistanceKm)
            .Take(maxResults)
            .Select(x => new SpatialRadiusItemDto
            {
                Id = x.Petition.Id,
                TrackingCode = x.Petition.TrackingCode,
                Title = x.Petition.Title,
                CategoryName = x.Petition.CategoryName,
                CategoryType = x.Petition.CategoryType,
                Status = x.Petition.Status.ToString(),
                StatusName = GetStatusName(x.Petition.Status),
                PriorityLevel = x.Petition.PriorityLevel.ToString(),
                PriorityName = GetPriorityName(x.Petition.PriorityLevel),
                AddressText = x.Petition.AddressText,
                Latitude = x.Petition.Latitude,
                Longitude = x.Petition.Longitude,
                DistanceKm = Math.Round(x.DistanceKm, 2),
                CreatedAt = x.Petition.CreatedAt,
                IsOverdue = x.Petition.DueDate.HasValue && x.Petition.DueDate.Value < now &&
                            x.Petition.Status != PetitionStatus.Resolved && x.Petition.Status != PetitionStatus.Closed
            })
            .ToList();

        return new SpatialRadiusResultDto
        {
            CenterLatitude = request.CenterLat,
            CenterLongitude = request.CenterLng,
            RadiusKm = radiusKm,
            TotalCount = filteredItems.Count,
            Items = filteredItems
        };
    }

    /// <summary>
    /// Tính khoảng cách giữa 2 tọa độ WGS84 theo công thức Haversine (đơn vị km)
    /// </summary>
    private static double CalculateHaversineDistanceKm(double lat1, double lon1, double lat2, double lon2)
    {
        const double EarthRadiusKm = 6371.0;

        var dLat = (lat2 - lat1) * Math.PI / 180.0;
        var dLon = (lon2 - lon1) * Math.PI / 180.0;

        var rLat1 = lat1 * Math.PI / 180.0;
        var rLat2 = lat2 * Math.PI / 180.0;

        var a = Math.Sin(dLat / 2.0) * Math.Sin(dLat / 2.0) +
                Math.Cos(rLat1) * Math.Cos(rLat2) *
                Math.Sin(dLon / 2.0) * Math.Sin(dLon / 2.0);

        var c = 2.0 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1.0 - a));

        return EarthRadiusKm * c;
    }

    private static string GetStatusName(PetitionStatus status) => status switch
    {
        PetitionStatus.Submitted => "Mới tiếp nhận",
        PetitionStatus.Assigned => "Đã phân công",
        PetitionStatus.Investigating => "Đang xử lý",
        PetitionStatus.Resolved => "Đã giải quyết",
        PetitionStatus.Rejected => "Từ chối thụ lý",
        PetitionStatus.Closed => "Đã đóng",
        _ => status.ToString()
    };

    private static string GetPriorityName(PriorityLevel priority) => priority switch
    {
        PriorityLevel.Normal => "Bình thường",
        PriorityLevel.High => "Ưu tiên cao",
        PriorityLevel.Urgent => "Khẩn cấp",
        _ => priority.ToString()
    };
}
