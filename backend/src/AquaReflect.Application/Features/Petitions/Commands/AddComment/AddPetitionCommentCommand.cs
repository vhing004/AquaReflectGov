using AquaReflect.Application.Features.Petitions.DTOs;
using MediatR;

namespace AquaReflect.Application.Features.Petitions.Commands.AddComment;

public class AddPetitionCommentCommand : IRequest<PetitionCommentDto>
{
    public Guid PetitionId { get; set; }
    public string Content { get; set; } = string.Empty;
}
