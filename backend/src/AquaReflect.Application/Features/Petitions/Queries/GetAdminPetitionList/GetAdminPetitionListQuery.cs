using AquaReflect.Application.Common.Models;
using MediatR;

namespace AquaReflect.Application.Features.Petitions.Queries.GetAdminPetitionList;

/// <summary>
/// Query lấy danh sách hồ sơ phân trang với lọc đa tiêu chí dành cho Cán bộ
/// </summary>
public class GetAdminPetitionListQuery : IRequest<PaginatedResult<AdminPetitionListItemDto>>
{
    /// <summary>Từ khóa tìm kiếm (Tiêu đề, Mã tra cứu, Tên/SĐT người nộp)</summary>
    public string? Keyword { get; set; }

    /// <summary>Lọc theo trạng thái (1=Tiếp nhận, 2=Phân công, 3=Đang xử lý, 4=Đã giải quyết, 5=Từ chối, 6=Đóng)</summary>
    public int? Status { get; set; }

    /// <summary>Lọc theo mức ưu tiên (1=Tiêu chuẩn, 2=Cao, 3=Khẩn cấp)</summary>
    public int? PriorityLevel { get; set; }

    /// <summary>Lọc theo Phòng ban thụ lý</summary>
    public Guid? DepartmentId { get; set; }

    /// <summary>Lọc theo Danh mục phản ánh</summary>
    public Guid? CategoryId { get; set; }

    /// <summary>Chỉ hiển thị hồ sơ đã quá hạn SLA</summary>
    public bool? IsOverdue { get; set; }

    /// <summary>Lọc từ ngày tiếp nhận</summary>
    public DateTime? DateFrom { get; set; }

    /// <summary>Lọc đến ngày tiếp nhận</summary>
    public DateTime? DateTo { get; set; }

    /// <summary>Số trang (mặc định: 1)</summary>
    public int PageNumber { get; set; } = 1;

    /// <summary>Số hồ sơ mỗi trang (mặc định: 20, tối đa: 100)</summary>
    public int PageSize { get; set; } = 20;

    /// <summary>Trường sắp xếp: createdAt | dueDate | priority | status (mặc định: createdAt)</summary>
    public string SortBy { get; set; } = "createdAt";

    /// <summary>Sắp xếp giảm dần (mặc định: true — Mới nhất trước)</summary>
    public bool SortDesc { get; set; } = true;
}

/// <summary>
/// DTO item gọn nhẹ cho danh sách hồ sơ (quản lý cán bộ)
/// </summary>
public class AdminPetitionListItemDto
{
    public Guid Id { get; set; }
    public string TrackingCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;

    public string CategoryName { get; set; } = string.Empty;
    public string CategoryCode { get; set; } = string.Empty;

    public int Status { get; set; }
    public string StatusName { get; set; } = string.Empty;

    public int PriorityLevel { get; set; }
    public string PriorityName { get; set; } = string.Empty;

    public string? DepartmentName { get; set; }
    public string? AssignedUserName { get; set; }

    public string? CitizenName { get; set; }
    public string? CitizenPhone { get; set; }
    public bool IsAnonymous { get; set; }

    public string AddressText { get; set; } = string.Empty;
    public string? AdministrativeUnitName { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public bool IsOverdue { get; set; }
    public double? RemainingHours { get; set; }

    public int AttachmentsCount { get; set; }
    public bool HasFeedback { get; set; }
    public int? FeedbackRating { get; set; }
}
