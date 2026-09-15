namespace AquaReflect.Application.Features.Petitions.Commands.SubmitFeedback;

/// <summary>
/// Kết quả trả về sau khi công dân gửi đánh giá thành công
/// </summary>
public class SubmitFeedbackResultDto
{
    public Guid FeedbackId { get; set; }
    public string TrackingCode { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime FeedbackAt { get; set; }
    public string Message { get; set; } = string.Empty;
}
