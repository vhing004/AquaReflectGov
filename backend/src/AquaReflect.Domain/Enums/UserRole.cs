namespace AquaReflect.Domain.Enums;

public enum UserRole
{
    SuperAdmin = 1,     // Quản trị viên hệ thống toàn quyền
    Dispatcher = 2,     // Cán bộ Tiếp nhận & Phân phối hồ sơ (Văn phòng Chi cục / Sở)
    Specialist = 3,     // Cán bộ Thụ lý / Thanh tra kiểm ngư / Phòng chuyên môn
    Citizen = 4         // Người dân / Ngư dân / Hộ kinh doanh thủy sản có tài khoản
}
