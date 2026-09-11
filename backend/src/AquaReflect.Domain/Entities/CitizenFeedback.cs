using AquaReflect.Domain.Common;

namespace AquaReflect.Domain.Entities;

public class CitizenFeedback : BaseEntity
{
    public Guid PetitionId { get; set; }
    public virtual Petition Petition { get; set; } = null!;

    public int Rating { get; set; } // 1 - 5 sao
    public string? Comment { get; set; }
    public DateTime FeedbackAt { get; set; } = DateTime.UtcNow;
}
