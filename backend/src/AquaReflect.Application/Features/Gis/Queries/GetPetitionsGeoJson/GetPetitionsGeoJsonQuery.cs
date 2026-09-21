using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Features.Gis.DTOs;
using AquaReflect.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Application.Features.Gis.Queries.GetPetitionsGeoJson;

/// <summary>
/// Query lấy danh sách phản ánh định dạng chuẩn GeoJSON FeatureCollection RFC 7946
/// </summary>
public record GetPetitionsGeoJsonQuery(
    double? MinLat = null,
    double? MaxLat = null,
    double? MinLng = null,
    double? MaxLng = null,
    Guid? CategoryId = null,
    PetitionCategoryType? CategoryType = null,
    PetitionStatus? Status = null,
    PriorityLevel? PriorityLevel = null,
    int? AdministrativeUnitId = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null,
    int Limit = 500
) : IRequest<GeoJsonFeatureCollectionDto>;

public class GetPetitionsGeoJsonQueryHandler : IRequestHandler<GetPetitionsGeoJsonQuery, GeoJsonFeatureCollectionDto>
{
    private readonly IApplicationDbContext _context;

    public GetPetitionsGeoJsonQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<GeoJsonFeatureCollectionDto> Handle(GetPetitionsGeoJsonQuery request, CancellationToken cancellationToken)
    {
        // 1. Khởi tạo truy vấn cơ bản: chỉ lấy các phản ánh có tọa độ hợp lệ
        var query = _context.Petitions
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Department)
            .Include(p => p.AdministrativeUnit)
            .Where(p => !p.IsDeleted && p.Latitude.HasValue && p.Longitude.HasValue);

        // 2. Lọc theo Bounding Box (Viewport Bounds) nếu có
        if (request.MinLat.HasValue)
            query = query.Where(p => p.Latitude >= request.MinLat.Value);
        if (request.MaxLat.HasValue)
            query = query.Where(p => p.Latitude <= request.MaxLat.Value);
        if (request.MinLng.HasValue)
            query = query.Where(p => p.Longitude >= request.MinLng.Value);
        if (request.MaxLng.HasValue)
            query = query.Where(p => p.Longitude <= request.MaxLng.Value);

        // 3. Lọc theo Danh mục
        if (request.CategoryId.HasValue)
            query = query.Where(p => p.CategoryId == request.CategoryId.Value);

        if (request.CategoryType.HasValue)
            query = query.Where(p => p.Category.CategoryType == request.CategoryType.Value);

        // 4. Lọc theo Trạng thái
        if (request.Status.HasValue)
            query = query.Where(p => p.Status == request.Status.Value);

        // 5. Lọc theo Mức độ ưu tiên
        if (request.PriorityLevel.HasValue)
            query = query.Where(p => p.PriorityLevel == request.PriorityLevel.Value);

        // 6. Lọc theo Đơn vị hành chính
        if (request.AdministrativeUnitId.HasValue)
            query = query.Where(p => p.AdministrativeUnitId == request.AdministrativeUnitId.Value);

        // 7. Lọc theo Thời gian tiếp nhận
        if (request.FromDate.HasValue)
            query = query.Where(p => p.CreatedAt >= DateTime.SpecifyKind(request.FromDate.Value, DateTimeKind.Utc));

        if (request.ToDate.HasValue)
            query = query.Where(p => p.CreatedAt <= DateTime.SpecifyKind(request.ToDate.Value, DateTimeKind.Utc));

        // 8. Đếm tổng số điểm thỏa mãn điều kiện
        var totalCount = await query.CountAsync(cancellationToken);

        // 9. Giới hạn số lượng điểm trả về tối đa (mặc định 500, tối đa 2000)
        var limit = Math.Clamp(request.Limit, 1, 2000);

        var petitions = await query
            .OrderByDescending(p => p.CreatedAt)
            .Take(limit)
            .Select(p => new
            {
                p.Id,
                p.TrackingCode,
                p.Title,
                p.Latitude,
                p.Longitude,
                p.AddressText,
                CategoryId = p.Category.Id,
                CategoryName = p.Category.Name,
                CategoryType = p.Category.CategoryType.ToString(),
                p.Status,
                p.PriorityLevel,
                p.AdministrativeUnitId,
                AdministrativeUnitName = p.AdministrativeUnit != null ? p.AdministrativeUnit.Name : null,
                DepartmentName = p.Department != null ? p.Department.Name : null,
                p.CreatedAt,
                p.DueDate,
                AttachmentsCount = p.Attachments.Count
            })
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;

        // 10. Chuyển đổi sang cấu trúc chuẩn GeoJSON FeatureCollection
        var features = petitions.Select(p => new GeoJsonFeatureDto
        {
            Id = p.Id.ToString(),
            Geometry = new GeoJsonGeometryDto
            {
                Type = "Point",
                // Chuẩn GeoJSON: [Kinh độ, Vĩ độ] (Longitude trước, Latitude sau)
                Coordinates = new double[] { p.Longitude!.Value, p.Latitude!.Value }
            },
            Properties = new PetitionSpatialPropertiesDto
            {
                Id = p.Id,
                TrackingCode = p.TrackingCode,
                Title = p.Title,
                CategoryId = p.CategoryId,
                CategoryName = p.CategoryName,
                CategoryType = p.CategoryType,
                Status = p.Status.ToString(),
                StatusName = GetStatusName(p.Status),
                PriorityLevel = p.PriorityLevel.ToString(),
                PriorityName = GetPriorityName(p.PriorityLevel),
                AddressText = p.AddressText,
                AdministrativeUnitId = p.AdministrativeUnitId,
                AdministrativeUnitName = p.AdministrativeUnitName,
                DepartmentName = p.DepartmentName,
                CreatedAt = p.CreatedAt,
                DueDate = p.DueDate,
                IsOverdue = p.DueDate.HasValue && p.DueDate.Value < now && p.Status != PetitionStatus.Resolved && p.Status != PetitionStatus.Closed,
                AttachmentsCount = p.AttachmentsCount
            }
        }).ToList();

        return new GeoJsonFeatureCollectionDto
        {
            Type = "FeatureCollection",
            Features = features,
            TotalCount = totalCount
        };
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
