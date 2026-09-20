using AquaReflect.Application.Common.Models;
using AquaReflect.Application.Features.Petitions.DTOs;
using MediatR;

namespace AquaReflect.Application.Features.Petitions.Commands.UpdateResolution;

public class UpdatePetitionResolutionCommand : IRequest<PetitionResolutionDto>
{
    public Guid PetitionId { get; set; }
    public string ConclusionText { get; set; } = string.Empty;
    public string? DocumentNumber { get; set; }
    public FileUploadModel? DocumentFile { get; set; }
}
