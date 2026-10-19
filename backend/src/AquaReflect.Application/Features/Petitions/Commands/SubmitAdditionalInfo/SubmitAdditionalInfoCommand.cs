using AquaReflect.Application.Common.Models;
using AquaReflect.Application.Features.Petitions.DTOs;
using MediatR;

namespace AquaReflect.Application.Features.Petitions.Commands.SubmitAdditionalInfo;

/// <summary>
/// Lệnh tiếp nhận tài liệu / thông tin hiện trường bổ sung từ công dân (NeedInfo -> unpause SLA).
/// </summary>
public class SubmitAdditionalInfoCommand : IRequest<SubmitAdditionalInfoResultDto>
{
    /// <summary>
    /// Mã tra cứu hồ sơ phản ánh (VD: TS-2026-X89K2).
    /// </summary>
    public string TrackingCode { get; set; } = string.Empty;

    /// <summary>
    /// Mã PIN bảo mật 8 ký tự (bắt buộc đối với hồ sơ ẩn danh).
    /// </summary>
    public string? AccessPin { get; set; }

    /// <summary>
    /// Số điện thoại người gửi (dùng xác thực phụ đối với hồ sơ định danh nếu không đăng nhập JWT).
    /// </summary>
    public string? CitizenPhone { get; set; }

    /// <summary>
    /// Nội dung giải trình, cung cấp thêm thông tin theo yêu cầu của cán bộ.
    /// </summary>
    public string AdditionalContent { get; set; } = string.Empty;

    /// <summary>
    /// Các tệp hình ảnh, video, tài liệu minh chứng mới gửi kèm.
    /// </summary>
    public List<FileUploadModel> Files { get; set; } = new();
}
