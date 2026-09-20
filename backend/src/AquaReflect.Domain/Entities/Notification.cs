using AquaReflect.Domain.Common;
using AquaReflect.Domain.Enums;

namespace AquaReflect.Domain.Entities;

/// <summary>
/// Thực thể thông báo lưu trữ trong hệ thống
/// </summary>
public class Notification : BaseEntity
{
    /// <summary>
    /// Tiêu đề thông báo ngắn gọn
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Nội dung chi tiết thông báo
    /// </summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Phân loại thông báo
    /// </summary>
    public NotificationType Type { get; set; } = NotificationType.System;

    /// <summary>
    /// ID cán bộ nhận thông báo đích danh (nếu có)
    /// </summary>
    public Guid? TargetUserId { get; set; }
    public virtual User? TargetUser { get; set; }

    /// <summary>
    /// ID phòng ban nhận thông báo (nếu có)
    /// </summary>
    public Guid? TargetDepartmentId { get; set; }
    public virtual Department? TargetDepartment { get; set; }

    /// <summary>
    /// Vai trò nhận thông báo (ví dụ: Dispatcher để gửi cho toàn bộ trực ban)
    /// </summary>
    public UserRole? TargetRole { get; set; }

    /// <summary>
    /// ID hồ sơ phản ánh liên quan (nếu có)
    /// </summary>
    public Guid? PetitionId { get; set; }
    public virtual Petition? Petition { get; set; }

    /// <summary>
    /// Mã tra cứu hồ sơ (ví dụ TS-202609-ABCDE) để hiển thị nhanh không cần join
    /// </summary>
    public string? TrackingCode { get; set; }

    /// <summary>
    /// Trạng thái đã đọc của thông báo
    /// </summary>
    public bool IsRead { get; set; } = false;

    /// <summary>
    /// Thời điểm đọc thông báo
    /// </summary>
    public DateTime? ReadAt { get; set; }
}
