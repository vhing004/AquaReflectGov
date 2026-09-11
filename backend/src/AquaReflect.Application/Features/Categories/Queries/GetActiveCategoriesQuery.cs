using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Common.Models;
using AquaReflect.Application.Features.Categories.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Application.Features.Categories.Queries;

public record GetActiveCategoriesQuery : IRequest<ApiResponse<List<CategoryDto>>>;

public class GetActiveCategoriesQueryHandler : IRequestHandler<GetActiveCategoriesQuery, ApiResponse<List<CategoryDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetActiveCategoriesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<CategoryDto>>> Handle(GetActiveCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await _context.PetitionCategories
            .AsNoTracking()
            .Where(c => c.IsActive && !c.IsDeleted)
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Code = c.Code,
                CategoryType = c.CategoryType,
                Description = c.Description,
                DefaultSlaHours = c.DefaultSlaHours,
                DisplayOrder = c.DisplayOrder
            })
            .ToListAsync(cancellationToken);

        return ApiResponse<List<CategoryDto>>.Ok(categories, "Lấy danh sách danh mục phản ánh thành công.");
    }
}
