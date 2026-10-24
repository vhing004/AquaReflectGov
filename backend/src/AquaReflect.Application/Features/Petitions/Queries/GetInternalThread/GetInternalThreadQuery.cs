using AquaReflect.Application.Features.Petitions.DTOs;
using MediatR;

namespace AquaReflect.Application.Features.Petitions.Queries.GetInternalThread;

public class GetInternalThreadQuery : IRequest<List<PetitionCommentDto>>
{
    public Guid PetitionId { get; set; }

    public GetInternalThreadQuery(Guid petitionId)
    {
        PetitionId = petitionId;
    }
}
