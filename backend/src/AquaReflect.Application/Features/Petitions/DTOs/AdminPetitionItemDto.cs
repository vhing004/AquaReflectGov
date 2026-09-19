namespace AquaReflect.Application.Features.Petitions.DTOs;

/// <summary>
/// DTO hồ sơ phản ánh dành cho giao diện quản lý cán bộ (có đầy đủ thông tin nội bộ)
/// </summary>
public class AdminPetitionItemDto
{
    public Guid Id { get; set; }
    public string TrackingCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;

    // Phân loại
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryCode { get; set; } = string.Empty;
    public int DefaultSlaHours { get; set; }

    // Trạng thái & Ưu tiên
    public int Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public int PriorityLevel { get; set; }
    public string PriorityName { get; set; } = string.Empty;

    // Địa bàn
    public string AddressText { get; set; } = string.Empty;
    public int? AdministrativeUnitId { get; set; }
    public string? AdministrativeUnitName { get; set; }

    // Cơ quan thụ lý
    public Guid? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public string? AssignedUserName { get; set; }

    // Thông tin người nộp (che mờ để bảo vệ dữ liệu cá nhân)
    public bool IsAnonymous { get; set; }
    public string? CitizenNameMasked { get; set; }
    public string? CitizenPhoneMasked { get; set; }
    // Cán bộ thụ lý thấy đầy đủ hơn
    public string? CitizenName { get; set; }
    public string? CitizenPhone { get; set; }
    public string? CitizenEmail { get; set; }

    // Thời hạn SLA
    public DateTime CreatedAt { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public bool IsOverdue { get; set; }
    public double? RemainingHours { get; set; }
    public string? ResolutionSummary { get; set; }

    // Tệp đính kèm & Đánh giá
    public int AttachmentsCount { get; set; }
    public bool HasFeedback { get; set; }
    public int? FeedbackRating { get; set; }
}
