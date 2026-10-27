using AquaReflect.Api.Extensions;
using AquaReflect.Application.Common.Models;
using AquaReflect.Application.Features.Petitions.Commands.CreatePetition;
using AquaReflect.Application.Features.Petitions.Commands.SubmitAdditionalInfo;
using AquaReflect.Application.Features.Petitions.Commands.SubmitFeedback;
using AquaReflect.Application.Features.Petitions.Commands.WithdrawPetition;
using AquaReflect.Application.Features.Petitions.DTOs;
using AquaReflect.Application.Features.Petitions.Queries.GetPetitionsByPhone;
using AquaReflect.Application.Features.Petitions.Queries.GetPublicResolvedPetitions;
using AquaReflect.Application.Features.Petitions.Queries.TrackPetitionByCode;
using AquaReflect.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AquaReflect.Api.Controllers;

public class PetitionsController : BaseApiController
{
    /// <summary>
    /// Lấy danh sách hồ sơ phản ánh đã giải quyết công khai (hiển thị trên Trang chủ)
    /// </summary>
    /// <param name="categoryCode">Mã chuyên mục lọc (tùy chọn, ví dụ: VI_PHAM_IUU)</param>
    /// <param name="sortBy">Sắp xếp: "latest" (mới nhất) hoặc "rating" (đánh giá cao nhất)</param>
    /// <param name="limit">Số lượng tối đa (mặc định: 6, tối đa: 20)</param>
    /// <param name="cancellationToken">CancellationToken</param>
    /// <returns>Danh sách hồ sơ đã giải quyết kèm kết luận thụ lý và đánh giá CSAT</returns>
    [HttpGet("public-resolved")]
    [ProducesResponseType(typeof(ApiResponse<List<PublicResolvedPetitionDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<List<PublicResolvedPetitionDto>>>> GetPublicResolvedPetitions(
        [FromQuery] string? categoryCode,
        [FromQuery] string? keyword = null,
        [FromQuery] string sortBy = "latest",
        [FromQuery] int limit = 6,
        [FromQuery] int? page = null,
        [FromQuery] int? pageSize = null,
        CancellationToken cancellationToken = default)
    {
        var query = new GetPublicResolvedPetitionsQuery
        {
            CategoryCode = categoryCode,
            Keyword = keyword,
            SortBy = sortBy,
            Limit = limit,
            Page = page,
            PageSize = pageSize
        };
        var result = await Mediator.Send(query, cancellationToken);
        return HandleResult(ApiResponse<List<PublicResolvedPetitionDto>>.Ok(
            result, $"Tìm thấy {result.Count} hồ sơ phản ánh đã giải quyết."));
    }
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
        // Kịch bản 21-22 & Mục 3.6: Token nội bộ không gọi được các endpoint thao tác của công dân trên cổng công khai
        if (User.Identity?.IsAuthenticated == true && (User.IsInRole("Dispatcher") || User.IsInRole("Specialist") || User.IsInRole("SuperAdmin")))
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.Fail(
                "Cán bộ nội bộ không được gửi phản ánh trực tuyến bằng tài khoản nội bộ. Vui lòng sử dụng chức năng Tiếp nhận hộ hoặc đăng xuất.", StatusCodes.Status403Forbidden));
        }

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

        double? lat = request.Latitude;
        double? lng = request.Longitude;

        // Phân tích chuỗi GpsCoordinates nếu có mà chưa có lat/lng chuẩn
        if ((!lat.HasValue || !lng.HasValue) && !string.IsNullOrWhiteSpace(request.GpsCoordinates))
        {
            var cleanGps = request.GpsCoordinates.Trim();
            // Thử dạng số thập phân: "10.04167, 106.58333" hoặc "10.04167°N, 106.58333°E"
            var decMatch = System.Text.RegularExpressions.Regex.Match(cleanGps, @"([+-]?\d+(?:\.\d+)?)\s*(?:°?\s*[NS])?\s*[,;]\s*([+-]?\d+(?:\.\d+)?)\s*(?:°?\s*[EW])?", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            if (decMatch.Success &&
                double.TryParse(decMatch.Groups[1].Value, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var pLat) &&
                double.TryParse(decMatch.Groups[2].Value, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var pLng))
            {
                lat = pLat;
                lng = pLng;
            }
            else
            {
                // Thử dạng độ phút giây: 15°13'45.2"N, 108°52'10.5"E
                var dmsMatch = System.Text.RegularExpressions.Regex.Match(cleanGps, @"(\d+)°\s*(\d+)'\s*([\d.]+)\""?\s*([NS])\s*[,;]\s*(\d+)°\s*(\d+)'\s*([\d.]+)\""?\s*([EW])", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
                if (dmsMatch.Success)
                {
                    double dLat = double.Parse(dmsMatch.Groups[1].Value) + double.Parse(dmsMatch.Groups[2].Value) / 60.0 + double.Parse(dmsMatch.Groups[3].Value, System.Globalization.CultureInfo.InvariantCulture) / 3600.0;
                    if (dmsMatch.Groups[4].Value.Equals("S", StringComparison.OrdinalIgnoreCase)) dLat = -dLat;

                    double dLng = double.Parse(dmsMatch.Groups[5].Value) + double.Parse(dmsMatch.Groups[6].Value) / 60.0 + double.Parse(dmsMatch.Groups[7].Value, System.Globalization.CultureInfo.InvariantCulture) / 3600.0;
                    if (dmsMatch.Groups[8].Value.Equals("W", StringComparison.OrdinalIgnoreCase)) dLng = -dLng;

                    lat = dLat;
                    lng = dLng;
                }
            }
        }

        var command = new CreatePetitionCommand
        {
            Title = request.Title,
            Content = content,
            CategoryId = request.CategoryId,
            AddressText = addressText,
            Latitude = lat,
            Longitude = lng,
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
        // Bắt buộc người dùng phải đăng nhập tài khoản công dân để đánh giá phản ánh
        if (User.Identity?.IsAuthenticated != true)
        {
            return StatusCode(StatusCodes.Status401Unauthorized, ApiResponse<object>.Fail(
                "Vui lòng đăng nhập tài khoản công dân để gửi đánh giá chất lượng phục vụ.", StatusCodes.Status401Unauthorized));
        }

        // Kịch bản 21: Token nội bộ gọi API công dân chấm CSAT trả về 403
        if (User.IsInRole("Dispatcher") || User.IsInRole("Specialist") || User.IsInRole("SuperAdmin"))
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.Fail(
                "Cán bộ nội bộ không được quyền tự đánh giá hài lòng hoặc can thiệp CSAT của người dân.", StatusCodes.Status403Forbidden));
        }

        var command = new SubmitFeedbackCommand
        {
            TrackingCode = trackingCode,
            Rating = request.Rating,
            Comment = request.Comment
        };
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(ApiResponse<SubmitFeedbackResultDto>.Created(result, result.Message));
    }

    /// <summary>
    /// Lấy thông tin đánh giá CSAT và kiểm tra điều kiện đề nghị xem xét lại (Reopen).
    /// </summary>
    /// <param name="trackingCode">Mã tra cứu hồ sơ (ví dụ: TS-202610-AB3KZ)</param>
    /// <param name="cancellationToken">CancellationToken</param>
    /// <returns>Thông tin điểm CSAT và cờ CanReopen</returns>
    [HttpGet("{trackingCode}/csat")]
    [ProducesResponseType(typeof(ApiResponse<CsatDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<CsatDto>>> GetCsat(
        string trackingCode,
        CancellationToken cancellationToken)
    {
        var query = new AquaReflect.Application.Features.Petitions.Queries.GetPetitionCsat.GetPetitionCsatQuery
        {
            TrackingCode = trackingCode
        };
        var result = await Mediator.Send(query, cancellationToken);
        return HandleResult(ApiResponse<CsatDto>.Ok(result));
    }

    /// <summary>
    /// Công dân gửi đề nghị xem xét lại hồ sơ phản ánh (Reopen khi CSAT ≤ 2 sao trong vòng 14 ngày).
    /// </summary>
    /// <param name="trackingCode">Mã tra cứu hồ sơ</param>
    /// <param name="request">Lý do đề nghị xem xét lại và mã PIN nếu là đơn vô danh</param>
    /// <param name="cancellationToken">CancellationToken</param>
    /// <returns>Xác nhận yêu cầu đã được tiếp nhận</returns>
    [HttpPost("{trackingCode}/reopen")]
    [EnableRateLimiting(RateLimiterExtensions.FeedbackPolicy)]
    [ProducesResponseType(typeof(ApiResponse<AquaReflect.Application.Features.Petitions.Commands.RequestReopen.RequestPetitionReopenResultDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<AquaReflect.Application.Features.Petitions.Commands.RequestReopen.RequestPetitionReopenResultDto>>> RequestReopen(
        string trackingCode,
        [FromBody] RequestReopenRequest request,
        CancellationToken cancellationToken)
    {
        // Kịch bản 22: Token nội bộ gọi API công dân đề nghị mở lại trả về 403
        if (User.Identity?.IsAuthenticated == true && (User.IsInRole("Dispatcher") || User.IsInRole("Specialist") || User.IsInRole("SuperAdmin")))
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.Fail(
                "Cán bộ nội bộ không được quyền đề nghị mở lại hồ sơ thay cho người dân.", StatusCodes.Status403Forbidden));
        }
        var command = new AquaReflect.Application.Features.Petitions.Commands.RequestReopen.RequestPetitionReopenCommand
        {
            TrackingCode = trackingCode,
            Reason = request.Reason,
            AccessPin = request.AccessPin
        };
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(ApiResponse<AquaReflect.Application.Features.Petitions.Commands.RequestReopen.RequestPetitionReopenResultDto>.Ok(result, result.Message));
    }

    /// <summary>
    /// Rút phản ánh kiến nghị (Submitted hoặc Assigned → Withdrawn).
    /// - Đơn định danh: Cần đăng nhập với tư cách chủ sở hữu đơn hoặc cán bộ Dispatcher/SuperAdmin.
    /// - Đơn vô danh: Cần cung cấp mã PIN bảo mật đã nhận lúc nộp đơn.
    /// </summary>
    /// <param name="trackingCode">Mã hồ sơ tra cứu (ví dụ: TS-202610-AB3KZ)</param>
    /// <param name="request">Mã PIN (nếu vô danh) và lý do rút đơn (tùy chọn)</param>
    /// <param name="cancellationToken">CancellationToken</param>
    [HttpPost("{trackingCode}/withdraw")]
    [EnableRateLimiting(RateLimiterExtensions.FeedbackPolicy)]
    [ProducesResponseType(typeof(ApiResponse<WithdrawPetitionResultDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<WithdrawPetitionResultDto>>> WithdrawPetition(
        string trackingCode,
        [FromBody] WithdrawPetitionRequest request,
        CancellationToken cancellationToken)
    {
        // Kịch bản 22: Token nội bộ gọi API công dân rút đơn trả về 403
        if (User.Identity?.IsAuthenticated == true && (User.IsInRole("Dispatcher") || User.IsInRole("Specialist") || User.IsInRole("SuperAdmin")))
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.Fail(
                "Cán bộ nội bộ không được quyền thao tác rút đơn thay cho công dân.", StatusCodes.Status403Forbidden));
        }

        var command = new WithdrawPetitionCommand
        {
            TrackingCode = trackingCode,
            AccessPin = request.AccessPin,
            Reason = request.Reason
        };
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(ApiResponse<WithdrawPetitionResultDto>.Ok(result, result.Message));
    }

    /// <summary>
    /// Công dân gửi thông tin/tệp minh chứng bổ sung (NeedInfo -> unpause SLA).
    /// </summary>
    /// <param name="trackingCode">Mã tra cứu hồ sơ (ví dụ: TS-202610-AB3KZ)</param>
    /// <param name="request">Nội dung giải trình, mã PIN (nếu vô danh) và các tệp đính kèm mới</param>
    /// <param name="cancellationToken">CancellationToken</param>
    [HttpPost("{trackingCode}/additional-info")]
    [Consumes("multipart/form-data")]
    [EnableRateLimiting(RateLimiterExtensions.FeedbackPolicy)]
    [ProducesResponseType(typeof(ApiResponse<SubmitAdditionalInfoResultDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<SubmitAdditionalInfoResultDto>>> SubmitAdditionalInfo(
        string trackingCode,
        [FromForm] SubmitAdditionalInfoRequest request,
        CancellationToken cancellationToken)
    {
        // Kịch bản 22: Token nội bộ gọi API công dân bổ sung thông tin trả về 403
        if (User.Identity?.IsAuthenticated == true && (User.IsInRole("Dispatcher") || User.IsInRole("Specialist") || User.IsInRole("SuperAdmin")))
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.Fail(
                "Cán bộ nội bộ không được quyền nộp thông tin bổ sung thay cho công dân.", StatusCodes.Status403Forbidden));
        }

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

        var command = new SubmitAdditionalInfoCommand
        {
            TrackingCode = trackingCode,
            AccessPin = request.AccessPin,
            CitizenPhone = request.CitizenPhone,
            AdditionalContent = request.AdditionalContent,
            Files = fileUploadModels
        };
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(ApiResponse<SubmitAdditionalInfoResultDto>.Ok(result, result.Message));
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
    /// Chuỗi tọa độ GPS định dạng tự do từ client (vd: 10.04167°N, 106.58333°E hoặc 10.04167, 106.58333)
    /// </summary>
    public string? GpsCoordinates { get; set; }

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

public class WithdrawPetitionRequest
{
    /// <summary>
    /// Mã PIN bảo mật plain-text (bắt buộc với đơn vô danh, bỏ trống với đơn định danh).
    /// </summary>
    public string? AccessPin { get; set; }

    /// <summary>
    /// Lý do rút đơn (tùy chọn, tối đa 500 ký tự).
    /// </summary>
    public string? Reason { get; set; }
}

public class SubmitAdditionalInfoRequest
{
    /// <summary>
    /// Mã PIN bảo mật plain-text (bắt buộc với đơn vô danh, bỏ trống với đơn định danh).
    /// </summary>
    public string? AccessPin { get; set; }

    /// <summary>
    /// Số điện thoại người gửi (dùng xác thực phụ đối với hồ sơ định danh nếu không đăng nhập JWT).
    /// </summary>
    public string? CitizenPhone { get; set; }

    /// <summary>
    /// Nội dung bổ sung / giải trình thông tin theo yêu cầu của cán bộ.
    /// </summary>
    public string AdditionalContent { get; set; } = string.Empty;

    /// <summary>
    /// Các tệp hình ảnh, video, tài liệu minh chứng mới gửi kèm.
    /// </summary>
    public List<IFormFile>? Files { get; set; }
}

public class RequestReopenRequest
{
    /// <summary>
    /// Lý do đề nghị xem xét lại hồ sơ (tối thiểu 10 ký tự).
    /// </summary>
    public string Reason { get; set; } = string.Empty;

    /// <summary>
    /// Mã PIN bảo mật (nếu là đơn vô danh).
    /// </summary>
    public string? AccessPin { get; set; }
}

