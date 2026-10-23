namespace AquaReflect.Domain.Enums;

/// <summary>
/// Nguồn tiếp nhận phản ánh kiến nghị (dành cho trường hợp cán bộ nhập hộ phản ánh)
/// </summary>
public enum ReceptionSource
{
    Online = 0,     // Người dân tự gửi trực tuyến qua Cổng dịch vụ / Ứng dụng
    Phone = 1,      // Tiếp nhận qua đường dây nóng / Điện thoại
    InPerson = 2,   // Tiếp nhận trực tiếp tại bộ phận Một cửa / Cơ quan
    Document = 3    // Tiếp nhận qua đơn thư, văn bản giấy gửi đến
}
