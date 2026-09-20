namespace AquaReflect.Domain.Enums;

/// <summary>
/// Phân loại thông báo trong hệ thống
/// </summary>
public enum NotificationType
{
    /// <summary>
    /// Thông báo hệ thống chung
    /// </summary>
    System = 1,

    /// <summary>
    /// Có đơn phản ánh kiến nghị mới được tiếp nhận
    /// </summary>
    NewPetition = 2,

    /// <summary>
    /// Hồ sơ được phân công cho phòng ban hoặc chuyên viên
    /// </summary>
    PetitionAssigned = 3,

    /// <summary>
    /// Hồ sơ chuyển trạng thái xử lý
    /// </summary>
    StatusChanged = 4,

    /// <summary>
    /// Hồ sơ đã được ban hành kết luận giải quyết chính thức
    /// </summary>
    ResolutionPublished = 5,

    /// <summary>
    /// Có ý kiến / chỉ đạo nghiệp vụ mới trong hồ sơ
    /// </summary>
    NewComment = 6,

    /// <summary>
    /// Cảnh báo hồ sơ sắp hoặc đã quá hạn SLA
    /// </summary>
    SlaWarning = 7
}
