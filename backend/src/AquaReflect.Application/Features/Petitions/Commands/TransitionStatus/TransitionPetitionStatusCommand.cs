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
}
