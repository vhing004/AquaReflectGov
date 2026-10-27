using AquaReflect.Application.Features.Petitions.DTOs;
using MediatR;

namespace AquaReflect.Application.Features.Petitions.Commands.AddPublicComment;

public class AddPublicCommentCommand : IRequest<PublicCommentDto>
{
    public string TrackingCode { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
}
