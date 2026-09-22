using AquaReflect.Application.Services;
using AquaReflect.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace AquaReflect.UnitTests.Services;

public class PetitionWorkflowServiceTests
{
    private readonly PetitionWorkflowService _workflowService = new();

    [Fact]
    public void CanTransition_SubmittedToAssigned_ByDispatcher_ShouldReturnTrue()
    {
        // Act
        var result = _workflowService.CanTransition(PetitionStatus.Submitted, PetitionStatus.Assigned, UserRole.Dispatcher);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void CanTransition_SubmittedToResolved_ByDispatcher_ShouldReturnFalse()
    {
        // Act (Không được nhảy cóc từ Submitted sang Resolved)
        var result = _workflowService.CanTransition(PetitionStatus.Submitted, PetitionStatus.Resolved, UserRole.Dispatcher);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void CanTransition_InvestigatingToResolved_BySpecialist_ShouldReturnTrue()
    {
        // Act
        var result = _workflowService.CanTransition(PetitionStatus.Investigating, PetitionStatus.Resolved, UserRole.Specialist);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void GetAllowedTransitions_ForCitizen_ShouldReturnEmptyList()
    {
        // Act
        var transitions = _workflowService.GetAllowedTransitions(PetitionStatus.Submitted, UserRole.Citizen);

        // Assert
        transitions.Should().BeEmpty();
    }
}
