using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Application.Features.Departments.Queries.GetDepartmentOfficers;

public record DepartmentOfficerDto
{
    public Guid Id { get; init; }
    public string Username { get; init; } = string.Empty;
    public string FullName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string? PhoneNumber { get; init; }
    public Guid? DepartmentId { get; init; }
    public string? DepartmentName { get; init; }
    public int ActiveCaseCount { get; init; }
    public string WorkloadLevel { get; init; } = "Low"; // Low (0-2), Medium (3-5), High (>5)
    public bool IsRecommended { get; init; }
}

public record GetDepartmentOfficersQuery(Guid DepartmentId) : IRequest<List<DepartmentOfficerDto>>;

public class GetDepartmentOfficersQueryHandler : IRequestHandler<GetDepartmentOfficersQuery, List<DepartmentOfficerDto>>
{
    private readonly IApplicationDbContext _context;

    public GetDepartmentOfficersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<DepartmentOfficerDto>> Handle(GetDepartmentOfficersQuery request, CancellationToken cancellationToken)
    {
        // Lấy danh sách cán bộ/chuyên viên thuộc phòng ban
        var users = await _context.Users
            .Include(u => u.Department)
            .Where(u => u.DepartmentId == request.DepartmentId && u.IsActive && !u.IsDeleted)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        if (users.Count == 0)
        {
            return new List<DepartmentOfficerDto>();
        }

        var userIds = users.Select(u => u.Id).ToList();

        // Đếm số lượng hồ sơ đang thụ lý (Status Assigned = 2 hoặc Investigating = 3)
        var activeCounts = await _context.Petitions
            .Where(p => p.AssignedUserId.HasValue 
                     && userIds.Contains(p.AssignedUserId.Value) 
                     && !p.IsDeleted
                     && (p.Status == PetitionStatus.Assigned || p.Status == PetitionStatus.Investigating))
            .GroupBy(p => p.AssignedUserId!.Value)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.UserId, x => x.Count, cancellationToken);

        var minCount = users.Count > 0 
            ? users.Min(u => activeCounts.GetValueOrDefault(u.Id, 0))
            : 0;

        var dtos = users.Select(u =>
        {
            var count = activeCounts.GetValueOrDefault(u.Id, 0);
            var level = count switch
            {
                <= 2 => "Low",
                <= 5 => "Medium",
                _ => "High"
            };

            return new DepartmentOfficerDto
            {
                Id = u.Id,
                Username = u.Username,
                FullName = u.FullName,
                Email = u.Email,
                PhoneNumber = u.PhoneNumber,
                DepartmentId = u.DepartmentId,
                DepartmentName = u.Department?.Name,
                ActiveCaseCount = count,
                WorkloadLevel = level,
                IsRecommended = (count == minCount)
            };
        })
        .OrderBy(x => x.ActiveCaseCount)
        .ThenBy(x => x.FullName)
        .ToList();

        return dtos;
    }
}
