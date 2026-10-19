namespace AquaReflect.Application.Features.Petitions.DTOs;

public class SubmitAdditionalInfoResultDto
{
    public Guid PetitionId { get; set; }
    public string TrackingCode { get; set; } = string.Empty;
    public int PreviousStatus { get; set; }
    public string PreviousStatusName { get; set; } = string.Empty;
    public int NewStatus { get; set; }
    public string NewStatusName { get; set; } = string.Empty;
    public double TotalSlaPausedMinutes { get; set; }
    public int NewAttachmentsCount { get; set; }
    public List<PetitionAttachmentDto> Attachments { get; set; } = new();
    public string Message { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; }
}
