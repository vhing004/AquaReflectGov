using AquaReflect.Domain.Enums;

namespace AquaReflect.Application.Features.Categories.DTOs;

public class CategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public PetitionCategoryType CategoryType { get; set; }
    public string CategoryTypeName => CategoryType.ToString();
    public string? Description { get; set; }
    public int DefaultSlaHours { get; set; }
    public int DisplayOrder { get; set; }
}
