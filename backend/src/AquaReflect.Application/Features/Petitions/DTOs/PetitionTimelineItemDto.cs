namespace AquaReflect.Application.Features.Petitions.DTOs;

public class PetitionTimelineItemDto
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Action { get; set; } = string.Empty;
    public int? FromStatus { get; set; }
    public string? FromStatusName { get; set; }
    public int ToStatus { get; set; }
    public string ToStatusName { get; set; } = string.Empty;
    public string? Note { get; set; }
    public string? ActorName { get; set; }
}
