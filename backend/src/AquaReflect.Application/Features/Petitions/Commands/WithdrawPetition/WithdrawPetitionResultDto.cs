namespace AquaReflect.Application.Features.Petitions.Commands.WithdrawPetition;

public class WithdrawPetitionResultDto
{
    public Guid PetitionId { get; set; }
    public string TrackingCode { get; set; } = string.Empty;
    public string PreviousStatus { get; set; } = string.Empty;
    public string NewStatus { get; set; } = "Withdrawn";
    public DateTime WithdrawnAt { get; set; }
    public string Message { get; set; } = string.Empty;
}
