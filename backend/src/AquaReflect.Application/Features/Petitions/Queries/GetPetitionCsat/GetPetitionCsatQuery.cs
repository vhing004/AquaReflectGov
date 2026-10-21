using AquaReflect.Application.Features.Petitions.DTOs;
using MediatR;

namespace AquaReflect.Application.Features.Petitions.Queries.GetPetitionCsat;

public class GetPetitionCsatQuery : IRequest<CsatDto>
{
    public string TrackingCode { get; set; } = string.Empty;
}
