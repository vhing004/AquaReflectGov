using AquaReflect.Domain.Entities;
using AquaReflect.Domain.Enums;

namespace AquaReflect.Application.Common.Interfaces;

/// <summary>
/// Service kiểm soát quy trình luân chuyển trạng thái (State Machine) của hồ sơ phản ánh
/// </summary>
public interface IPetitionWorkflowService
{
    /// <summary>
    /// Kiểm tra xem việc chuyển từ trạng thái hiện tại sang trạng thái đích có hợp lệ theo vai trò cán bộ không
    /// </summary>
    bool CanTransition(PetitionStatus currentStatus, PetitionStatus toStatus, UserRole role);

    /// <summary>
    /// Lấy danh sách các trạng thái tiếp theo được phép chuyển đổi
    /// </summary>
    IReadOnlyList<PetitionStatus> GetAllowedTransitions(PetitionStatus currentStatus, UserRole role);

    /// <summary>
    /// Kiểm tra tính hợp lệ toàn diện về dữ liệu và quyền hạn nghiệp vụ trước khi chuyển trạng thái (ném Exception nếu vi phạm)
    /// </summary>
    void ValidateTransition(
        Petition petition,
        PetitionStatus toStatus,
        UserRole role,
        Guid? userDepartmentId,
        Guid? targetDepartmentId,
        string? resolutionSummary,
        string? note);

    /// <summary>
    /// Sinh tên hành động chuẩn hóa tiếng Việt cho nhật ký PetitionHistory
    /// </summary>
    string GetActionDescription(PetitionStatus? fromStatus, PetitionStatus toStatus);
}
