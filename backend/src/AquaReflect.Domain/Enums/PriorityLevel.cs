namespace AquaReflect.Domain.Enums;

public enum PriorityLevel
{
    Normal = 1,    // Bình thường (Xử lý theo SLA tiêu chuẩn: ví dụ 5-7 ngày)
    High = 2,      // Cao (Cần xử lý sớm: ví dụ 48-72 giờ)
    Urgent = 3     // Hỏa tốc / Khẩn cấp (Xử lý ngay trong 24 giờ: dịch bệnh lây lan, xả thải nghiêm trọng)
}
