using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Features.Petitions.Commands.AssignMember;
using AquaReflect.Domain.Entities;
using AquaReflect.Domain.Enums;
using AquaReflect.Domain.Exceptions;
using AquaReflect.Infrastructure.Data;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace AquaReflect.UnitTests.Handlers;

public class AssignMemberCommandHandlerTests
{
    private readonly Mock<ICurrentUserService> _currentUserMock;
    private readonly Mock<INotificationService> _notificationServiceMock;
    private readonly Mock<ILogger<AssignMemberCommandHandler>> _loggerMock;

    public AssignMemberCommandHandlerTests()
    {
        _currentUserMock = new Mock<ICurrentUserService>();
        _notificationServiceMock = new Mock<INotificationService>();
        _loggerMock = new Mock<ILogger<AssignMemberCommandHandler>>();
    }

    private ApplicationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task Handle_UnitLeadAssignsMemberInSameDepartment_ShouldSucceed()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var deptId = Guid.NewGuid();
        var unitLeadId = Guid.NewGuid();
        var memberId = Guid.NewGuid();

        var dept = new Department { Id = deptId, Name = "Đội Thanh tra Kiểm ngư", Code = "TTKN" };
        var unitLead = new User { Id = unitLeadId, Username = "kiemngu", FullName = "Lê Hoàng Long", Role = UserRole.Specialist, IsUnitLead = true, DepartmentId = deptId };
        var member = new User { Id = memberId, Username = "kiemngu_cb", FullName = "Nguyễn Văn Thụ", Role = UserRole.Specialist, IsUnitLead = false, DepartmentId = deptId };

        var petition = new Petition
        {
            Id = Guid.NewGuid(),
            TrackingCode = "TS-2026-TEST1",
            Title = "Phản ánh vi phạm IUU",
            Content = "Nội dung phản ánh",
            Status = PetitionStatus.Assigned,
            DepartmentId = deptId,
            Department = dept
        };

        context.Departments.Add(dept);
        context.Users.AddRange(unitLead, member);
        context.Petitions.Add(petition);
        await context.SaveChangesAsync();

        _currentUserMock.Setup(c => c.IsAuthenticated).Returns(true);
        _currentUserMock.Setup(c => c.Role).Returns(UserRole.Specialist);
        _currentUserMock.Setup(c => c.IsUnitLead).Returns(true);
        _currentUserMock.Setup(c => c.DepartmentId).Returns(deptId);
        _currentUserMock.Setup(c => c.UserId).Returns(unitLeadId);
        _currentUserMock.Setup(c => c.Username).Returns("kiemngu");

        var handler = new AssignMemberCommandHandler(
            context,
            _currentUserMock.Object,
            _notificationServiceMock.Object,
            _loggerMock.Object);

        var command = new AssignMemberCommand
        {
            PetitionId = petition.Id,
            AssignedUserId = memberId,
            Note = "Giao đồng chí Thụ xuống địa bàn xác minh"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.AssignedUserId.Should().Be(memberId);
        result.AssignedUserName.Should().Be("Nguyễn Văn Thụ");

        var updatedPetition = await context.Petitions.FindAsync(petition.Id);
        updatedPetition!.AssignedUserId.Should().Be(memberId);

        var history = await context.PetitionHistories.FirstOrDefaultAsync(h => h.PetitionId == petition.Id);
        history.Should().NotBeNull();
        history!.PerformedByUserId.Should().Be(unitLeadId);
        history.Action.Should().Contain("Nguyễn Văn Thụ");

        _notificationServiceMock.Verify(n => n.NotifyPetitionAssignedAsync(
            It.Is<Petition>(p => p.Id == petition.Id),
            It.Is<User>(u => u.Id == memberId),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_RegularSpecialistWithoutUnitLead_ShouldThrowForbidden()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var deptId = Guid.NewGuid();
        var memberId = Guid.NewGuid();

        var dept = new Department { Id = deptId, Name = "Phòng Nuôi trồng", Code = "PNTTS" };
        var petition = new Petition
        {
            Id = Guid.NewGuid(),
            TrackingCode = "TS-2026-TEST2",
            Status = PetitionStatus.Assigned,
            DepartmentId = deptId,
            Department = dept
        };

        context.Departments.Add(dept);
        context.Petitions.Add(petition);
        await context.SaveChangesAsync();

        _currentUserMock.Setup(c => c.IsAuthenticated).Returns(true);
        _currentUserMock.Setup(c => c.Role).Returns(UserRole.Specialist);
        _currentUserMock.Setup(c => c.IsUnitLead).Returns(false); // Cán bộ thường, không phải trưởng
        _currentUserMock.Setup(c => c.DepartmentId).Returns(deptId);

        var handler = new AssignMemberCommandHandler(
            context,
            _currentUserMock.Object,
            _notificationServiceMock.Object,
            _loggerMock.Object);

        var command = new AssignMemberCommand
        {
            PetitionId = petition.Id,
            AssignedUserId = memberId
        };

        // Act & Assert
        var act = async () => await handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ForbiddenException>()
            .WithMessage("*Trưởng đơn vị chuyên môn*");
    }

    [Fact]
    public async Task Handle_AssignMemberFromDifferentDepartment_ShouldThrowBadRequest()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var dept1Id = Guid.NewGuid();
        var dept2Id = Guid.NewGuid();
        var otherMemberId = Guid.NewGuid();

        var dept1 = new Department { Id = dept1Id, Name = "Đội Thanh tra Kiểm ngư", Code = "TTKN" };
        var dept2 = new Department { Id = dept2Id, Name = "Phòng Nuôi trồng", Code = "PNTTS" };

        var otherMember = new User { Id = otherMemberId, Username = "nuoitrong_cb", FullName = "Bùi Văn An", Role = UserRole.Specialist, DepartmentId = dept2Id };

        var petition = new Petition
        {
            Id = Guid.NewGuid(),
            TrackingCode = "TS-2026-TEST3",
            Status = PetitionStatus.Assigned,
            DepartmentId = dept1Id,
            Department = dept1
        };

        context.Departments.AddRange(dept1, dept2);
        context.Users.Add(otherMember);
        context.Petitions.Add(petition);
        await context.SaveChangesAsync();

        _currentUserMock.Setup(c => c.IsAuthenticated).Returns(true);
        _currentUserMock.Setup(c => c.Role).Returns(UserRole.Specialist);
        _currentUserMock.Setup(c => c.IsUnitLead).Returns(true);
        _currentUserMock.Setup(c => c.DepartmentId).Returns(dept1Id);

        var handler = new AssignMemberCommandHandler(
            context,
            _currentUserMock.Object,
            _notificationServiceMock.Object,
            _loggerMock.Object);

        var command = new AssignMemberCommand
        {
            PetitionId = petition.Id,
            AssignedUserId = otherMemberId
        };

        // Act & Assert
        var act = async () => await handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<BadRequestException>()
            .WithMessage("*không thuộc đơn vị*");
    }
}
