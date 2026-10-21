using AquaReflect.Domain.Enums;

namespace AquaReflect.Application.Features.Petitions.DTOs;

public class CsatDto
{
    public Guid PetitionId { get; set; }
    public string TrackingCode { get; set; } = string.Empty;
    public int? Score { get; set; }
    public string? Comment { get; set; }
    public DateTime? FeedbackAt { get; set; }
    public bool HasFeedback { get; set; }
    public bool CanFeedback { get; set; }
    public bool CanReopen { get; set; }
    public ReopenStatus ReopenStatus { get; set; } = ReopenStatus.None;
    public string ReopenStatusName { get; set; } = string.Empty;
    public int ReopenCount { get; set; }
    public string? ReopenReason { get; set; }
    public DateTime? ReopenedAt { get; set; }
    public int? DaysRemainingForFeedback { get; set; }
}
