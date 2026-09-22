namespace AquaReflect.Application.Features.Dashboard.DTOs;

/// <summary>
/// Thống kê chỉ số hài lòng của người dân (CSAT) và phân bổ số sao đánh giá
/// </summary>
public class SatisfactionStatDto
{
    /// <summary>
    /// Điểm đánh giá trung bình (thang điểm 1.0 đến 5.0)
    /// </summary>
    public double AverageRating { get; set; }

    /// <summary>
    /// Tổng số lượt công dân đã gửi đánh giá hài lòng
    /// </summary>
    public int TotalFeedbacks { get; set; }

    /// <summary>
    /// Số lượng đánh giá 5 sao (Rất hài lòng)
    /// </summary>
    public int FiveStarCount { get; set; }

    /// <summary>
    /// Số lượng đánh giá 4 sao (Hài lòng)
    /// </summary>
    public int FourStarCount { get; set; }

    /// <summary>
    /// Số lượng đánh giá 3 sao (Bình thường)
    /// </summary>
    public int ThreeStarCount { get; set; }

    /// <summary>
    /// Số lượng đánh giá 2 sao (Chưa hài lòng)
    /// </summary>
    public int TwoStarCount { get; set; }

    /// <summary>
    /// Số lượng đánh giá 1 sao (Rất không hài lòng)
    /// </summary>
    public int OneStarCount { get; set; }

    /// <summary>
    /// Tỷ lệ hài lòng (%) = (Số đánh giá 4 & 5 sao / Tổng đánh giá) * 100
    /// </summary>
    public double SatisfactionRate { get; set; }

    /// <summary>
    /// Danh sách phản hồi và ý kiến góp ý gần đây nhất
    /// </summary>
    public List<RecentFeedbackItemDto> RecentFeedbacks { get; set; } = [];
}

public class RecentFeedbackItemDto
{
    public Guid Id { get; set; }
    public string TrackingCode { get; set; } = string.Empty;
    public string PetitionTitle { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime FeedbackAt { get; set; }
}
