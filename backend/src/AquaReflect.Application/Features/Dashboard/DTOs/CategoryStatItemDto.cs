namespace AquaReflect.Application.Features.Dashboard.DTOs;

/// <summary>
/// Thống kê phân bổ phản ánh theo chuyên mục
/// </summary>
public class CategoryStatItemDto
{
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryType { get; set; } = string.Empty;
    public int Count { get; set; }
    public double Percentage { get; set; }
    public int OverdueCount { get; set; }
}
