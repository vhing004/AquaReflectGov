using AquaReflect.Api.Extensions;
using AquaReflect.Application.Common.Models;
using AquaReflect.Application.Features.Petitions.Commands.CreatePetition;
using AquaReflect.Application.Features.Petitions.Commands.SubmitFeedback;
using AquaReflect.Application.Features.Petitions.DTOs;
using AquaReflect.Application.Features.Petitions.Queries.GetPetitionsByPhone;
using AquaReflect.Application.Features.Petitions.Queries.TrackPetitionByCode;
using AquaReflect.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AquaReflect.Api.Controllers;

public class PetitionsController : BaseApiController
{
    /// <summary>
    /// Tiếp nhận phản ánh kiến nghị mới từ người dân / cơ sở nuôi trồng thủy sản (Hỗ trợ kèm tệp ảnh/video thực địa)
    /// </summary>
    /// <param name="request">Thông tin biểu mẫu phản ánh và danh sách tệp đính kèm</param>
    /// <param name="cancellationToken">CancellationToken</param>
    /// <returns>Thông tin tiếp nhận, mã tra cứu duy nhất và hạn xử lý SLA</returns>
    [HttpPost]
    [EnableRateLimiting(RateLimiterExtensions.PetitionSubmitPolicy)]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ApiResponse<CreatePetitionResultDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<ApiResponse<CreatePetitionResultDto>>> CreatePetition(
        [FromForm] CreatePetitionRequest request,
        CancellationToken cancellationToken)
    {
        var fileUploadModels = new List<FileUploadModel>();
        if (request.Files != null && request.Files.Count > 0)
        {
            foreach (var formFile in request.Files)
            {
                if (formFile.Length > 0)
                {
                    fileUploadModels.Add(new FileUploadModel
                    {
                        ContentStream = formFile.OpenReadStream(),
                        FileName = formFile.FileName,
                        ContentType = formFile.ContentType,
                        Length = formFile.Length
                    });
                }
            }
        }

        var content = !string.IsNullOrWhiteSpace(request.Content) 
            ? request.Content 
            : request.Description ?? string.Empty;
        var addressText = !string.IsNullOrWhiteSpace(request.AddressText) 
            ? request.AddressText 
            : request.Location;

        var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();

        var command = new CreatePetitionCommand
        {
            Title = request.Title,
            Content = content,
            CategoryId = request.CategoryId,
            AddressText = addressText,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            AdministrativeUnitId = request.AdministrativeUnitId,
            IsAnonymous = request.IsAnonymous,
            CitizenName = request.CitizenName,
            CitizenPhone = request.CitizenPhone,
            CitizenEmail = request.CitizenEmail,
            CitizenIdCard = request.CitizenIdCard,
            PriorityLevel = request.PriorityLevel,
            Files = fileUploadModels,
            TurnstileToken = request.TurnstileToken,
            Honeypot = request.Honeypot,
            ClientIp = clientIp
        };

        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(ApiResponse<CreatePetitionResultDto>.Created(result, "Tiếp nhận phản ánh kiến nghị thành công."));
    }

    /// <summary>
    /// Tra cứu tiến độ giải quyết phản ánh kiến nghị công khai bằng mã tra cứu (TrackingCode)
    /// </summary>
    /// <param name="trackingCode">Mã biên nhận hồ sơ (ví dụ: TS-202609-HGZH4)</param>
    /// <param name="phone">Số điện thoại người gửi (tùy chọn - dùng để xác thực quyền xem hồ sơ)</param>
    /// <param name="cancellationToken">CancellationToken</param>
    /// <returns>Chi tiết tiến độ, dòng thời gian 4 bước, tệp đính kèm và văn bản kết luận giải quyết</returns>
    [HttpGet("track/{trackingCode}")]
    [ProducesResponseType(typeof(ApiResponse<PetitionTrackingDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<PetitionTrackingDto>>> TrackPetition(
        string trackingCode,
        [FromQuery] string? phone,
        CancellationToken cancellationToken)
    {
        var query = new TrackPetitionByCodeQuery(trackingCode, phone);
        var result = await Mediator.Send(query, cancellationToken);
        return HandleResult(ApiResponse<PetitionTrackingDto>.Ok(result, "Tra cứu thông tin tiến độ phản ánh thành công."));
    }

    /// <summary>
    /// Tra cứu danh sách các hồ sơ phản ánh kiến nghị theo số điện thoại công dân/ngư dân
    /// </summary>
    /// <param name="phone">Số điện thoại người gửi phản ánh</param>
    /// <param name="cancellationToken">CancellationToken</param>
    /// <returns>Danh sách các hồ sơ kiến nghị đã gửi</returns>
    [HttpGet("by-phone")]
    [ProducesResponseType(typeof(ApiResponse<List<PetitionSummaryDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<List<PetitionSummaryDto>>>> GetPetitionsByPhone(
        [FromQuery] string phone,
        CancellationToken cancellationToken)
    {
        var query = new GetPetitionsByPhoneQuery(phone);
        var result = await Mediator.Send(query, cancellationToken);
        return HandleResult(ApiResponse<List<PetitionSummaryDto>>.Ok(result, $"Tìm thấy {result.Count} hồ sơ phản ánh kiến nghị."));
    }

    /// <summary>
    /// Công dân gửi đánh giá chất lượng phục vụ sau khi hồ sơ phản ánh đã được giải quyết
    /// </summary>
    /// <param name="trackingCode">Mã tra cứu hồ sơ (ví dụ: TS-202609-HGZH4)</param>
    /// <param name="request">Đánh giá sao (1-5) và nhận xét tùy chọn</param>
    /// <param name="cancellationToken">CancellationToken</param>
    /// <returns>Xác nhận đánh giá đã được ghi nhận thành công</returns>
    [HttpPost("{trackingCode}/feedback")]
    [EnableRateLimiting(RateLimiterExtensions.FeedbackPolicy)]
    [ProducesResponseType(typeof(ApiResponse<SubmitFeedbackResultDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<ApiResponse<SubmitFeedbackResultDto>>> SubmitFeedback(
        string trackingCode,
        [FromBody] SubmitFeedbackRequest request,
        CancellationToken cancellationToken)
    {
        var command = new SubmitFeedbackCommand
        {
            TrackingCode = trackingCode,
            Rating = request.Rating,
            Comment = request.Comment
        };
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(ApiResponse<SubmitFeedbackResultDto>.Created(result, result.Message));
    }
}

public class SubmitFeedbackRequest
{
    /// <summary>
    /// Điểm đánh giá chất lượng phục vụ từ 1 (Rất không hài lòng) đến 5 (Rất hài lòng)
    /// </summary>
    public int Rating { get; set; }

    /// <summary>
    /// Nhận xét tự do của công dân (tùy chọn, tối đa 1000 ký tự)
    /// </summary>
    public string? Comment { get; set; }
}

public class CreatePetitionRequest
{
    /// <summary>
    /// Tiêu đề phản ánh ngắn gọn (ví dụ: Đề nghị khơi thông luồng ra vào cảng Sa Kỳ...)
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Nội dung chi tiết diễn biến sự việc, mức độ ảnh hưởng và đề xuất xử lý
    /// </summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Bí danh cho Content nếu client gửi Description
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// ID danh mục phản ánh (lấy từ /api/v1/categories)
    /// </summary>
    public Guid CategoryId { get; set; }

    /// <summary>
    /// Địa chỉ mô tả nơi xảy ra sự việc (vd: Ao nuôi số 3, Xã Bình Châu, Huyện Bình Sơn)
    /// </summary>
    public string? AddressText { get; set; }

    /// <summary>
    /// Bí danh cho AddressText nếu client gửi Location
    /// </summary>
    public string? Location { get; set; }

    /// <summary>
    /// Vĩ độ GPS thực địa (WGS84)
    /// </summary>
    public double? Latitude { get; set; }

    /// <summary>
    /// Kinh độ GPS thực địa (WGS84)
    /// </summary>
    public double? Longitude { get; set; }

    /// <summary>
    /// Mã đơn vị hành chính quản lý địa bàn (tùy chọn)
    /// </summary>
    public int? AdministrativeUnitId { get; set; }

    /// <summary>
    /// Lựa chọn gửi ẩn danh để bảo mật thông tin với bên ngoài (Mặc định: false)
    /// </summary>
    public bool IsAnonymous { get; set; } = false;

    /// <summary>
    /// Họ và tên người phản ánh (bắt buộc nếu không ẩn danh)
    /// </summary>
    public string? CitizenName { get; set; }

    /// <summary>
    /// Số điện thoại liên hệ nhận thông báo tiến độ SMS/Zalo
    /// </summary>
    public string? CitizenPhone { get; set; }

    /// <summary>
    /// Địa chỉ email nhận biên nhận điện tử
    /// </summary>
    public string? CitizenEmail { get; set; }

    /// <summary>
    /// Số CCCD / Số hiệu tàu cá người phản ánh
    /// </summary>
    public string? CitizenIdCard { get; set; }

    /// <summary>
    /// Mức độ ưu tiên đề xuất (Normal, High, Urgent, Emergency). Nếu để trống, hệ thống tự động suy diễn theo Danh mục SLA.
    /// </summary>
    public PriorityLevel? PriorityLevel { get; set; }

    /// <summary>
    /// Danh sách tệp đính kèm (Ảnh hiện trường JPG/PNG, Video MP4, Tài liệu PDF - Tối đa 5 tệp, 25MB/tệp)
    /// </summary>
    public List<IFormFile>? Files { get; set; }

    /// <summary>
    /// Token bảo mật xác minh chống Spam từ Cloudflare Turnstile
    /// </summary>
    public string? TurnstileToken { get; set; }

    /// <summary>
    /// Bẫy Bot ẩn (Honeypot). Người dùng thật sẽ bỏ trống trường này.
    /// </summary>
    public string? Honeypot { get; set; }
}
