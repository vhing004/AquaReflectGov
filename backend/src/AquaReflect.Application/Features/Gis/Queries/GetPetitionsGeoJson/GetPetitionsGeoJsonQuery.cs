using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Features.Gis.DTOs;
using AquaReflect.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

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
    private readonly ICurrentUserService _currentUser;

    public GetPetitionsGeoJsonQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
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

        // Nếu là Specialist thì chỉ xem hồ sơ thuộc phòng ban mình khi đang đăng nhập nội bộ
        if (_currentUser.IsAuthenticated && _currentUser.Role == UserRole.Specialist && _currentUser.DepartmentId.HasValue)
        {
            query = query.Where(p => p.DepartmentId == _currentUser.DepartmentId.Value);
        }

        // Bản đồ công khai: chỉ hiển thị các trạng thái đã được tiếp nhận và đang/đã xử lý.
        // Lọc bỏ Submitted (chờ phân loại), NeedInfo (tạm dừng chờ bổ sung), Rejected, Merged, Withdrawn.
        var isStaff = _currentUser.IsAuthenticated && IsStaffRole(_currentUser.Role);
        if (!isStaff)
        {
            var publicStatuses = new[]
            {
                PetitionStatus.Assigned,
                PetitionStatus.Investigating,
                PetitionStatus.Resolved,
                PetitionStatus.Closed,
                PetitionStatus.Forwarded
            };
            query = query.Where(p => publicStatuses.Contains(p.Status));
        }

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
        {
            query = query.Where(p => p.Status == request.Status.Value);
        }

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
        var features = petitions.Select(p =>
        {
            // Tọa độ gốc
            var lat = p.Latitude!.Value;
            var lng = p.Longitude!.Value;

            // Obfuscate tọa độ ~±100m cho người dùng không phải staff (bảo vệ danh tính người tố giác)
            if (!isStaff)
            {
                lat = ObfuscateCoordinate(lat, p.Id, 0);
                lng = ObfuscateCoordinate(lng, p.Id, 1);
            }

            return new GeoJsonFeatureDto
            {
                Id = p.Id.ToString(),
                Geometry = new GeoJsonGeometryDto
                {
                    Type = "Point",
                    // Chuẩn GeoJSON: [Kinh độ, Vĩ độ] (Longitude trước, Latitude sau)
                    Coordinates = new double[] { lng, lat }
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
                    AttachmentsCount = p.AttachmentsCount,
                    IsCoordinatesObfuscated = !isStaff,
                    LegalDisclaimer = !isStaff
                        ? "Vị trí hiển thị được làm tròn trong bán kính ~100m để bảo vệ danh tính người phản ánh và đối tượng liên quan."
                        : null
                }
            };
        }).ToList();

        return new GeoJsonFeatureCollectionDto
        {
            Type = "FeatureCollection",
            Features = features,
            TotalCount = totalCount
        };
    }

    /// <summary>
    /// Obfuscate tọa độ ~±100m bằng cách thêm nhiễu xác định từ GUID của petition.
    /// Dùng SHA256 để đảm bảo nhiễu cố định (deterministic) cho cùng một petition,
    /// tránh marker nhảy lung tung mỗi lần tải bản đồ.
    /// ~0.001° ≈ 111m tại vĩ độ 10°N (Việt Nam)
    /// </summary>
    private static double ObfuscateCoordinate(double coordinate, Guid petitionId, int component)
    {
        // Tạo seed xác định từ petition ID + component index (0=lat, 1=lng)
        var input = petitionId.ToByteArray();
        input[0] ^= (byte)component; // Biến thể cho lat vs lng
        var hash = SHA256.HashData(input);

        // Chuyển 2 byte đầu thành số trong khoảng [-1, 1]
        var noise = (BitConverter.ToUInt16(hash, 0) / (double)ushort.MaxValue) * 2.0 - 1.0;

        // Áp dụng nhiễu tối đa ±0.001° (~111m)
        return Math.Round(coordinate + noise * 0.001, 6);
    }

    /// <summary>Kiểm tra role có phải staff (nhân viên nội bộ) không.</summary>
    private static bool IsStaffRole(UserRole? role) =>
        role == UserRole.Specialist || role == UserRole.Dispatcher || role == UserRole.SuperAdmin;

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
