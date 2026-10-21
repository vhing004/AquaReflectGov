using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Domain.Entities;
using AquaReflect.Domain.Enums;
using AquaReflect.Domain.Exceptions;

namespace AquaReflect.Application.Services;

/// <summary>
/// Triển khai động cơ Workflow State Machine cho hồ sơ phản ánh kiến nghị ngành thủy sản
/// </summary>
public class PetitionWorkflowService : IPetitionWorkflowService
{
    public bool CanTransition(PetitionStatus currentStatus, PetitionStatus toStatus, UserRole role)
    {
        var allowed = GetAllowedTransitions(currentStatus, role);
        return allowed.Contains(toStatus);
    }

    public IReadOnlyList<PetitionStatus> GetAllowedTransitions(PetitionStatus currentStatus, UserRole role)
    {
        if (role == UserRole.Citizen)
        {
            return Array.Empty<PetitionStatus>();
        }

        var result = new List<PetitionStatus>();

        switch (currentStatus)
        {
            case PetitionStatus.Submitted:
                if (role == UserRole.Dispatcher || role == UserRole.SuperAdmin)
                {
                    result.Add(PetitionStatus.Assigned);
                    result.Add(PetitionStatus.NeedInfo);
                    result.Add(PetitionStatus.Merged);
                    result.Add(PetitionStatus.Forwarded);
                    result.Add(PetitionStatus.Rejected);
                }
                break;

            case PetitionStatus.Assigned:
                if (role == UserRole.Specialist || role == UserRole.SuperAdmin)
                {
                    result.Add(PetitionStatus.Investigating);
                    result.Add(PetitionStatus.NeedInfo);
                }
                if (role == UserRole.Dispatcher || role == UserRole.SuperAdmin)
                {
                    result.Add(PetitionStatus.Assigned); // Phân công lại
                    result.Add(PetitionStatus.NeedInfo);
                    result.Add(PetitionStatus.Merged);
                    result.Add(PetitionStatus.Forwarded);
                    result.Add(PetitionStatus.Rejected);
                }
                break;

            case PetitionStatus.Investigating:
                if (role == UserRole.Specialist || role == UserRole.SuperAdmin)
                {
                    result.Add(PetitionStatus.Resolved);
                    result.Add(PetitionStatus.NeedInfo);
                }
                if (role == UserRole.Dispatcher || role == UserRole.Specialist || role == UserRole.SuperAdmin)
                {
                    result.Add(PetitionStatus.Assigned); // Điều chuyển đơn vị khác
                }
                break;

            case PetitionStatus.NeedInfo:
                // Khi người dân bổ sung thông tin hoặc cán bộ xác nhận nhận bổ sung
                if (role == UserRole.Dispatcher || role == UserRole.SuperAdmin)
                {
                    result.Add(PetitionStatus.Submitted);
                    result.Add(PetitionStatus.Assigned);
                    result.Add(PetitionStatus.Rejected);
                }
                if (role == UserRole.Specialist || role == UserRole.SuperAdmin)
                {
                    result.Add(PetitionStatus.Investigating);
                }
                break;

            case PetitionStatus.Resolved:
                if (role == UserRole.Dispatcher || role == UserRole.SuperAdmin)
                {
                    result.Add(PetitionStatus.Closed);
                    result.Add(PetitionStatus.Investigating);
                }
                break;

            case PetitionStatus.Rejected:
            case PetitionStatus.Merged:
            case PetitionStatus.Forwarded:
            case PetitionStatus.Withdrawn:
                if (role == UserRole.Dispatcher || role == UserRole.SuperAdmin)
                {
                    result.Add(PetitionStatus.Closed);
                }
                break;

            case PetitionStatus.Closed:
                // Dispatcher / SuperAdmin có thể mở lại hồ sơ về Assigned (nếu chưa từng mở lại)
                if (role == UserRole.Dispatcher || role == UserRole.SuperAdmin)
                {
                    result.Add(PetitionStatus.Assigned);
                }
                break;
        }

        return result.Distinct().ToList();
    }

    public void ValidateTransition(
        Petition petition,
        PetitionStatus toStatus,
        UserRole role,
        Guid? userDepartmentId,
        Guid? targetDepartmentId,
        string? resolutionSummary,
        string? note,
        string? needInfoReason = null,
        string? duplicateOfTrackingCode = null,
        string? forwardToOrganization = null)
    {
        if (role == UserRole.Citizen)
        {
            throw new ForbiddenException("Tài khoản người dân không có quyền thay đổi trạng thái xử lý hồ sơ.");
        }

        if (petition.Status == PetitionStatus.Closed && toStatus != PetitionStatus.Assigned)
        {
            throw new BadRequestException("Hồ sơ đã được đóng lưu trữ (Closed), chỉ có thể mở lại về trạng thái Phân công (Assigned).");
        }

        if (petition.Status == PetitionStatus.Closed && toStatus == PetitionStatus.Assigned && petition.ReopenCount > 0)
        {
            throw new BadRequestException("Hồ sơ đã từng được mở lại xem xét 1 lần, không thể mở lại lần thứ 2.");
        }

        // Kiểm tra vai trò Specialist
        if (role == UserRole.Specialist)
        {
            if (!userDepartmentId.HasValue || petition.DepartmentId != userDepartmentId.Value)
            {
                throw new ForbiddenException("Cán bộ chuyên viên chỉ có quyền xử lý các hồ sơ được phân công về phòng ban của mình.");
            }

            if (toStatus == PetitionStatus.Rejected || toStatus == PetitionStatus.Closed)
            {
                throw new ForbiddenException("Chuyên viên không có thẩm quyền Từ chối hoặc Đóng hồ sơ. Thao tác này dành cho Bộ phận Tiếp nhận & Phân loại (Dispatcher) hoặc Lãnh đạo.");
            }
        }

        // Kiểm tra ma trận luân chuyển hợp lệ
        var allowedTransitions = GetAllowedTransitions(petition.Status, role);
        if (!allowedTransitions.Contains(toStatus))
        {
            var fromName = GetStatusName(petition.Status);
            var toName = GetStatusName(toStatus);
            throw new BadRequestException($"Không thể chuyển trạng thái hồ sơ từ '{fromName}' sang '{toName}'. Luồng xử lý không hợp lệ đối với vai trò hiện tại.");
        }

        // Kiểm tra dữ liệu nghiệp vụ bắt buộc theo từng trạng thái đích
        if (toStatus == PetitionStatus.Assigned)
        {
            var dept = targetDepartmentId ?? petition.DepartmentId;
            if (!dept.HasValue)
            {
                throw new ValidationException("Vui lòng chỉ định Phòng ban / Cơ quan chuyên môn thụ lý hồ sơ.");
            }
        }

        if (toStatus == PetitionStatus.NeedInfo)
        {
            if (petition.NeedInfoCount >= 2)
            {
                throw new BadRequestException("Hồ sơ đã đạt giới hạn tối đa 02 lần yêu cầu bổ sung thông tin. Cán bộ vui lòng thụ lý hoặc xử lý theo quy định hiện hành.");
            }

            var reason = needInfoReason ?? note;
            if (string.IsNullOrWhiteSpace(reason))
            {
                throw new ValidationException("Vui lòng nêu rõ lý do và danh mục thông tin/chứng cứ cần người dân bổ sung.");
            }
        }

        if (toStatus == PetitionStatus.Merged)
        {
            if (string.IsNullOrWhiteSpace(duplicateOfTrackingCode))
            {
                throw new ValidationException("Vui lòng cung cấp Mã biên nhận hồ sơ gốc để thực hiện gộp phản ánh trùng lặp.");
            }

            if (duplicateOfTrackingCode.Trim().Equals(petition.TrackingCode, StringComparison.OrdinalIgnoreCase))
            {
                throw new BadRequestException("Không thể gộp hồ sơ vào chính nó. Vui lòng kiểm tra lại mã hồ sơ gốc.");
            }
        }

        if (toStatus == PetitionStatus.Forwarded)
        {
            if (string.IsNullOrWhiteSpace(forwardToOrganization))
            {
                throw new ValidationException("Vui lòng nhập tên Cơ quan / Đơn vị tiếp nhận chuyển tiếp hồ sơ.");
            }
        }

        if (toStatus == PetitionStatus.Rejected)
        {
            if (string.IsNullOrWhiteSpace(note))
            {
                throw new ValidationException("Vui lòng nêu rõ lý do từ chối thụ lý hồ sơ phản ánh để thông báo tới người dân.");
            }
        }

        if (toStatus == PetitionStatus.Resolved)
        {
            if (string.IsNullOrWhiteSpace(resolutionSummary))
            {
                throw new ValidationException("Vui lòng nhập tóm tắt kết luận và kết quả giải quyết phản ánh.");
            }
        }

        if (petition.Status == PetitionStatus.Resolved && toStatus == PetitionStatus.Investigating)
        {
            if (string.IsNullOrWhiteSpace(note) || note.Trim().Length < 10)
            {
                throw new ValidationException("Vui lòng nêu rõ lý do trả về (tối thiểu 10 ký tự) để chuyên viên thụ lý nắm rõ nội dung cần xử lý lại.");
            }
        }
    }

    public string GetActionDescription(PetitionStatus? fromStatus, PetitionStatus toStatus)
    {
        return (fromStatus, toStatus) switch
        {
            (null, PetitionStatus.Submitted) => "Tiếp nhận hồ sơ trực tuyến mới",
            (PetitionStatus.Submitted, PetitionStatus.Assigned) => "Phân công cơ quan chuyên môn thụ lý",
            (PetitionStatus.Assigned, PetitionStatus.Assigned) => "Điều chuyển / Phân công lại cán bộ thụ lý",
            (PetitionStatus.Assigned, PetitionStatus.Investigating) => "Bắt đầu xác minh, kiểm tra thực địa",
            (PetitionStatus.Investigating, PetitionStatus.Resolved) => "Ban hành kết luận & hoàn tất giải quyết",
            (PetitionStatus.Investigating, PetitionStatus.Assigned) => "Điều chuyển cơ quan do không thuộc thẩm quyền",
            (PetitionStatus.Resolved, PetitionStatus.Investigating) => "Yêu cầu xử lý lại kết quả giải quyết",
            (PetitionStatus.Resolved, PetitionStatus.Closed) => "Kiểm duyệt phê duyệt & Đóng hồ sơ",
            (PetitionStatus.Closed, PetitionStatus.Assigned) => "Mở lại hồ sơ xem xét lại theo đánh giá CSAT",
            (_, PetitionStatus.NeedInfo) => "Yêu cầu người dân bổ sung thông tin, chứng cứ",
            (PetitionStatus.NeedInfo, PetitionStatus.Submitted) => "Người dân đã bổ sung thông tin, tiếp tục phân loại",
            (PetitionStatus.NeedInfo, PetitionStatus.Assigned) => "Người dân đã bổ sung thông tin, tiếp tục phân công",
            (PetitionStatus.NeedInfo, PetitionStatus.Investigating) => "Người dân đã bổ sung thông tin, tiếp tục xác minh",
            (_, PetitionStatus.Merged) => "Gộp hồ sơ do trùng lặp nội dung phản ánh",
            (_, PetitionStatus.Forwarded) => "Chuyển tiếp hồ sơ sang cơ quan ngoài ngành",
            (_, PetitionStatus.Withdrawn) => "Người dân chủ động rút phản ánh",
            (_, PetitionStatus.Rejected) => "Từ chối tiếp nhận thụ lý hồ sơ",
            (_, PetitionStatus.Closed) => "Đóng và lưu trữ hồ sơ",
            _ => $"Chuyển trạng thái sang {GetStatusName(toStatus)}"
        };
    }

    private static string GetStatusName(PetitionStatus status) => status switch
    {
        PetitionStatus.Submitted => "Mới tiếp nhận",
        PetitionStatus.Assigned => "Đã phân công",
        PetitionStatus.Investigating => "Đang xử lý",
        PetitionStatus.Resolved => "Đã giải quyết",
        PetitionStatus.Rejected => "Từ chối thụ lý",
        PetitionStatus.Closed => "Đã đóng",
        PetitionStatus.NeedInfo => "Yêu cầu bổ sung thông tin",
        PetitionStatus.Merged => "Đã gộp đơn trùng",
        PetitionStatus.Forwarded => "Đã chuyển cơ quan khác",
        PetitionStatus.Withdrawn => "Người dân đã rút đơn",
        _ => status.ToString()
    };
}
