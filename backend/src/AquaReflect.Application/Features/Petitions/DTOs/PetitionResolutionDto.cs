namespace AquaReflect.Application.Features.Petitions.DTOs;

public class PetitionResolutionDto
{
    public Guid Id { get; set; }
    public string ConclusionText { get; set; } = string.Empty;
    public string? DocumentNumber { get; set; }
    public string? OfficialDocumentUrl { get; set; }
    public DateTime IssuedAt { get; set; }
    public string? ApprovedByName { get; set; }

    // [Task 4.2] Cấu trúc kết luận & chốt mốc SLA
    public int? ConclusionType { get; set; }
    public string? ConclusionTypeName { get; set; }
    public string? PublicSummary { get; set; }
    public bool IsResolvedOnTime { get; set; }
}
