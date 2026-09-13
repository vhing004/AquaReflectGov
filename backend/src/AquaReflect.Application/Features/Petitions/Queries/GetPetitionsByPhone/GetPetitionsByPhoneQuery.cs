using AquaReflect.Application.Features.Petitions.DTOs;
using MediatR;

namespace AquaReflect.Application.Features.Petitions.Queries.GetPetitionsByPhone;

public class GetPetitionsByPhoneQuery : IRequest<List<PetitionSummaryDto>>
{
    public string PhoneNumber { get; set; } = string.Empty;

    public GetPetitionsByPhoneQuery(string phoneNumber)
    {
        PhoneNumber = phoneNumber;
    }
}
