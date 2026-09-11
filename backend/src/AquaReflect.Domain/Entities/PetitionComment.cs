using AquaReflect.Domain.Common;

namespace AquaReflect.Domain.Entities;

public class PetitionComment : BaseEntity
{
    public Guid PetitionId { get; set; }
    public virtual Petition Petition { get; set; } = null!;

    public string AuthorName { get; set; } = string.Empty;
    public Guid? AuthorUserId { get; set; }
    public virtual User? AuthorUser { get; set; }

    public bool IsInternal { get; set; } = false; // true: nội bộ cán bộ trao đổi
    public string Content { get; set; } = string.Empty;
}
