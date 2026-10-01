using System.Net;
using AquaReflect.IntegrationTests.Common;
using FluentAssertions;
using Xunit;

namespace AquaReflect.IntegrationTests.Controllers;

public class GisControllerTests : IClassFixture<CustomWebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public GisControllerTests(CustomWebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetPetitionsGeoJson_ShouldReturn200OKAndValidGeoJson()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/gis/petitions-geojson");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var json = await response.Content.ReadAsStringAsync();
        json.Should().Contain("\"type\":\"FeatureCollection\"");
        json.Should().Contain("\"features\":");
    }

    [Fact]
    public async Task GetHeatmap_ShouldReturn200OKAndRawArray()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/gis/heatmap");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var json = await response.Content.ReadAsStringAsync();
        json.Should().Contain("\"rawArray\":");
    }

    [Fact]
    public async Task GetPetitionsByRadius_WithoutAuth_ShouldReturn401Unauthorized()
    {
        // Act - Chưa đăng nhập cố truy cập endpoint bán kính không gian
        var response = await _client.GetAsync("/api/v1/gis/petitions-radius?centerLat=9.176&centerLng=105.15&radiusKm=5");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetSpatialSummary_WithoutAuth_ShouldReturn401Unauthorized()
    {
        // Act - Chưa đăng nhập cố truy cập endpoint tổng hợp không gian
        var response = await _client.GetAsync("/api/v1/gis/spatial-summary");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
