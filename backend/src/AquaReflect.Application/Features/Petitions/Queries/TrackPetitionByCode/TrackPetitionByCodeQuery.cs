using AquaReflect.Application.Features.Petitions.DTOs;
using MediatR;

namespace AquaReflect.Application.Features.Petitions.Queries.TrackPetitionByCode;

public class TrackPetitionByCodeQuery : IRequest<PetitionTrackingDto>
{
    public string TrackingCode { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }

    public TrackPetitionByCodeQuery(string trackingCode, string? phoneNumber = null)
    {
        TrackingCode = trackingCode;
        PhoneNumber = phoneNumber;
    }
}
