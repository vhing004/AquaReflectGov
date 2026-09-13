namespace AquaReflect.Application.Features.Petitions.DTOs;

public class PetitionSummaryDto
{
    public Guid Id { get; set; }
    public string TrackingCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public int Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public int PriorityLevel { get; set; }
    public string PriorityName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? DueDate { get; set; }
    public bool IsOverdue { get; set; }
    public int AttachmentsCount { get; set; }
    public string? DepartmentName { get; set; }
}
