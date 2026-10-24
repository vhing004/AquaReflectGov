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
    public void CanTransition_FromClosed_ShouldOnlyAllowReopenToAssigned()
    {
        // Trạng thái Đóng không thể chuyển về Submitted, Investigating hay Resolved
        _workflowService.CanTransition(PetitionStatus.Closed, PetitionStatus.Submitted, UserRole.SuperAdmin).Should().BeFalse();
        _workflowService.CanTransition(PetitionStatus.Closed, PetitionStatus.Investigating, UserRole.SuperAdmin).Should().BeFalse();
        _workflowService.CanTransition(PetitionStatus.Closed, PetitionStatus.Resolved, UserRole.SuperAdmin).Should().BeFalse();
        // Cho phép SuperAdmin/Dispatcher mở lại về Assigned
        _workflowService.CanTransition(PetitionStatus.Closed, PetitionStatus.Assigned, UserRole.SuperAdmin).Should().BeTrue();
        _workflowService.CanTransition(PetitionStatus.Closed, PetitionStatus.Assigned, UserRole.Dispatcher).Should().BeTrue();
        // Chuyên viên không có quyền mở lại từ Closed
        _workflowService.CanTransition(PetitionStatus.Closed, PetitionStatus.Assigned, UserRole.Specialist).Should().BeFalse();
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

        act.Should().Throw<NotFoundException>()
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

    [Fact]
    public void CanTransition_ResolvedToInvestigating_ByDispatcher_ShouldReturnTrue()
    {
        var result = _workflowService.CanTransition(PetitionStatus.Resolved, PetitionStatus.Investigating, UserRole.Dispatcher);
        result.Should().BeTrue();
    }

    [Fact]
    public void CanTransition_ResolvedToClosed_ByDispatcher_ShouldReturnTrue()
    {
        var result = _workflowService.CanTransition(PetitionStatus.Resolved, PetitionStatus.Closed, UserRole.Dispatcher);
        result.Should().BeTrue();
    }

    [Fact]
    public void CanTransition_ResolvedToInvestigating_BySpecialist_ShouldReturnFalse()
    {
        // Chuyên viên không được tự ý trả về hồ sơ từ Resolved
        var result = _workflowService.CanTransition(PetitionStatus.Resolved, PetitionStatus.Investigating, UserRole.Specialist);
        result.Should().BeFalse();
    }

    [Fact]
    public void ValidateTransition_ResolvedToInvestigating_WithoutNote_ShouldThrowValidationException()
    {
        var petition = new Petition
        {
            Id = Guid.NewGuid(),
            Status = PetitionStatus.Resolved
        };

        var act = () => _workflowService.ValidateTransition(
            petition,
            PetitionStatus.Investigating,
            UserRole.Dispatcher,
            userDepartmentId: null,
            targetDepartmentId: null,
            resolutionSummary: null,
            note: "Quá ngắn" // < 10 ký tự
        );

        act.Should().Throw<ValidationException>()
            .WithMessage("*lý do trả về*");
    }

    [Fact]
    public void ValidateTransition_ResolvedToInvestigating_WithValidNote_ShouldSucceed()
    {
        var petition = new Petition
        {
            Id = Guid.NewGuid(),
            Status = PetitionStatus.Resolved
        };

        var act = () => _workflowService.ValidateTransition(
            petition,
            PetitionStatus.Investigating,
            UserRole.Dispatcher,
            userDepartmentId: null,
            targetDepartmentId: null,
            resolutionSummary: null,
            note: "Biên bản kiểm tra chưa đầy đủ ảnh chụp hiện trường khắc phục."
        );

        act.Should().NotThrow();
    }

    [Fact]
    public void ValidateTransition_Specialist_AssignWithoutUnitLead_ShouldThrowForbidden()
    {
        // Kịch bản 15: Specialist không có cờ IsUnitLead gọi assignSpecialist
        var deptId = Guid.NewGuid();
        var petition = new Petition
        {
            Id = Guid.NewGuid(),
            DepartmentId = deptId,
            Status = PetitionStatus.Assigned
        };

        var act = () => _workflowService.ValidateTransition(
            petition,
            PetitionStatus.Assigned,
            UserRole.Specialist,
            userDepartmentId: deptId,
            targetDepartmentId: deptId,
            resolutionSummary: null,
            note: "Phân công",
            isUnitLead: false
        );

        act.Should().Throw<ForbiddenException>()
            .WithMessage("*Trưởng đơn vị*");
    }

    [Fact]
    public void ValidateTransition_SpecialistLead_AssignWithUnitLead_ShouldSucceed()
    {
        // Trưởng đơn vị phân công cán bộ trong đơn vị mình
        var deptId = Guid.NewGuid();
        var petition = new Petition
        {
            Id = Guid.NewGuid(),
            DepartmentId = deptId,
            Status = PetitionStatus.Assigned
        };

        var act = () => _workflowService.ValidateTransition(
            petition,
            PetitionStatus.Assigned,
            UserRole.Specialist,
            userDepartmentId: deptId,
            targetDepartmentId: deptId,
            resolutionSummary: null,
            note: "Trưởng đơn vị phân công",
            isUnitLead: true
        );

        act.Should().NotThrow();
    }

    [Fact]
    public void ValidateTransition_Specialist_InvestigateWithoutAssignedSpecialist_ShouldThrowBadRequest()
    {
        // Kịch bản 18: Specialist bắt đầu thẩm tra khi đơn chưa có cán bộ phụ trách
        var deptId = Guid.NewGuid();
        var petition = new Petition
        {
            Id = Guid.NewGuid(),
            DepartmentId = deptId,
            AssignedUserId = null,
            Status = PetitionStatus.Assigned
        };

        var act = () => _workflowService.ValidateTransition(
            petition,
            PetitionStatus.Investigating,
            UserRole.Specialist,
            userDepartmentId: deptId,
            targetDepartmentId: null,
            resolutionSummary: null,
            note: null,
            currentUserId: Guid.NewGuid()
        );

        act.Should().Throw<BadRequestException>()
            .WithMessage("*chưa được phân công cán bộ chuyên viên*");
    }

    [Fact]
    public void ValidateTransition_Specialist_NotAssignedUser_CannotResolve_ShouldThrowForbidden()
    {
        // Kịch bản 3: Specialist cùng phòng ban nhưng không được giao gọi resolve
        var deptId = Guid.NewGuid();
        var assignedUserId = Guid.NewGuid();
        var otherSpecialistId = Guid.NewGuid();

        var petition = new Petition
        {
            Id = Guid.NewGuid(),
            DepartmentId = deptId,
            AssignedUserId = assignedUserId,
            Status = PetitionStatus.Investigating
        };

        var act = () => _workflowService.ValidateTransition(
            petition,
            PetitionStatus.Resolved,
            UserRole.Specialist,
            userDepartmentId: deptId,
            targetDepartmentId: null,
            resolutionSummary: "Kết luận giải quyết",
            note: null,
            currentUserId: otherSpecialistId
        );

        act.Should().Throw<ForbiddenException>()
            .WithMessage("*được giao trực tiếp thụ lý*");
    }

    [Fact]
    public void ValidateTransition_UnitLead_ReturnToDispatcher_WhenAlreadyInvestigating_ShouldThrowBadRequest()
    {
        // Kịch bản 19: Trưởng đơn vị trả đơn về Dispatcher khi đơn đã Investigating
        var deptId = Guid.NewGuid();
        var petition = new Petition
        {
            Id = Guid.NewGuid(),
            DepartmentId = deptId,
            Status = PetitionStatus.Investigating
        };

        var act = () => _workflowService.ValidateTransition(
            petition,
            PetitionStatus.Submitted,
            UserRole.Specialist,
            userDepartmentId: deptId,
            targetDepartmentId: null,
            resolutionSummary: null,
            note: "Giao nhầm đơn vị",
            isUnitLead: true
        );

        act.Should().Throw<BadRequestException>()
            .WithMessage("*chưa bước vào giai đoạn xác minh*");
    }

    [Fact]
    public void ValidateTransition_SpecialistMember_SubmitInspectionReport_ShouldSucceed()
    {
        var deptId = Guid.NewGuid();
        var specialistId = Guid.NewGuid();
        var petition = new Petition
        {
            Id = Guid.NewGuid(),
            DepartmentId = deptId,
            AssignedUserId = specialistId,
            Status = PetitionStatus.Investigating
        };

        var act = () => _workflowService.ValidateTransition(
            petition,
            PetitionStatus.PendingApproval,
            UserRole.Specialist,
            userDepartmentId: deptId,
            targetDepartmentId: null,
            resolutionSummary: "Đã kiểm tra hiện trường, phát hiện vi phạm và lập biên bản.",
            note: null,
            isUnitLead: false,
            currentUserId: specialistId
        );

        act.Should().NotThrow();
    }

    [Fact]
    public void ValidateTransition_RegularSpecialist_ApproveReportToResolved_ShouldThrowForbidden()
    {
        var deptId = Guid.NewGuid();
        var specialistId = Guid.NewGuid();
        var petition = new Petition
        {
            Id = Guid.NewGuid(),
            DepartmentId = deptId,
            AssignedUserId = specialistId,
            Status = PetitionStatus.PendingApproval
        };

        // Chuyên viên thường (isUnitLead = false) cố tự duyệt kết luận
        var act = () => _workflowService.ValidateTransition(
            petition,
            PetitionStatus.Resolved,
            UserRole.Specialist,
            userDepartmentId: deptId,
            targetDepartmentId: null,
            resolutionSummary: "Kết luận chính thức",
            note: null,
            isUnitLead: false,
            currentUserId: specialistId
        );

        act.Should().Throw<ForbiddenException>()
            .WithMessage("*Chỉ Trưởng đơn vị chuyên môn mới có quyền xác nhận nghiệm thu*");
    }

    [Fact]
    public void ValidateTransition_UnitLead_ApproveReportToResolved_ShouldSucceed()
    {
        var deptId = Guid.NewGuid();
        var unitLeadId = Guid.NewGuid();
        var petition = new Petition
        {
            Id = Guid.NewGuid(),
            DepartmentId = deptId,
            AssignedUserId = Guid.NewGuid(),
            Status = PetitionStatus.PendingApproval
        };

        // Trưởng đơn vị (isUnitLead = true) duyệt kết luận
        var act = () => _workflowService.ValidateTransition(
            petition,
            PetitionStatus.Resolved,
            UserRole.Specialist,
            userDepartmentId: deptId,
            targetDepartmentId: null,
            resolutionSummary: "Trưởng đơn vị phê duyệt báo cáo nghiệm thu và ban hành kết luận xử lý vi phạm.",
            note: null,
            isUnitLead: true,
            currentUserId: unitLeadId
        );

        act.Should().NotThrow();
    }
}
