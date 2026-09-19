namespace AquaReflect.Application.Features.Petitions.Commands.TransitionStatus;

/// <summary>
/// Kết quả sau khi chuyển trạng thái hồ sơ thành công
/// </summary>
public class TransitionPetitionStatusResultDto
{
    public Guid PetitionId { get; set; }
    public string TrackingCode { get; set; } = string.Empty;
    public int PreviousStatus { get; set; }
    public string PreviousStatusName { get; set; } = string.Empty;
    public int NewStatus { get; set; }
    public string NewStatusName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string? DepartmentName { get; set; }
    public string? AssignedUserName { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string Message { get; set; } = string.Empty;
}
