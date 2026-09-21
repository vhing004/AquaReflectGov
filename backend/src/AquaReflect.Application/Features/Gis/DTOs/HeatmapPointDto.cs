using System.Text.Json.Serialization;

namespace AquaReflect.Application.Features.Gis.DTOs;

/// <summary>
/// Dữ liệu điểm nhiệt (Heatmap point)
/// </summary>
public class HeatmapPointDto
{
    [JsonPropertyName("lat")]
    public double Latitude { get; set; }

    [JsonPropertyName("lng")]
    public double Longitude { get; set; }

    /// <summary>
    /// Trọng số nhiệt (từ 0.1 đến 1.0) dựa trên mức độ nghiêm trọng và khẩn cấp
    /// </summary>
    [JsonPropertyName("weight")]
    public double Weight { get; set; }

    [JsonPropertyName("type")]
    public string CategoryType { get; set; } = string.Empty;

    [JsonPropertyName("code")]
    public string TrackingCode { get; set; } = string.Empty;
}

/// <summary>
/// Tập hợp dữ liệu bản đồ nhiệt
/// </summary>
public class HeatmapDataResultDto
{
    public int TotalPoints { get; set; }
    public double MaxWeight { get; set; } = 1.0;
    public List<HeatmapPointDto> Points { get; set; } = new();

    /// <summary>
    /// Mảng rút gọn [lat, lng, weight] tương thích trực tiếp với Leaflet.heat (L.heatLayer)
    /// </summary>
    public List<double[]> RawArray => Points.Select(p => new[] { p.Latitude, p.Longitude, p.Weight }).ToList();
}
