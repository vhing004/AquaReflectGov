using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using AquaReflect.Application.Common.Models;
using AquaReflect.Application.Features.Categories.DTOs;
using AquaReflect.Application.Features.Petitions.DTOs;
using AquaReflect.IntegrationTests.Common;
using FluentAssertions;
using Xunit;

namespace AquaReflect.IntegrationTests.Controllers;

public class PetitionsControllerTests : IClassFixture<CustomWebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public PetitionsControllerTests(CustomWebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetCategories_PublicEndpoint_ShouldReturn200OKAndCategoryList()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/categories");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var json = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<List<CategoryDto>>>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            Converters = { new JsonStringEnumConverter() }
        });

        apiResponse.Should().NotBeNull();
        apiResponse!.Success.Should().BeTrue();
        apiResponse.Data.Should().NotBeNull();
        apiResponse.Data.Should().NotBeEmpty();
    }
}
