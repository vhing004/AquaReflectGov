namespace AquaReflect.Application.Features.Petitions.DTOs;

public class PetitionTrackingDto
{
    public Guid Id { get; set; }
    public string TrackingCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;

    // Chuyên mục
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryCode { get; set; } = string.Empty;
    public int DefaultSlaHours { get; set; }

    // Trạng thái & Mức độ ưu tiên
    public int Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public int PriorityLevel { get; set; }
    public string PriorityName { get; set; } = string.Empty;

    // Địa bàn & Tọa độ
    public string AddressText { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public int? AdministrativeUnitId { get; set; }
    public string? AdministrativeUnitName { get; set; }

    // Cơ quan thụ lý
    public Guid? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public string? AssignedUserName { get; set; }

    // Người gửi (Ẩn danh / Che mờ bảo vệ dữ liệu riêng tư)
    public bool IsAnonymous { get; set; }
    public string? CitizenNameMasked { get; set; }
    public string? CitizenPhoneMasked { get; set; }

    // Thời hạn SLA & Tiến độ
    public DateTime CreatedAt { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public bool IsOverdue { get; set; }
    public double? RemainingHours { get; set; }
    public string? ResolutionSummary { get; set; }

    // Tệp minh chứng hiện trường
    public List<PetitionAttachmentDto> Attachments { get; set; } = new();

    // Dòng thời gian lịch sử xử lý
    public List<PetitionTimelineItemDto> Timeline { get; set; } = new();

    // Kết luận & Quyết định giải quyết (nếu có)
    public PetitionResolutionDto? Resolution { get; set; }

    // Đánh giá từ công dân (nếu có)
    public bool HasFeedback { get; set; }
    public int? FeedbackRating { get; set; }
    public string? FeedbackComment { get; set; }
}
