using AquaReflect.Domain.Common;

namespace AquaReflect.Domain.Entities;

public class PetitionResolution : BaseEntity
{
    public Guid PetitionId { get; set; }
    public virtual Petition Petition { get; set; } = null!;

    public string ConclusionText { get; set; } = string.Empty;
    public string? DocumentNumber { get; set; }
    public string? OfficialDocumentUrl { get; set; }

    public Guid? ApprovedByUserId { get; set; }
    public virtual User? ApprovedByUser { get; set; }

    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
}
