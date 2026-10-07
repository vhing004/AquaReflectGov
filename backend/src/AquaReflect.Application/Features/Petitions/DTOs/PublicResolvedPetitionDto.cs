namespace AquaReflect.Application.Features.Petitions.DTOs;

/// <summary>
/// DTO hiển thị hồ sơ phản ánh đã giải quyết công khai trên Trang chủ
/// </summary>
public class PublicResolvedPetitionDto
{
    public Guid Id { get; set; }
    public string TrackingCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;

    // Chuyên mục
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryCode { get; set; } = string.Empty;

    // Trạng thái
    public string StatusName { get; set; } = string.Empty;

    // Địa bàn
    public string AddressText { get; set; } = string.Empty;
    public string? AdministrativeUnitName { get; set; }

    // Cơ quan thụ lý
    public string? DepartmentName { get; set; }

    // Thời gian xử lý
    public DateTime CreatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public int DefaultSlaHours { get; set; }

    /// <summary>Số giờ xử lý thực tế (ResolvedAt - CreatedAt)</summary>
    public double? ActualProcessingHours { get; set; }

    /// <summary>Xử lý sớm hơn SLA bao nhiêu giờ (âm = quá hạn)</summary>
    public double? SlaMarginHours { get; set; }

    /// <summary>Có hoàn thành sớm hơn hạn SLA không</summary>
    public bool IsAheadOfSla { get; set; }

    // Ảnh hiện trường thumbnail đầu tiên (nếu có)
    public string? ThumbnailUrl { get; set; }

    // Kết luận thụ lý chính thức
    public string? ResolutionSummary { get; set; }
    public string? ResolutionDocumentNumber { get; set; }

    // Đánh giá CSAT từ công dân
    public bool HasFeedback { get; set; }
    public int? FeedbackRating { get; set; }
    public string? FeedbackComment { get; set; }
}
