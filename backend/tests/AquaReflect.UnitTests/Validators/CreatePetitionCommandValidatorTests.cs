using AquaReflect.Application.Features.Petitions.Commands.CreatePetition;
using FluentAssertions;
using Xunit;

namespace AquaReflect.UnitTests.Validators;

public class CreatePetitionCommandValidatorTests
{
    private readonly CreatePetitionCommandValidator _validator = new();

    [Fact]
    public void Validate_ValidCommand_ShouldNotHaveErrors()
    {
        // Arrange
        var command = new CreatePetitionCommand
        {
            Title = "Khởi công nạo vét luồng tàu cá Sa Kỳ",
            Content = "Đề nghị Chi cục Thủy sản khơi thông luồng lách cho tàu thuyền ra vào an toàn.",
            CategoryId = Guid.NewGuid(),
            IsAnonymous = false,
            CitizenName = "Nguyễn Văn Hai",
            CitizenPhone = "0912345678",
            CitizenEmail = "nguyenvanhai@gmail.com"
        };

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_EmptyTitle_ShouldHaveValidationError()
    {
        // Arrange
        var command = new CreatePetitionCommand
        {
            Title = "",
            Content = "Nội dung chi tiết đầy đủ phản ánh.",
            CategoryId = Guid.NewGuid()
        };

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Title");
    }

    [Fact]
    public void Validate_InvalidPhoneFormat_ShouldHaveValidationError()
    {
        // Arrange
        var command = new CreatePetitionCommand
        {
            Title = "Tiêu đề hợp lệ phản ánh",
            Content = "Nội dung chi tiết đầy đủ phản ánh.",
            CategoryId = Guid.NewGuid(),
            IsAnonymous = false,
            CitizenName = "Nguyễn Văn Hai",
            CitizenPhone = "12345" // SĐT không hợp lệ
        };

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "CitizenPhone");
    }

    [Fact]
    public void Validate_AnonymousMode_DoesNotRequireCitizenName()
    {
        // Arrange
        var command = new CreatePetitionCommand
        {
            Title = "Tiêu đề hợp lệ phản ánh",
            Content = "Nội dung chi tiết đầy đủ phản ánh.",
            CategoryId = Guid.NewGuid(),
            IsAnonymous = true,
            CitizenName = null
        };

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }
}
