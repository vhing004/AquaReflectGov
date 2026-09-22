using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using AquaReflect.Application.Common.Models;
using AquaReflect.Application.Features.Auth.DTOs;
using AquaReflect.IntegrationTests.Common;
using FluentAssertions;
using Xunit;

namespace AquaReflect.IntegrationTests.Controllers;

public class AuthControllerTests : IClassFixture<CustomWebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public AuthControllerTests(CustomWebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Login_WithValidAdminCredentials_ShouldReturn200OKAndToken()
    {
        // Arrange
        var loginBody = new
        {
            UsernameOrEmail = "admin",
            Password = "Admin@123"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", loginBody);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var json = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<AuthResponseDto>>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            Converters = { new JsonStringEnumConverter() }
        });

        apiResponse.Should().NotBeNull();
        apiResponse!.Success.Should().BeTrue();
        apiResponse.Data.Should().NotBeNull();
        apiResponse.Data!.AccessToken.Should().NotBeNullOrEmpty();
    }
}
