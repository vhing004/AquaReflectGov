namespace AquaReflect.Application.Features.Gis.DTOs;

public class SpatialSummaryResultDto
{
    public int TotalPetitionsWithLocation { get; set; }
    public int TotalDistrictsCovered { get; set; }
    public List<DistrictSpatialSummaryDto> DistrictSummaries { get; set; } = new();
    public List<CategorySpatialCountDto> CategoryDistribution { get; set; } = new();
}

public class DistrictSpatialSummaryDto
{
    public int AdministrativeUnitId { get; set; }
    public string DistrictCode { get; set; } = string.Empty;
    public string DistrictName { get; set; } = string.Empty;
    public int TotalCount { get; set; }
    public int SubmittedCount { get; set; }
    public int InProgressCount { get; set; }
    public int ResolvedCount { get; set; }
    public int OverdueCount { get; set; }
    public int IuuCount { get; set; }
    public int DiseaseCount { get; set; }
    public int PollutionCount { get; set; }
    public int OtherCount { get; set; }
    public double? CenterLat { get; set; }
    public double? CenterLng { get; set; }
}

public class CategorySpatialCountDto
{
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryType { get; set; } = string.Empty;
    public int Count { get; set; }
    public double Percentage { get; set; }
}
