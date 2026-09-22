using AquaReflect.Application.Common.Security;
using FluentAssertions;
using Xunit;

namespace AquaReflect.UnitTests.Common;

public class InputSanitizerTests
{
    [Theory]
    [InlineData("<script>alert('XSS')</script>Ô nhiễm nguồn nước cảng Sa Kỳ", "Ô nhiễm nguồn nước cảng Sa Kỳ")]
    [InlineData("Nguyễn Văn Hai<iframe src='http://malicious.com'></iframe>", "Nguyễn Văn Hai")]
    [InlineData("<img src=x onerror=alert('hacked')>Bình Sơn", "Bình Sơn")]
    [InlineData("   <p>  Ao nuôi số 3  </p>   ", "Ao nuôi số 3")]
    [InlineData(null, "")]
    [InlineData("", "")]
    public void SanitizePlainText_ShouldRemoveHtmlAndScriptTags(string? input, string expected)
    {
        // Act
        var result = InputSanitizer.SanitizePlainText(input);

        // Assert
        result.Should().Be(expected);
    }

    [Fact]
    public void SanitizeRichText_ShouldPreserveSafeFormatting_AndRemoveScripts()
    {
        // Arrange
        var richTextWithXss = "<p><strong>Kết luận:</strong> Vi phạm quy định xả thải.<script>document.cookie='bad'</script></p>";

        // Act
        var result = InputSanitizer.SanitizeRichText(richTextWithXss);

        // Assert
        result.Should().Contain("<strong>Kết luận:</strong>");
        result.Should().NotContain("<script>");
        result.Should().NotContain("document.cookie");
    }
}
