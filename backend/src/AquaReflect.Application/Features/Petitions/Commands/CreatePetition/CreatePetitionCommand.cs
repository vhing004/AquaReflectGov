using AquaReflect.Application.Common.Models;
using AquaReflect.Application.Features.Petitions.DTOs;
using AquaReflect.Domain.Enums;
using MediatR;

namespace AquaReflect.Application.Features.Petitions.Commands.CreatePetition;

public class CreatePetitionCommand : IRequest<CreatePetitionResultDto>
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    
    public string? AddressText { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public int? AdministrativeUnitId { get; set; }

    public bool IsAnonymous { get; set; } = false;
    public string? CitizenName { get; set; }
    public string? CitizenPhone { get; set; }
    public string? CitizenEmail { get; set; }
    public string? CitizenIdCard { get; set; }

    public PriorityLevel? PriorityLevel { get; set; }

    public List<FileUploadModel> Files { get; set; } = new();
}
