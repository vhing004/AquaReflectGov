using AquaReflect.Domain.Common;

namespace AquaReflect.Domain.Entities;

public class Department : BaseEntity, IAuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public bool IsActive { get; set; } = true;

    public int? AdministrativeUnitId { get; set; }
    public virtual AdministrativeUnit? AdministrativeUnit { get; set; }

    public string? CreatedBy { get; set; }
    public string? LastModifiedBy { get; set; }

    public virtual ICollection<User> Users { get; set; } = new List<User>();
    public virtual ICollection<Petition> Petitions { get; set; } = new List<Petition>();
}
