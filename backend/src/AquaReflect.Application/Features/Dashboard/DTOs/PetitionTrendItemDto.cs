namespace AquaReflect.Application.Features.Dashboard.DTOs;

/// <summary>
/// Điểm dữ liệu xu hướng tiếp nhận và xử lý hồ sơ theo ngày
/// </summary>
public class PetitionTrendItemDto
{
    /// <summary>
    /// Ngày theo định dạng yyyy-MM-dd
    /// </summary>
    public string Date { get; set; } = string.Empty;

    /// <summary>
    /// Nhãn hiển thị trên trục hoành biểu đồ (dd/MM)
    /// </summary>
    public string Label { get; set; } = string.Empty;

    /// <summary>
    /// Số lượng hồ sơ người dân gửi vào trong ngày
    /// </summary>
    public int ReceivedCount { get; set; }

    /// <summary>
    /// Số lượng hồ sơ cơ quan đã ban hành kết luận giải quyết trong ngày
    /// </summary>
    public int ResolvedCount { get; set; }
}
