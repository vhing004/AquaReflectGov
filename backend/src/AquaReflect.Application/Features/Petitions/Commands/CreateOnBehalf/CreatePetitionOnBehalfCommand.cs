using AquaReflect.Application.Common.Models;
using AquaReflect.Application.Features.Petitions.DTOs;
using AquaReflect.Domain.Enums;
using MediatR;

namespace AquaReflect.Application.Features.Petitions.Commands.CreateOnBehalf;

public class CreatePetitionOnBehalfCommand : IRequest<CreatePetitionResultDto>
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    
    public string? AddressText { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public int? AdministrativeUnitId { get; set; }

    // Người dân thực sự
    public string CitizenName { get; set; } = string.Empty;
    public string CitizenPhone { get; set; } = string.Empty;
    public string? CitizenEmail { get; set; }
    public string? CitizenIdCard { get; set; }

    public PriorityLevel? PriorityLevel { get; set; }

    // Nguồn tiếp nhận bắt buộc (Kịch bản 24 & mục 3.6): Phone, InPerson, Document
    public ReceptionSource ReceptionSource { get; set; }

    public List<FileUploadModel> Files { get; set; } = new();
}
