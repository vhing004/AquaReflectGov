using AquaReflect.Domain.Enums;

namespace AquaReflect.Application.Features.Users.DTOs;

public record UserListItemDto
{
    public Guid Id { get; init; }
    public string Username { get; init; } = string.Empty;
    public string FullName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string? PhoneNumber { get; init; }
    public UserRole Role { get; init; }
    public string RoleName { get; init; } = string.Empty;
    public Guid? DepartmentId { get; init; }
    public string? DepartmentName { get; init; }
    public bool IsUnitLead { get; init; }
    public bool IsActive { get; init; }
    public int ActiveCaseCount { get; init; }
    public int ResolvedCaseCount { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? LastLoginAt { get; init; }
}

public record UserDetailDto
{
    public Guid Id { get; init; }
    public string Username { get; init; } = string.Empty;
    public string FullName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string? PhoneNumber { get; init; }
    public UserRole Role { get; init; }
    public string RoleName { get; init; } = string.Empty;
    public Guid? DepartmentId { get; init; }
    public string? DepartmentName { get; init; }
    public bool IsUnitLead { get; init; }
    public bool IsActive { get; init; }
    public int ActiveCaseCount { get; init; }
    public int ResolvedCaseCount { get; init; }
    public double AverageRating { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? LastLoginAt { get; init; }
}

public record UserPetitionDto
{
    public Guid Id { get; init; }
    public string TrackingCode { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string CategoryName { get; init; } = string.Empty;
    public int Status { get; init; }
    public string StatusName { get; init; } = string.Empty;
    public int PriorityLevel { get; init; }
    public string PriorityName { get; init; } = string.Empty;
    public string AddressText { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public DateTime? ResolvedAt { get; init; }
    public int? FeedbackRating { get; init; }
    public string? FeedbackComment { get; init; }
    public bool IsOverdue { get; init; }
    public string? ResolutionSummary { get; init; }
}

