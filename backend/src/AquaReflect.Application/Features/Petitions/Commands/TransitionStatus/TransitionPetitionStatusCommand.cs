using AquaReflect.Domain.Enums;
using MediatR;

namespace AquaReflect.Application.Features.Petitions.Commands.TransitionStatus;

/// <summary>
/// Command luân chuyển trạng thái hồ sơ phản ánh kiến nghị theo quy trình
/// </summary>
public class TransitionPetitionStatusCommand : IRequest<TransitionPetitionStatusResultDto>
{
    /// <summary>ID hồ sơ phản ánh</summary>
    public Guid PetitionId { get; set; }

    /// <summary>Trạng thái đích mong muốn</summary>
    public PetitionStatus ToStatus { get; set; }

    /// <summary>ID phòng ban thụ lý (khi phân công hoặc điều chuyển)</summary>
    public Guid? DepartmentId { get; set; }

    /// <summary>ID chuyên viên thụ lý (khi chỉ định cán bộ)</summary>
    public Guid? AssignedUserId { get; set; }

    /// <summary>Tóm tắt kết luận và biện pháp giải quyết (khi chuyển sang Đã giải quyết)</summary>
    public string? ResolutionSummary { get; set; }

    /// <summary>Ghi chú nghiệp vụ / lý do xử lý (ghi nhận vào lịch sử luân chuyển)</summary>
    public string? Note { get; set; }

    /// <summary>Mã hồ sơ gốc khi gộp đơn trùng lặp (Status = Merged)</summary>
    public string? DuplicateOfTrackingCode { get; set; }

    /// <summary>ID hồ sơ gốc khi gộp đơn trùng lặp (nếu đã biết Guid)</summary>
    public Guid? DuplicateOfId { get; set; }

    /// <summary>Cơ quan / Tổ chức chuyển tiếp ngoài ngành (Status = Forwarded)</summary>
    public string? ForwardToOrganization { get; set; }

    /// <summary>Lý do chuyển tiếp cơ quan ngoài (Status = Forwarded)</summary>
    public string? ForwardReason { get; set; }

    /// <summary>Chi tiết yêu cầu người dân bổ sung thông tin (Status = NeedInfo)</summary>
    public string? NeedInfoReason { get; set; }

    /// <summary>Số ngày làm việc cho hạn bổ sung (mặc định 5 ngày làm việc)</summary>
    public int? NeedInfoDays { get; set; }
}
