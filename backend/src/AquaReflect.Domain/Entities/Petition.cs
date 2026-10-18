using AquaReflect.Domain.Common;
using AquaReflect.Domain.Enums;
using NetTopologySuite.Geometries;

namespace AquaReflect.Domain.Entities;

public class Petition : BaseEntity, IAuditableEntity
{
    // Mã hồ sơ ngẫu nhiên duy nhất cho người dân tra cứu (ví dụ: TS-2026-X89K2)
    public string TrackingCode { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;

    // Tọa độ không gian địa lý PostGIS (WGS84 - SRID 4326)
    public Point? LocationGeometry { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string AddressText { get; set; } = string.Empty;

    public int? AdministrativeUnitId { get; set; }
    public virtual AdministrativeUnit? AdministrativeUnit { get; set; }

    // Thông tin người phản ánh
    public bool IsAnonymous { get; set; } = false;
    public string? CitizenName { get; set; }
    public string? CitizenPhone { get; set; }
    public string? CitizenEmail { get; set; }
    public string? CitizenIdCard { get; set; }

    // Mã PIN truy cập bảo mật một lần cho đơn vô danh (Lưu bản băm SHA-256)
    public string? AccessPinHash { get; set; }

    // Trạng thái và mức độ ưu tiên
    public PetitionStatus Status { get; set; } = PetitionStatus.Submitted;
    public PriorityLevel PriorityLevel { get; set; } = PriorityLevel.Normal;

    // Phân loại và phân công
    public Guid CategoryId { get; set; }
    public virtual PetitionCategory Category { get; set; } = null!;

    public Guid? DepartmentId { get; set; }
    public virtual Department? Department { get; set; }

    public Guid? AssignedUserId { get; set; }
    public virtual User? AssignedUser { get; set; }

    // Xử lý Gộp đơn trùng lặp (Merged)
    public Guid? DuplicateOfId { get; set; }
    public virtual Petition? DuplicateOf { get; set; }
    public virtual ICollection<Petition> MergedPetitions { get; set; } = new List<Petition>();

    // Xử lý Chuyển cơ quan khác (Forwarded)
    public string? ForwardToOrganization { get; set; }
    public string? ForwardReason { get; set; }

    // Xử lý Rút đơn (Withdrawn)
    public string? WithdrawnReason { get; set; }
    public DateTime? WithdrawnAt { get; set; }

    // Xử lý Yêu cầu bổ sung thông tin (NeedInfo)
    public string? NeedInfoReason { get; set; }
    public DateTime? NeedInfoDeadline { get; set; }
    public int NeedInfoCount { get; set; } = 0;

    // Quản lý thời hạn và Tạm dừng SLA
    public DateTime? DueDate { get; set; }
    public DateTime? SlaPausedAt { get; set; }
    public double TotalSlaPausedMinutes { get; set; } = 0;

    // Kết luận giải quyết (Resolved)
    public DateTime? ResolvedAt { get; set; }
    public string? ResolutionSummary { get; set; }
    public ConclusionType? ConclusionType { get; set; }

    // Tóm tắt công khai (sau khi Dispatcher duyệt hiển thị ra bản đồ cộng đồng)
    public string? PublicSummary { get; set; }

    // Xử lý Xem xét lại / Mở lại hồ sơ (Reopen - Tối đa 1 lần nếu CSAT <= 2)
    public int ReopenCount { get; set; } = 0;
    public string? ReopenReason { get; set; }
    public DateTime? ReopenedAt { get; set; }

    public string? CreatedBy { get; set; }
    public string? LastModifiedBy { get; set; }

    // Quan hệ phụ thuộc
    public virtual ICollection<PetitionAttachment> Attachments { get; set; } = new List<PetitionAttachment>();
    public virtual ICollection<PetitionHistory> Histories { get; set; } = new List<PetitionHistory>();
    public virtual ICollection<PetitionComment> Comments { get; set; } = new List<PetitionComment>();
    public virtual PetitionResolution? Resolution { get; set; }
    public virtual CitizenFeedback? Feedback { get; set; }
}
