namespace AquaReflect.Application.Features.Gis.DTOs;

public class SpatialRadiusResultDto
{
    public double CenterLatitude { get; set; }
    public double CenterLongitude { get; set; }
    public double RadiusKm { get; set; }
    public int TotalCount { get; set; }
    public List<SpatialRadiusItemDto> Items { get; set; } = new();
}

public class SpatialRadiusItemDto
{
    public Guid Id { get; set; }
    public string TrackingCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string StatusName { get; set; } = string.Empty;
    public string PriorityLevel { get; set; } = string.Empty;
    public string PriorityName { get; set; } = string.Empty;
    public string AddressText { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double DistanceKm { get; set; }
    public double DistanceMeters => Math.Round(DistanceKm * 1000, 1);
    public DateTime CreatedAt { get; set; }
    public bool IsOverdue { get; set; }
}
