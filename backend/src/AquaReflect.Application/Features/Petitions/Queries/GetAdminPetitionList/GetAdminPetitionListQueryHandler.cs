using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Common.Models;
using AquaReflect.Domain.Enums;
using AquaReflect.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Application.Features.Petitions.Queries.GetAdminPetitionList;

/// <summary>
/// Xử lý query danh sách hồ sơ phân trang đa tiêu chí dành cho Cán bộ thụ lý.
/// Dispatcher thấy tất cả; Specialist chỉ thấy hồ sơ phòng ban mình.
/// </summary>
public class GetAdminPetitionListQueryHandler
    : IRequestHandler<GetAdminPetitionListQuery, PaginatedResult<AdminPetitionListItemDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetAdminPetitionListQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<PaginatedResult<AdminPetitionListItemDto>> Handle(
        GetAdminPetitionListQuery request, CancellationToken cancellationToken)
    {
        // --- Kiểm tra quyền truy cập ---
        if (!_currentUser.IsAuthenticated)
            throw new UnauthorizedAccessException("Vui lòng đăng nhập để truy cập trang quản lý hồ sơ.");

        var role = _currentUser.Role;
        if (role == UserRole.Citizen)
            throw new ForbiddenException("Tài khoản người dân không có quyền truy cập trang quản lý hồ sơ.");

        // --- Xây dựng base query ---
        var query = _context.Petitions
            .Include(p => p.Category)
            .Include(p => p.Department)
            .Include(p => p.AdministrativeUnit)
            .Include(p => p.AssignedUser)
            .Include(p => p.Feedback)
            .Where(p => !p.IsDeleted)
            .AsNoTracking();

        // --- Specialist chỉ thấy hồ sơ của phòng ban mình ---
        if (role == UserRole.Specialist && _currentUser.DepartmentId.HasValue)
        {
            query = query.Where(p => p.DepartmentId == _currentUser.DepartmentId.Value);
        }

        // --- Áp dụng bộ lọc ---
        if (!string.IsNullOrWhiteSpace(request.Keyword))
        {
            var kw = request.Keyword.Trim().ToLower();
            query = query.Where(p =>
                p.Title.ToLower().Contains(kw) ||
                p.TrackingCode.ToLower().Contains(kw) ||
                (p.CitizenName != null && p.CitizenName.ToLower().Contains(kw)) ||
                (p.CitizenPhone != null && p.CitizenPhone.Contains(kw)) ||
                p.AddressText.ToLower().Contains(kw)
            );
        }

        if (request.Status.HasValue && Enum.IsDefined(typeof(PetitionStatus), request.Status.Value))
        {
            var statusEnum = (PetitionStatus)request.Status.Value;
            query = query.Where(p => p.Status == statusEnum);
        }

        if (request.PriorityLevel.HasValue && Enum.IsDefined(typeof(PriorityLevel), request.PriorityLevel.Value))
        {
            var priorityEnum = (PriorityLevel)request.PriorityLevel.Value;
            query = query.Where(p => p.PriorityLevel == priorityEnum);
        }

        if (request.DepartmentId.HasValue)
            query = query.Where(p => p.DepartmentId == request.DepartmentId.Value);

        if (request.CategoryId.HasValue)
            query = query.Where(p => p.CategoryId == request.CategoryId.Value);

        if (request.DateFrom.HasValue)
            query = query.Where(p => p.CreatedAt >= request.DateFrom.Value);

        if (request.DateTo.HasValue)
            query = query.Where(p => p.CreatedAt <= request.DateTo.Value.AddDays(1).AddSeconds(-1));

        var now = DateTime.UtcNow;

        if (request.IsOverdue == true)
        {
            query = query.Where(p =>
                p.DueDate.HasValue &&
                now > p.DueDate.Value &&
                p.Status != PetitionStatus.Resolved &&
                p.Status != PetitionStatus.Closed);
        }

        // --- Đếm tổng số bản ghi (trước phân trang) ---
        var totalCount = await query.CountAsync(cancellationToken);

        // --- Sắp xếp động ---
        query = (request.SortBy?.ToLower(), request.SortDesc) switch
        {
            ("duedate", true)   => query.OrderByDescending(p => p.DueDate),
            ("duedate", false)  => query.OrderBy(p => p.DueDate),
            ("priority", true)  => query.OrderByDescending(p => p.PriorityLevel),
            ("priority", false) => query.OrderBy(p => p.PriorityLevel),
            ("status", true)    => query.OrderByDescending(p => p.Status),
            ("status", false)   => query.OrderBy(p => p.Status),
            (_, true)           => query.OrderByDescending(p => p.CreatedAt),
            (_, false)          => query.OrderBy(p => p.CreatedAt),
        };

        // --- Phân trang ---
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var pageNumber = Math.Max(request.PageNumber, 1);

        var petitions = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        // --- Map sang DTO ---
        var items = petitions.Select(p =>
        {
            var isOverdue = p.DueDate.HasValue
                && now > p.DueDate.Value
                && p.Status != PetitionStatus.Resolved
                && p.Status != PetitionStatus.Closed;

            var remainingHours = p.DueDate.HasValue
                ? Math.Round((p.DueDate.Value - now).TotalHours, 1)
                : (double?)null;

            return new AdminPetitionListItemDto
            {
                Id = p.Id,
                TrackingCode = p.TrackingCode,
                Title = p.Title,
                CategoryName = p.Category.Name,
                CategoryCode = p.Category.Code,
                Status = (int)p.Status,
                StatusName = GetStatusDisplayName(p.Status),
                PriorityLevel = (int)p.PriorityLevel,
                PriorityName = GetPriorityDisplayName(p.PriorityLevel),
                DepartmentName = p.Department?.Name ?? "Chưa phân công",
                AssignedUserName = p.AssignedUser?.FullName,
                CitizenName = p.IsAnonymous ? "Ẩn danh" : p.CitizenName,
                CitizenPhone = p.IsAnonymous ? null : p.CitizenPhone,
                IsAnonymous = p.IsAnonymous,
                AddressText = p.AddressText,
                AdministrativeUnitName = p.AdministrativeUnit?.Name,
                CreatedAt = p.CreatedAt,
                DueDate = p.DueDate,
                ResolvedAt = p.ResolvedAt,
                IsOverdue = isOverdue,
                RemainingHours = remainingHours,
                AttachmentsCount = 0, // Không Include Attachments để tối ưu tốc độ
                HasFeedback = p.Feedback != null,
                FeedbackRating = p.Feedback?.Rating,
            };
        }).ToList();

        return PaginatedResult<AdminPetitionListItemDto>.Create(items, totalCount, pageNumber, pageSize);
    }

    private static string GetStatusDisplayName(PetitionStatus status) => status switch
    {
        PetitionStatus.Submitted    => "Mới tiếp nhận",
        PetitionStatus.Assigned     => "Đã phân công",
        PetitionStatus.Investigating => "Đang xử lý",
        PetitionStatus.Resolved     => "Đã giải quyết",
        PetitionStatus.Rejected     => "Từ chối thụ lý",
        PetitionStatus.Closed       => "Đã đóng hồ sơ",
        _ => status.ToString()
    };

    private static string GetPriorityDisplayName(PriorityLevel priority) => priority switch
    {
        PriorityLevel.Normal => "Tiêu chuẩn",
        PriorityLevel.High   => "Ưu tiên cao",
        PriorityLevel.Urgent => "Hỏa tốc / Khẩn",
        _ => priority.ToString()
    };
}
