using MediatR;

namespace AquaReflect.Application.Features.Petitions.Commands.RequestReopen;

public class RequestPetitionReopenCommand : IRequest<RequestPetitionReopenResultDto>
{
    public string TrackingCode { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string? AccessPin { get; set; }
}

public class RequestPetitionReopenResultDto
{
    public Guid PetitionId { get; set; }
    public string TrackingCode { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime RequestedAt { get; set; }
}
