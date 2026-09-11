using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Common.Models;
using AquaReflect.Application.Features.AdministrativeUnits.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Application.Features.AdministrativeUnits.Queries;

public record GetAdministrativeUnitsQuery(int? ParentId = null, int? Level = null)
    : IRequest<ApiResponse<List<AdministrativeUnitDto>>>;

public class GetAdministrativeUnitsQueryHandler
    : IRequestHandler<GetAdministrativeUnitsQuery, ApiResponse<List<AdministrativeUnitDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetAdministrativeUnitsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<AdministrativeUnitDto>>> Handle(
        GetAdministrativeUnitsQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.AdministrativeUnits.AsNoTracking().AsQueryable();

        if (request.Level.HasValue)
        {
            query = query.Where(u => u.Level == request.Level.Value);
        }

        if (request.ParentId.HasValue)
        {
            query = query.Where(u => u.ParentId == request.ParentId.Value);
        }

        var units = await query
            .OrderBy(u => u.Name)
            .Select(u => new AdministrativeUnitDto
            {
                Id = u.Id,
                Code = u.Code,
                Name = u.Name,
                EnglishName = u.EnglishName,
                Level = u.Level,
                ParentId = u.ParentId
            })
            .ToListAsync(cancellationToken);

        return ApiResponse<List<AdministrativeUnitDto>>.Ok(units, "Lấy danh sách đơn vị hành chính thành công.");
    }
}
