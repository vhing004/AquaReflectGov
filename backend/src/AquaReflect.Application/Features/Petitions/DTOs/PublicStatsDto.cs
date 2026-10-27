namespace AquaReflect.Application.Features.Petitions.DTOs;

/// <summary>
/// Thống kê thực tế các chỉ số công khai hiển thị trên Trang chủ
/// </summary>
public class PublicStatsDto
{
    /// <summary>
    /// Tổng số hồ sơ phản ánh đã tiếp nhận trong toàn hệ thống
    /// </summary>
    public int TotalPetitions { get; set; }

    /// <summary>
    /// Số hồ sơ đang trong quá trình thẩm tra, xác minh và xử lý thực tế
    /// </summary>
    public int InProgressCount { get; set; }

    /// <summary>
    /// Số hồ sơ đã hoàn thành giải quyết và ban hành kết luận chính thức
    /// </summary>
    public int ResolvedCount { get; set; }

    /// <summary>
    /// Số hồ sơ mức độ khẩn cấp (Hỏa tốc) hoặc thuộc điểm nóng IUU/Ô nhiễm đang giám sát
    /// </summary>
    public int UrgentOrHotCount { get; set; }

    /// <summary>
    /// Tỷ lệ đánh giá mức độ hài lòng của nhân dân (%)
    /// </summary>
    public double SatisfactionRate { get; set; }

    /// <summary>
    /// Tỷ lệ giải quyết hồ sơ đúng hoặc trước thời hạn cam kết SLA (%)
    /// </summary>
    public double OnTimeRate { get; set; }

    /// <summary>
    /// Số hồ sơ mới tiếp nhận trong tháng hiện tại
    /// </summary>
    public int ThisMonthCount { get; set; }
}
