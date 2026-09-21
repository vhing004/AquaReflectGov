using System.Text.Json.Serialization;

namespace AquaReflect.Application.Features.Gis.DTOs;

/// <summary>
/// Chuẩn GeoJSON FeatureCollection theo RFC 7946
/// </summary>
public class GeoJsonFeatureCollectionDto
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = "FeatureCollection";

    [JsonPropertyName("features")]
    public List<GeoJsonFeatureDto> Features { get; set; } = new();

    [JsonPropertyName("totalCount")]
    public int TotalCount { get; set; }
}

/// <summary>
/// Đối tượng Feature trong GeoJSON
/// </summary>
public class GeoJsonFeatureDto
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = "Feature";

    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("geometry")]
    public GeoJsonGeometryDto Geometry { get; set; } = new();

    [JsonPropertyName("properties")]
    public PetitionSpatialPropertiesDto Properties { get; set; } = new();
}

/// <summary>
/// Đối tượng Geometry chuẩn Point: coordinates = [longitude, latitude]
/// </summary>
public class GeoJsonGeometryDto
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = "Point";

    /// <summary>
    /// Tọa độ theo chuẩn GeoJSON RFC 7946: [Kinh độ (Longitude), Vĩ độ (Latitude)]
    /// </summary>
    [JsonPropertyName("coordinates")]
    public double[] Coordinates { get; set; } = new double[2];
}

/// <summary>
/// Dữ liệu thuộc tính chi tiết của điểm phản ánh trên bản đồ
/// </summary>
public class PetitionSpatialPropertiesDto
{
    public Guid Id { get; set; }
    public string TrackingCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string StatusName { get; set; } = string.Empty;
    public string PriorityLevel { get; set; } = string.Empty;
    public string PriorityName { get; set; } = string.Empty;
    public string AddressText { get; set; } = string.Empty;
    public int? AdministrativeUnitId { get; set; }
    public string? AdministrativeUnitName { get; set; }
    public string? DepartmentName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? DueDate { get; set; }
    public bool IsOverdue { get; set; }
    public int AttachmentsCount { get; set; }
}
