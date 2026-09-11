namespace AquaReflect.Domain.Enums;

public enum PetitionStatus
{
    Submitted = 1,      // Mới tiếp nhận (Chờ phân loại)
    Assigned = 2,       // Đã phân công đơn vị/cán bộ xử lý
    Investigating = 3,  // Đang thẩm tra / Khảo sát thực địa
    Resolved = 4,       // Đã giải quyết / Đã có kết luận
    Rejected = 5,       // Từ chối thụ lý (Không thuộc thẩm quyền / Đơn sai sự thật)
    Closed = 6          // Đã đóng (Người dân đã nhận kết quả hoặc hoàn tất đánh giá)
}
