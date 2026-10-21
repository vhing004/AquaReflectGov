namespace AquaReflect.Domain.Enums;

/// <summary>
/// Trạng thái yêu cầu mở lại hồ sơ từ công dân (khi CSAT ≤ 2 sao)
/// </summary>
public enum ReopenStatus
{
    None = 0,       // Chưa có yêu cầu mở lại
    Requested = 1,  // Công dân đã gửi yêu cầu mở lại, chờ Dispatcher duyệt
    Approved = 2,   // Dispatcher đã chấp nhận → chuyển về Assigned
    Rejected = 3    // Dispatcher từ chối yêu cầu mở lại
}
