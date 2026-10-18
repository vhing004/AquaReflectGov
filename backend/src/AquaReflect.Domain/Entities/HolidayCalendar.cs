using AquaReflect.Domain.Common;

namespace AquaReflect.Domain.Entities;

/// <summary>
/// Thực thể lưu trữ danh mục ngày nghỉ lễ/Tết theo quy định Nhà nước phục vụ tính toán ngày làm việc
/// </summary>
public class HolidayCalendar : BaseEntity
{
    /// <summary>
    /// Ngày nghỉ lễ (Lưu chuẩn UTC 00:00:00)
    /// </summary>
    public DateTime HolidayDate { get; set; }

    /// <summary>
    /// Tên hoặc lý do ngày nghỉ lễ (ví dụ: Tết Dương lịch, Giỗ tổ Hùng Vương, Tết Nguyên đán)
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Năm của ngày nghỉ lễ
    /// </summary>
    public int Year { get; set; }

    /// <summary>
    /// Đánh dấu ngày nghỉ lễ cố định lặp lại theo lịch dương hàng năm
    /// </summary>
    public bool IsRecurringSolar { get; set; } = false;
}
