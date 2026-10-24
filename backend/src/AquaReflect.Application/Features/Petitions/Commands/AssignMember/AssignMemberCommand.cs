using MediatR;

namespace AquaReflect.Application.Features.Petitions.Commands.AssignMember;

public class AssignMemberCommand : IRequest<AssignMemberResultDto>
{
    public Guid PetitionId { get; set; }
    public Guid AssignedUserId { get; set; }
    public string? Note { get; set; }
}
