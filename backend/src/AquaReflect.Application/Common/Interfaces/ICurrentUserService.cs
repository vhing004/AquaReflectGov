using AquaReflect.Domain.Enums;

namespace AquaReflect.Application.Common.Interfaces;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? Username { get; }
    string? Email { get; }
    UserRole? Role { get; }
    Guid? DepartmentId { get; }
    bool IsUnitLead { get; }
    bool IsAuthenticated { get; }
}
