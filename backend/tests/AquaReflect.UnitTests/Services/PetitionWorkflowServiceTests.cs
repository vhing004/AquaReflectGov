using AquaReflect.Application.Services;
using AquaReflect.Domain.Entities;
using AquaReflect.Domain.Enums;
using AquaReflect.Domain.Exceptions;
using FluentAssertions;
using Xunit;

namespace AquaReflect.UnitTests.Services;

public class PetitionWorkflowServiceTests
{
    private readonly PetitionWorkflowService _workflowService = new();

    [Fact]
    public void CanTransition_SubmittedToAssigned_ByDispatcher_ShouldReturnTrue()
    {
        var result = _workflowService.CanTransition(PetitionStatus.Submitted, PetitionStatus.Assigned, UserRole.Dispatcher);
        result.Should().BeTrue();
    }

    [Fact]
    public void CanTransition_SubmittedToResolved_ByDispatcher_ShouldReturnFalse()
    {
        // Không được nhảy cóc từ Submitted sang Resolved
        var result = _workflowService.CanTransition(PetitionStatus.Submitted, PetitionStatus.Resolved, UserRole.Dispatcher);
        result.Should().BeFalse();
    }

    [Fact]
    public void CanTransition_SubmittedToInvestigating_ShouldReturnFalse()
    {
        // Không được bỏ qua bước phân công (Assigned)
        var result = _workflowService.CanTransition(PetitionStatus.Submitted, PetitionStatus.Investigating, UserRole.Specialist);
        result.Should().BeFalse();
    }

    [Fact]
    public void CanTransition_InvestigatingToResolved_BySpecialist_ShouldReturnTrue()
    {
        var result = _workflowService.CanTransition(PetitionStatus.Investigating, PetitionStatus.Resolved, UserRole.Specialist);
        result.Should().BeTrue();
    }

    [Fact]
    public void CanTransition_Specialist_CannotRejectOrClose()
    {
        // Specialist không được phép Từ chối hoặc Đóng hồ sơ (chỉ Dispatcher/SuperAdmin)
        _workflowService.CanTransition(PetitionStatus.Assigned, PetitionStatus.Rejected, UserRole.Specialist).Should().BeFalse();
        _workflowService.CanTransition(PetitionStatus.Resolved, PetitionStatus.Closed, UserRole.Specialist).Should().BeFalse();
    }

    [Fact]
    public void CanTransition_Dispatcher_CannotInvestigateOrResolve()
    {
        // Dispatcher không được phép can thiệp Thẩm tra hoặc Ban hành kết luận
        _workflowService.CanTransition(PetitionStatus.Assigned, PetitionStatus.Investigating, UserRole.Dispatcher).Should().BeFalse();
        _workflowService.CanTransition(PetitionStatus.Investigating, PetitionStatus.Resolved, UserRole.Dispatcher).Should().BeFalse();
    }

    [Fact]
    public void CanTransition_FromClosed_ShouldAlwaysBeFalse()
    {
        // Trạng thái Đóng là điểm kết thúc, không được chuyển tiếp
        _workflowService.CanTransition(PetitionStatus.Closed, PetitionStatus.Submitted, UserRole.SuperAdmin).Should().BeFalse();
        _workflowService.CanTransition(PetitionStatus.Closed, PetitionStatus.Assigned, UserRole.SuperAdmin).Should().BeFalse();
    }

    [Fact]
    public void GetAllowedTransitions_ForCitizen_ShouldReturnEmptyList()
    {
        var transitions = _workflowService.GetAllowedTransitions(PetitionStatus.Submitted, UserRole.Citizen);
        transitions.Should().BeEmpty();
    }

    [Fact]
    public void ValidateTransition_SpecialistDifferentDepartment_ShouldThrowForbiddenException()
    {
        var deptA = Guid.NewGuid();
        var deptB = Guid.NewGuid();
        var petition = new Petition
        {
            Id = Guid.NewGuid(),
            DepartmentId = deptA,
            Status = PetitionStatus.Assigned
        };

        // Specialist của phòng ban B cố tình thao tác hồ sơ của phòng ban A
        var act = () => _workflowService.ValidateTransition(
            petition,
            PetitionStatus.Investigating,
            UserRole.Specialist,
            userDepartmentId: deptB,
            targetDepartmentId: null,
            resolutionSummary: null,
            note: "Cố tình xử lý hồ sơ phòng ban khác"
        );

        act.Should().Throw<ForbiddenException>()
            .WithMessage("*phòng ban*");
    }

    [Fact]
    public void ValidateTransition_OnClosedPetition_ShouldThrowBadRequestException()
    {
        var petition = new Petition
        {
            Id = Guid.NewGuid(),
            Status = PetitionStatus.Closed
        };

        var act = () => _workflowService.ValidateTransition(
            petition,
            PetitionStatus.Investigating,
            UserRole.SuperAdmin,
            userDepartmentId: null,
            targetDepartmentId: null,
            resolutionSummary: null,
            note: "Thao tác trên hồ sơ đã đóng"
        );

        act.Should().Throw<BadRequestException>()
            .WithMessage("*đã được đóng lưu trữ*");
    }
}
