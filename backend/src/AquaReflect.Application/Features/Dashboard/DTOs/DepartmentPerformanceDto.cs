namespace AquaReflect.Application.Features.Dashboard.DTOs;

/// <summary>
/// Đo lường hiệu suất và năng lực thực thi cam kết SLA theo từng phòng ban
/// </summary>
public class DepartmentPerformanceDto
{
    public Guid DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string DepartmentCode { get; set; } = string.Empty;

    /// <summary>
    /// Tổng số hồ sơ được giao xử lý
    /// </summary>
    public int TotalAssigned { get; set; }

    /// <summary>
    /// Số hồ sơ đang giải quyết (Assigned / InProgress)
    /// </summary>
    public int InProgressCount { get; set; }

    /// <summary>
    /// Số hồ sơ đã giải quyết xong
    /// </summary>
    public int ResolvedCount { get; set; }

    /// <summary>
    /// Số hồ sơ đang bị quá hạn cam kết
    /// </summary>
    public int OverdueCount { get; set; }

    /// <summary>
    /// Số hồ sơ giải quyết xong đúng hạn
    /// </summary>
    public int OnTimeResolvedCount { get; set; }

    /// <summary>
    /// Tỷ lệ đúng hạn (%) = (OnTimeResolvedCount / ResolvedCount) * 100
    /// </summary>
    public double OnTimeRate { get; set; }

    /// <summary>
    /// Thời gian trung bình giải quyết xong 1 hồ sơ (giờ)
    /// </summary>
    public double AverageResolutionHours { get; set; }
}
