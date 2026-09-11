using AquaReflect.Domain.Common;
using AquaReflect.Domain.Enums;

namespace AquaReflect.Domain.Entities;

public class User : BaseEntity, IAuditableEntity
{
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public string PasswordSalt { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Citizen;
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }

    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }

    public Guid? DepartmentId { get; set; }
    public virtual Department? Department { get; set; }

    public string? CreatedBy { get; set; }
    public string? LastModifiedBy { get; set; }

    public virtual ICollection<Petition> AssignedPetitions { get; set; } = new List<Petition>();
    public virtual ICollection<PetitionHistory> PerformedHistories { get; set; } = new List<PetitionHistory>();
}
