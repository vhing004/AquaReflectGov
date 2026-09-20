using AquaReflect.Domain.Entities;
using AquaReflect.Domain.Enums;

namespace AquaReflect.Application.Common.Interfaces;

/// <summary>
/// Dịch vụ gửi thông báo thời gian thực qua SignalR và lưu vết vào CSDL
/// </summary>
public interface INotificationService
{
    /// <summary>
    /// Gửi thông báo khi có đơn phản ánh mới được công dân nộp
    /// </summary>
    Task NotifyNewPetitionAsync(Petition petition, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gửi thông báo khi hồ sơ chuyển trạng thái xử lý
    /// </summary>
    Task NotifyPetitionStatusChangedAsync(
        Petition petition,
        PetitionStatus previousStatus,
        PetitionStatus newStatus,
        string? note,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gửi thông báo khi hồ sơ được phân công cho cán bộ chuyên viên
    /// </summary>
    Task NotifyPetitionAssignedAsync(
        Petition petition,
        User assignedOfficer,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gửi thông báo khi hồ sơ được ban hành kết luận giải quyết chính thức
    /// </summary>
    Task NotifyPetitionResolvedAsync(
        Petition petition,
        string conclusionText,
        string? documentNumber,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gửi thông báo khi có cán bộ nhập ý kiến chỉ đạo / thảo luận nghiệp vụ mới
    /// </summary>
    Task NotifyNewCommentAsync(
        Petition petition,
        PetitionComment comment,
        CancellationToken cancellationToken = default);
}
