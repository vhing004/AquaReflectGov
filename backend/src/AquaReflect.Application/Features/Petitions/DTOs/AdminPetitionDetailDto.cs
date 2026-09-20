namespace AquaReflect.Application.Features.Petitions.DTOs;

public class AdminPetitionDetailDto
{
    public Guid Id { get; set; }
    public string TrackingCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;

    // Chuyên mục & SLA quy định
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryCode { get; set; } = string.Empty;
    public int DefaultSlaHours { get; set; }

    // Trạng thái & Mức độ ưu tiên
    public int Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public int PriorityLevel { get; set; }
    public string PriorityName { get; set; } = string.Empty;

    // Địa bàn & Tọa độ hiện trường
    public string AddressText { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public int? AdministrativeUnitId { get; set; }
    public string? AdministrativeUnitName { get; set; }

    // Thông tin người gửi phản ánh (Đầy đủ cho cán bộ thụ lý xác minh)
    public bool IsAnonymous { get; set; }
    public string? CitizenName { get; set; }
    public string? CitizenPhone { get; set; }
    public string? CitizenEmail { get; set; }
    public string? CitizenIdCard { get; set; }

    // Phân công đơn vị & Cán bộ thụ lý
    public Guid? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public Guid? AssignedUserId { get; set; }
    public string? AssignedUserName { get; set; }
    public string? AssignedUserEmail { get; set; }

    // Thời hạn SLA & Tiến độ
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public bool IsOverdue { get; set; }
    public double? RemainingHours { get; set; }
    public string? ResolutionSummary { get; set; }

    // Tệp minh chứng thực địa (ảnh/video/tài liệu)
    public List<PetitionAttachmentDto> Attachments { get; set; } = new();

    // Dòng thời gian nhật ký xử lý (Audit Trail)
    public List<PetitionTimelineItemDto> Timeline { get; set; } = new();

    // Kết luận & Quyết định giải quyết chính thức (kèm file có dấu)
    public PetitionResolutionDto? Resolution { get; set; }

    // Đánh giá mức độ hài lòng của công dân
    public bool HasFeedback { get; set; }
    public int? FeedbackRating { get; set; }
    public string? FeedbackComment { get; set; }
    public DateTime? FeedbackCreatedAt { get; set; }

    // Ghi chú nghiệp vụ / Trao đổi nội bộ giữa các cán bộ
    public List<PetitionCommentDto> Comments { get; set; } = new();
}
