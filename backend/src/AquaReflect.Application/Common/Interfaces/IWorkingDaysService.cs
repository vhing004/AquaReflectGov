using AquaReflect.Domain.Enums;

namespace AquaReflect.Application.Common.Interfaces;

/// <summary>
/// Dịch vụ tính toán ngày làm việc hành chính và thời hạn SLA loại bỏ thứ 7, CN và ngày nghỉ lễ
/// </summary>
public interface IWorkingDaysService
{
    /// <summary>
    /// Kiểm tra xem một ngày có phải là ngày làm việc hợp lệ (không phải Thứ 7, Chủ Nhật và không phải Ngày nghỉ lễ)
    /// </summary>
    Task<bool> IsWorkingDayAsync(DateTime date, CancellationToken cancellationToken = default);

    /// <summary>
    /// Cộng thêm số ngày làm việc vào thời điểm bắt đầu (bỏ qua Thứ 7, CN và ngày nghỉ lễ)
    /// </summary>
    Task<DateTime> AddWorkingDaysAsync(DateTime startDate, int workingDays, CancellationToken cancellationToken = default);

    /// <summary>
    /// Đếm số ngày làm việc giữa hai thời điểm
    /// </summary>
    Task<int> GetWorkingDaysBetweenAsync(DateTime start, DateTime end, CancellationToken cancellationToken = default);

    /// <summary>
    /// Tính toán hạn chót xử lý SLA theo Mức độ ưu tiên dựa trên cấu hình trong SystemSettings
    /// </summary>
    Task<DateTime> CalculateDueDateAsync(DateTime startDate, PriorityLevel priority, CancellationToken cancellationToken = default);

    /// <summary>
    /// Tính toán hạn chót thực tế có tính đến thời gian tạm dừng (SlaPausedAt và TotalSlaPausedMinutes)
    /// </summary>
    DateTime CalculateEffectiveDueDate(DateTime originalDueDate, double totalSlaPausedMinutes, DateTime? slaPausedAt = null);

    /// <summary>
    /// Đánh giá tình trạng SLA (quá hạn hay chưa, số giờ còn lại) có tính đến thời gian tạm dừng
    /// </summary>
    (bool IsOverdue, double RemainingHours) EvaluateSlaStatus(DateTime? dueDate, DateTime? resolvedAt, double totalSlaPausedMinutes, DateTime? slaPausedAt = null);
}
