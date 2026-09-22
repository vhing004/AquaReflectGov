using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Features.Petitions.Commands.CreatePetition;
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

public class CreatePetitionCommandHandlerTests
{
    private readonly Mock<IFileStorageService> _fileStorageMock = new();
    private readonly Mock<ICurrentUserService> _currentUserMock = new();
    private readonly Mock<INotificationService> _notificationMock = new();
    private readonly Mock<IEmailService> _emailMock = new();
    private readonly Mock<ITurnstileService> _turnstileMock = new();
    private readonly Mock<ILogger<CreatePetitionCommandHandler>> _loggerMock = new();

    private ApplicationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var context = new ApplicationDbContext(options);
        return context;
    }

    [Fact]
    public async Task Handle_ValidCommand_ShouldSavePetitionAndReturnTrackingCode()
    {
        // Arrange
        var context = CreateInMemoryDbContext();
        var categoryId = Guid.NewGuid();
        context.PetitionCategories.Add(new PetitionCategory
        {
            Id = categoryId,
            Name = "Ô nhiễm môi trường",
            Code = "ONMT",
            CategoryType = PetitionCategoryType.WaterPollution,
            DefaultSlaHours = 48,
            IsActive = true
        });
        await context.SaveChangesAsync();

        _turnstileMock.Setup(t => t.VerifyTokenAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var handler = new CreatePetitionCommandHandler(
            context,
            _fileStorageMock.Object,
            _currentUserMock.Object,
            _notificationMock.Object,
            _emailMock.Object,
            _turnstileMock.Object,
            _loggerMock.Object);

        var command = new CreatePetitionCommand
        {
            Title = "<script>alert('xss')</script>Phản ánh xả thải",
            Content = "Chi tiết vụ việc xả thải khu vực ao nuôi Sa Kỳ",
            CategoryId = categoryId,
            IsAnonymous = false,
            CitizenName = "Nguyễn Văn Hai"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.TrackingCode.Should().StartWith("TS-");

        var savedPetition = await context.Petitions.FirstOrDefaultAsync(p => p.TrackingCode == result.TrackingCode);
        savedPetition.Should().NotBeNull();
        savedPetition!.Title.Should().Be("Phản ánh xả thải"); // XSS stripped!
        savedPetition.Status.Should().Be(PetitionStatus.Submitted);
    }

    [Fact]
    public async Task Handle_HoneypotFilled_ShouldThrowBadRequestException()
    {
        // Arrange
        var context = CreateInMemoryDbContext();
        var handler = new CreatePetitionCommandHandler(
            context,
            _fileStorageMock.Object,
            _currentUserMock.Object,
            _notificationMock.Object,
            _emailMock.Object,
            _turnstileMock.Object,
            _loggerMock.Object);

        var command = new CreatePetitionCommand
        {
            Title = "Spam bot request",
            Content = "Test bot spam content",
            CategoryId = Guid.NewGuid(),
            Honeypot = "I am a bot"
        };

        // Act
        Func<Task> act = async () => await handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<BadRequestException>()
            .WithMessage("*truy cập tự động trái phép*");
    }
}
