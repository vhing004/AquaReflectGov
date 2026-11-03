using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Common.Models;
using AquaReflect.Application.Features.Users.DTOs;
using AquaReflect.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Application.Features.Users.Queries.GetUserList;

public record GetUserListQuery : IRequest<PaginatedResult<UserListItemDto>>
{
    public string? Keyword { get; init; }
    public UserRole? Role { get; init; }
    public Guid? DepartmentId { get; init; }
    public bool? IsActive { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}

public class GetUserListQueryHandler : IRequestHandler<GetUserListQuery, PaginatedResult<UserListItemDto>>
{
    private readonly IApplicationDbContext _context;

    public GetUserListQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<UserListItemDto>> Handle(GetUserListQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Users
            .Include(u => u.Department)
            .Where(u => !u.IsDeleted)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Keyword))
        {
            var kw = request.Keyword.Trim().ToLower();
            query = query.Where(u =>
                u.FullName.ToLower().Contains(kw) ||
                u.Username.ToLower().Contains(kw) ||
                u.Email.ToLower().Contains(kw) ||
                (u.PhoneNumber != null && u.PhoneNumber.Contains(kw)));
        }

        if (request.Role.HasValue)
        {
            query = query.Where(u => u.Role == request.Role.Value);
        }

        if (request.DepartmentId.HasValue)
        {
            query = query.Where(u => u.DepartmentId == request.DepartmentId.Value);
        }

        if (request.IsActive.HasValue)
        {
            query = query.Where(u => u.IsActive == request.IsActive.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var pagedQuery = query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize);

        var items = await pagedQuery.Select(u => new UserListItemDto
        {
            Id = u.Id,
            Username = u.Username,
            FullName = u.FullName,
            Email = u.Email,
            PhoneNumber = u.PhoneNumber,
            Role = u.Role,
            RoleName = u.Role == UserRole.SuperAdmin ? "Quản trị viên cấp cao" :
                       u.Role == UserRole.Dispatcher ? "Cán bộ điều phối" :
                       u.Role == UserRole.Specialist ? (u.IsUnitLead ? "Trưởng đơn vị" : "Cán bộ thụ lý") : "Người dân",
            DepartmentId = u.DepartmentId,
            DepartmentName = u.Department != null ? u.Department.Name : null,
            IsUnitLead = u.IsUnitLead,
            IsActive = u.IsActive,
            ActiveCaseCount = u.AssignedPetitions.Count(p => !p.IsDeleted &&
                (p.Status == PetitionStatus.Assigned ||
                 p.Status == PetitionStatus.Investigating ||
                 p.Status == PetitionStatus.PendingApproval)),
            ResolvedCaseCount = u.AssignedPetitions.Count(p => !p.IsDeleted &&
                (p.Status == PetitionStatus.Resolved ||
                 p.Status == PetitionStatus.Closed)),
            CreatedAt = u.CreatedAt,
            LastLoginAt = u.LastLoginAt
        }).ToListAsync(cancellationToken);

        return PaginatedResult<UserListItemDto>.Create(items, totalCount, request.PageNumber, request.PageSize);
    }
}

