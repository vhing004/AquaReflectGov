using MediatR;

namespace AquaReflect.Application.Features.Petitions.Commands.SubmitFeedback;

/// <summary>
/// Command gửi đánh giá chất lượng phục vụ từ công dân sau khi hồ sơ phản ánh đã được giải quyết
/// </summary>
public class SubmitFeedbackCommand : IRequest<SubmitFeedbackResultDto>
{
    /// <summary>Mã tra cứu hồ sơ phản ánh (TrackingCode, ví dụ: TS-202609-HGZH4)</summary>
    public string TrackingCode { get; set; } = string.Empty;

    /// <summary>Đánh giá sao chất lượng phục vụ (1 = Rất không hài lòng → 5 = Rất hài lòng)</summary>
    public int Rating { get; set; }

    /// <summary>Nhận xét tự do của công dân (tùy chọn, tối đa 1000 ký tự)</summary>
    public string? Comment { get; set; }
}
