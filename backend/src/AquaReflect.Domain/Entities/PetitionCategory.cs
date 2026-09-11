using AquaReflect.Domain.Common;
using AquaReflect.Domain.Enums;

namespace AquaReflect.Domain.Entities;

public class PetitionCategory : BaseEntity, IAuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public PetitionCategoryType CategoryType { get; set; } = PetitionCategoryType.Other;
    public string? Description { get; set; }
    public int DefaultSlaHours { get; set; } = 72; // Mặc định 72 giờ xử lý
    public int DisplayOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    public string? CreatedBy { get; set; }
    public string? LastModifiedBy { get; set; }

    public virtual ICollection<Petition> Petitions { get; set; } = new List<Petition>();
}
