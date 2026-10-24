namespace AquaReflect.Application.Features.Petitions.Commands.AssignMember;

public class AssignMemberResultDto
{
    public Guid PetitionId { get; set; }
    public string TrackingCode { get; set; } = string.Empty;
    public Guid? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public Guid AssignedUserId { get; set; }
    public string AssignedUserName { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
