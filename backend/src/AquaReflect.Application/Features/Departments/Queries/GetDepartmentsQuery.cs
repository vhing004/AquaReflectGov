using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Common.Models;
using AquaReflect.Application.Features.Departments.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Application.Features.Departments.Queries;

public record GetDepartmentsQuery : IRequest<ApiResponse<List<DepartmentDto>>>;

public class GetDepartmentsQueryHandler : IRequestHandler<GetDepartmentsQuery, ApiResponse<List<DepartmentDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetDepartmentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<DepartmentDto>>> Handle(
        GetDepartmentsQuery request,
        CancellationToken cancellationToken)
    {
        var departments = await _context.Departments
            .AsNoTracking()
            .Where(d => d.IsActive && !d.IsDeleted)
            .OrderBy(d => d.Name)
            .Select(d => new DepartmentDto
            {
                Id = d.Id,
                Name = d.Name,
                Code = d.Code,
                Description = d.Description,
                Phone = d.Phone,
                Email = d.Email,
                Address = d.Address
            })
            .ToListAsync(cancellationToken);

        return ApiResponse<List<DepartmentDto>>.Ok(departments, "Lấy danh sách cơ quan/phòng ban thành công.");
    }
}
