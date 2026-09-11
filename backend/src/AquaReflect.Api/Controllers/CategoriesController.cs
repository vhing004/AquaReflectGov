using AquaReflect.Application.Common.Models;
using AquaReflect.Application.Features.Categories.DTOs;
using AquaReflect.Application.Features.Categories.Queries;
using Microsoft.AspNetCore.Mvc;

namespace AquaReflect.Api.Controllers;

public class CategoriesController : BaseApiController
{
    /// <summary>
    /// Lấy danh sách các danh mục loại phản ánh thủy sản (Dịch bệnh, Ô nhiễm, IUU...)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<CategoryDto>>>> GetCategories(CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetActiveCategoriesQuery(), cancellationToken);
        return HandleResult(result);
    }
}
