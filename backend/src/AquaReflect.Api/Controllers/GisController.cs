using AquaReflect.Application.Common.Models;
using AquaReflect.Application.Features.Gis.DTOs;
using AquaReflect.Application.Features.Gis.Queries.GetHeatmapData;
using AquaReflect.Application.Features.Gis.Queries.GetPetitionsByRadius;
using AquaReflect.Application.Features.Gis.Queries.GetPetitionsGeoJson;
using AquaReflect.Application.Features.Gis.Queries.GetSpatialSummary;
using Microsoft.AspNetCore.Mvc;

namespace AquaReflect.Api.Controllers;

/// <summary>
/// API Bản đồ số và Dịch vụ Không gian Địa lý (GIS Service)
/// Phục vụ trực quan hóa các phản ánh thủy sản, dịch bệnh và cảnh báo IUU trên nền bản đồ số
/// </summary>
public class GisController : BaseApiController
{
    /// <summary>
    /// Xuất dữ liệu điểm phản ánh theo chuẩn quốc tế GeoJSON FeatureCollection (RFC 7946)
    /// Tương thích trực tiếp với Leaflet, Mapbox GL, OpenLayers và Google Maps
    /// </summary>
    /// <param name="query">Các tham số lọc Bounding Box (min/max Lat/Lng), danh mục, trạng thái, thời gian</param>
    /// <param name="cancellationToken">CancellationToken</param>
    /// <returns>Đối tượng GeoJSON FeatureCollection</returns>
    [HttpGet("petitions-geojson")]
    [Produces("application/geo+json", "application/json")]
    [ProducesResponseType(typeof(GeoJsonFeatureCollectionDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<GeoJsonFeatureCollectionDto>> GetPetitionsGeoJson(
        [FromQuery] GetPetitionsGeoJsonQuery query,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(query, cancellationToken);
        // Trả về trực tiếp chuẩn RFC 7946 ở root để client GIS có thể nạp thẳng vào map source
        return Ok(result);
    }

    /// <summary>
    /// Tìm kiếm và đo khoảng cách các điểm phản ánh lân cận theo bán kính không gian (Spatial Proximity Query)
    /// </summary>
    /// <param name="query">Tọa độ tâm (centerLat, centerLng), bán kính (radiusKm) và bộ lọc nghiệp vụ</param>
    /// <param name="cancellationToken">CancellationToken</param>
    /// <returns>Danh sách phản ánh trong bán kính kèm khoảng cách km chính xác</returns>
    [HttpGet("petitions-radius")]
    [ProducesResponseType(typeof(ApiResponse<SpatialRadiusResultDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<SpatialRadiusResultDto>>> GetPetitionsByRadius(
        [FromQuery] GetPetitionsByRadiusQuery query,
        CancellationToken cancellationToken)
    {
        if (query.CenterLat < -90 || query.CenterLat > 90 || query.CenterLng < -180 || query.CenterLng > 180)
        {
            return BadRequest(ApiResponse<object>.Fail("Tọa độ tâm không hợp lệ (Vĩ độ: -90 đến 90, Kinh độ: -180 đến 180)."));
        }

        var result = await Mediator.Send(query, cancellationToken);
        return HandleResult(ApiResponse<SpatialRadiusResultDto>.Ok(result, "Truy vấn điểm phản ánh theo bán kính thành công."));
    }

    /// <summary>
    /// Lấy tập dữ liệu điểm nhiệt tối ưu hóa dung lượng (Heatmap Data)
    /// Trọng số nhiệt (intensity weight) được chuẩn hóa từ 0.1 đến 1.0 theo mức độ khẩn cấp
    /// </summary>
    /// <param name="query">Bộ lọc danh mục, trạng thái và khoảng thời gian</param>
    /// <param name="cancellationToken">CancellationToken</param>
    /// <returns>Tập dữ liệu điểm nhiệt kèm mảng rút gọn [lat, lng, weight]</returns>
    [HttpGet("heatmap")]
    [ProducesResponseType(typeof(ApiResponse<HeatmapDataResultDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<HeatmapDataResultDto>>> GetHeatmapData(
        [FromQuery] GetHeatmapDataQuery query,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(query, cancellationToken);
        return HandleResult(ApiResponse<HeatmapDataResultDto>.Ok(result, "Lấy dữ liệu bản đồ nhiệt thành công."));
    }

    /// <summary>
    /// Báo cáo tổng hợp số liệu không gian theo địa bàn hành chính (Huyện/Thị xã Cà Mau) và chuyên mục
    /// </summary>
    /// <param name="query">Khoảng thời gian thống kê</param>
    /// <param name="cancellationToken">CancellationToken</param>
    /// <returns>Thống kê mật độ phản ánh theo từng địa bàn và tỷ lệ chuyên mục</returns>
    [HttpGet("spatial-summary")]
    [ProducesResponseType(typeof(ApiResponse<SpatialSummaryResultDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<SpatialSummaryResultDto>>> GetSpatialSummary(
        [FromQuery] GetSpatialSummaryQuery query,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(query, cancellationToken);
        return HandleResult(ApiResponse<SpatialSummaryResultDto>.Ok(result, "Tổng hợp dữ liệu không gian theo địa bàn thành công."));
    }
}
