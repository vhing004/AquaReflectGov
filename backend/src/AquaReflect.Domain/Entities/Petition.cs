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

    // Quản lý thời hạn SLA
    public DateTime? DueDate { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string? ResolutionSummary { get; set; }

    public string? CreatedBy { get; set; }
    public string? LastModifiedBy { get; set; }

    // Quan hệ phụ thuộc
    public virtual ICollection<PetitionAttachment> Attachments { get; set; } = new List<PetitionAttachment>();
    public virtual ICollection<PetitionHistory> Histories { get; set; } = new List<PetitionHistory>();
    public virtual ICollection<PetitionComment> Comments { get; set; } = new List<PetitionComment>();
    public virtual PetitionResolution? Resolution { get; set; }
    public virtual CitizenFeedback? Feedback { get; set; }
}
