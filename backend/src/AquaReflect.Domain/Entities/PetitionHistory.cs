using AquaReflect.Domain.Common;
using AquaReflect.Domain.Enums;

namespace AquaReflect.Domain.Entities;

public class PetitionHistory : BaseEntity
{
    public Guid PetitionId { get; set; }
    public virtual Petition Petition { get; set; } = null!;

    public PetitionStatus? FromStatus { get; set; }
    public PetitionStatus ToStatus { get; set; }

    public string Action { get; set; } = string.Empty;
    public string? Note { get; set; }

    public Guid? PerformedByUserId { get; set; }
    public virtual User? PerformedByUser { get; set; }
    public string? PerformedByName { get; set; }
}
