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
                    result.Add(PetitionStatus.Rejected);
                }
                break;

            case PetitionStatus.Assigned:
                if (role == UserRole.Specialist || role == UserRole.SuperAdmin)
                {
                    result.Add(PetitionStatus.Investigating);
                }
                if (role == UserRole.Dispatcher || role == UserRole.SuperAdmin)
                {
                    result.Add(PetitionStatus.Assigned); // Phân công lại
                    result.Add(PetitionStatus.Rejected);
                }
                break;

            case PetitionStatus.Investigating:
                if (role == UserRole.Specialist || role == UserRole.SuperAdmin)
                {
                    result.Add(PetitionStatus.Resolved);
                }
                if (role == UserRole.Dispatcher || role == UserRole.Specialist || role == UserRole.SuperAdmin)
                {
                    result.Add(PetitionStatus.Assigned); // Điều chuyển đơn vị khác
                }
                break;

            case PetitionStatus.Resolved:
                if (role == UserRole.Dispatcher || role == UserRole.SuperAdmin)
                {
                    result.Add(PetitionStatus.Closed);
                }
                break;

            case PetitionStatus.Rejected:
                if (role == UserRole.Dispatcher || role == UserRole.SuperAdmin)
                {
                    result.Add(PetitionStatus.Closed);
                }
                break;

            case PetitionStatus.Closed:
                // Terminal state - không cho phép chuyển
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
        string? note)
    {
        if (role == UserRole.Citizen)
        {
            throw new ForbiddenException("Tài khoản người dân không có quyền thay đổi trạng thái xử lý hồ sơ.");
        }

        if (petition.Status == PetitionStatus.Closed)
        {
            throw new BadRequestException("Hồ sơ đã được đóng lưu trữ (Closed), không thể thay đổi trạng thái.");
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
        _ => status.ToString()
    };
}
