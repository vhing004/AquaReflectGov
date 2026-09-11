using AquaReflect.Domain.Common;

namespace AquaReflect.Domain.Entities;

public class AdministrativeUnit
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? EnglishName { get; set; }
    public int Level { get; set; } // 1: Tỉnh/TP, 2: Huyện/Thị xã, 3: Xã/Phường
    public int? ParentId { get; set; }

    public virtual AdministrativeUnit? Parent { get; set; }
    public virtual ICollection<AdministrativeUnit> Children { get; set; } = new List<AdministrativeUnit>();
    public virtual ICollection<Department> Departments { get; set; } = new List<Department>();
    public virtual ICollection<Petition> Petitions { get; set; } = new List<Petition>();
}
