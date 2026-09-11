namespace AquaReflect.Application.Features.AdministrativeUnits.DTOs;

public class AdministrativeUnitDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? EnglishName { get; set; }
    public int Level { get; set; }
    public int? ParentId { get; set; }
}
