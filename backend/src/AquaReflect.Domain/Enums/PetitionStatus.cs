namespace AquaReflect.Domain.Enums;

public enum PetitionStatus
{
    Submitted = 1,      // Mới tiếp nhận (Chờ phân loại)
    Assigned = 2,       // Đã phân công đơn vị/cán bộ xử lý
    Investigating = 3,  // Đang thẩm tra / Khảo sát thực địa
    Resolved = 4,       // Đã giải quyết / Đã có kết luận
    Rejected = 5,       // Từ chối thụ lý (Không thuộc thẩm quyền / Đơn sai sự thật)
    Closed = 6,         // Đã đóng (Người dân đã nhận kết quả hoặc hoàn tất đánh giá)
    NeedInfo = 7,       // Yêu cầu bổ sung thông tin (Tạm dừng đồng hồ SLA)
    Merged = 8,         // Gộp vào đơn khác (Đơn trùng lặp)
    Forwarded = 9,      // Chuyển cơ quan khác giải quyết (Sai thẩm quyền)
    Withdrawn = 10,     // Người dân tự rút đơn
    PendingApproval = 11 // Chờ duyệt nghiệm thu (Cán bộ gửi báo cáo, Trưởng đơn vị thẩm định)
}
