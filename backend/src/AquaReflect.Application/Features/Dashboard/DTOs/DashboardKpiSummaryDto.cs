namespace AquaReflect.Application.Features.Dashboard.DTOs;

/// <summary>
/// Thống kê các chỉ số KPI tổng thể của hệ thống
/// </summary>
public class DashboardKpiSummaryDto
{
    /// <summary>
    /// Tổng số hồ sơ phản ánh tiếp nhận trong kỳ
    /// </summary>
    public int TotalPetitions { get; set; }

    /// <summary>
    /// Số hồ sơ mới tiếp nhận, chờ phân công
    /// </summary>
    public int SubmittedCount { get; set; }

    /// <summary>
    /// Số hồ sơ đã phân công cho phòng ban/chuyên viên
    /// </summary>
    public int AssignedCount { get; set; }

    /// <summary>
    /// Số hồ sơ đang trong quá trình thẩm tra thực địa / xác minh
    /// </summary>
    public int InProgressCount { get; set; }

    /// <summary>
    /// Số hồ sơ đã hoàn thành giải quyết / ban hành kết luận
    /// </summary>
    public int ResolvedCount { get; set; }

    /// <summary>
    /// Số hồ sơ bị từ chối tiếp nhận (do không thuộc thẩm quyền hoặc sai thông tin)
    /// </summary>
    public int RejectedCount { get; set; }

    /// <summary>
    /// Số hồ sơ đang bị quá hạn cam kết SLA
    /// </summary>
    public int OverdueCount { get; set; }

    /// <summary>
    /// Số hồ sơ hoàn thành đúng hạn cam kết SLA
    /// </summary>
    public int OnTimeResolvedCount { get; set; }

    /// <summary>
    /// Tỷ lệ giải quyết đúng hạn SLA (%) = (OnTimeResolvedCount / ResolvedCount) * 100
    /// </summary>
    public double OnTimeRate { get; set; }

    /// <summary>
    /// Thời gian giải quyết hồ sơ trung bình (tính bằng giờ)
    /// </summary>
    public double AverageResolutionHours { get; set; }

    /// <summary>
    /// Số hồ sơ mức ưu tiên Khẩn cấp (Urgent) đang chờ xử lý
    /// </summary>
    public int UrgentPendingCount { get; set; }
}
