using AquaReflect.Application.Common.Models;
using AquaReflect.Application.Features.Petitions.Commands.CreatePetition;
using AquaReflect.Application.Features.Petitions.DTOs;
using AquaReflect.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

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
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ApiResponse<CreatePetitionResultDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
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
            Files = fileUploadModels
        };

        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(ApiResponse<CreatePetitionResultDto>.Created(result, "Tiếp nhận phản ánh kiến nghị thành công."));
    }
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
}
