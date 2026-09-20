using AquaReflect.Application.Common.Models;
using AquaReflect.Application.Features.Petitions.Queries.GetAdminPetitionList;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AquaReflect.Api.Controllers;

/// <summary>
/// API điều hành và quản lý hồ sơ nghiệp vụ dành riêng cho cán bộ (Dispatcher, Specialist, SuperAdmin)
/// </summary>
[Authorize(Roles = "SuperAdmin,Dispatcher,Specialist")]
public class AdminController : BaseApiController
{
    /// <summary>
    /// Lấy danh sách hồ sơ phân trang với bộ lọc đa tiêu chí (từ khóa, trạng thái, phòng ban, mức ưu tiên, quá hạn, thời gian...)
    /// </summary>
    /// <param name="query">Các tham số lọc, sắp xếp và phân trang</param>
    /// <param name="cancellationToken">CancellationToken</param>
    /// <returns>Danh sách hồ sơ phân trang kèm siêu dữ liệu</returns>
    [HttpGet("petitions")]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResult<AdminPetitionListItemDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<PaginatedResult<AdminPetitionListItemDto>>>> GetPetitions(
        [FromQuery] GetAdminPetitionListQuery query,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(query, cancellationToken);
        return HandleResult(ApiResponse<PaginatedResult<AdminPetitionListItemDto>>.Ok(result, "Lấy danh sách hồ sơ thành công."));
    }

    /// <summary>
    /// Lấy danh sách các trạng thái tiếp theo hợp lệ mà cán bộ hiện tại có thể chuyển đối với hồ sơ này
    /// </summary>
    /// <param name="id">ID hồ sơ phản ánh</param>
    /// <param name="cancellationToken">CancellationToken</param>
    /// <returns>Danh sách các trạng thái kế tiếp được phép chuyển đổi</returns>
    [HttpGet("petitions/{id:guid}/allowed-transitions")]
    [ProducesResponseType(typeof(ApiResponse<List<AquaReflect.Application.Features.Petitions.Queries.GetAllowedTransitions.AllowedTransitionDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<List<AquaReflect.Application.Features.Petitions.Queries.GetAllowedTransitions.AllowedTransitionDto>>>> GetAllowedTransitions(
        Guid id,
        CancellationToken cancellationToken)
    {
        var query = new AquaReflect.Application.Features.Petitions.Queries.GetAllowedTransitions.GetAllowedTransitionsQuery(id);
        var result = await Mediator.Send(query, cancellationToken);
        return HandleResult(ApiResponse<List<AquaReflect.Application.Features.Petitions.Queries.GetAllowedTransitions.AllowedTransitionDto>>.Ok(result, "Lấy danh sách trạng thái hợp lệ thành công."));
    }

    /// <summary>
    /// Thực hiện luân chuyển trạng thái hồ sơ theo Workflow State Machine và tự động ghi vết Audit Trail
    /// </summary>
    /// <param name="id">ID hồ sơ phản ánh</param>
    /// <param name="request">Thông tin chuyển trạng thái</param>
    /// <param name="cancellationToken">CancellationToken</param>
    /// <returns>Kết quả cập nhật trạng thái mới</returns>
    [HttpPost("petitions/{id:guid}/transition")]
    [ProducesResponseType(typeof(ApiResponse<AquaReflect.Application.Features.Petitions.Commands.TransitionStatus.TransitionPetitionStatusResultDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<AquaReflect.Application.Features.Petitions.Commands.TransitionStatus.TransitionPetitionStatusResultDto>>> TransitionStatus(
        Guid id,
        [FromBody] TransitionStatusRequest request,
        CancellationToken cancellationToken)
    {
        var command = new AquaReflect.Application.Features.Petitions.Commands.TransitionStatus.TransitionPetitionStatusCommand
        {
            PetitionId = id,
            ToStatus = (AquaReflect.Domain.Enums.PetitionStatus)request.ToStatus,
            DepartmentId = request.DepartmentId,
            AssignedUserId = request.AssignedUserId,
            ResolutionSummary = request.ResolutionSummary,
            Note = request.Note
        };

        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(ApiResponse<AquaReflect.Application.Features.Petitions.Commands.TransitionStatus.TransitionPetitionStatusResultDto>.Ok(result, result.Message));
    }

    /// <summary>
    /// Lấy toàn bộ thông tin chi tiết hồ sơ nghiệp vụ cán bộ
    /// </summary>
    /// <param name="id">ID hồ sơ phản ánh</param>
    /// <param name="cancellationToken">CancellationToken</param>
    /// <returns>Dữ liệu chi tiết hồ sơ toàn diện</returns>
    [HttpGet("petitions/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<AquaReflect.Application.Features.Petitions.DTOs.AdminPetitionDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<AquaReflect.Application.Features.Petitions.DTOs.AdminPetitionDetailDto>>> GetPetitionDetail(
        Guid id,
        CancellationToken cancellationToken)
    {
        var query = new AquaReflect.Application.Features.Petitions.Queries.GetAdminPetitionDetail.GetAdminPetitionDetailQuery(id);
        var result = await Mediator.Send(query, cancellationToken);
        return HandleResult(ApiResponse<AquaReflect.Application.Features.Petitions.DTOs.AdminPetitionDetailDto>.Ok(result, "Lấy chi tiết hồ sơ thành công."));
    }

    /// <summary>
    /// Ban hành kết luận giải quyết và đính kèm văn bản quyết định có dấu đỏ
    /// </summary>
    /// <param name="id">ID hồ sơ phản ánh</param>
    /// <param name="request">Thông tin kết luận và tệp văn bản</param>
    /// <param name="cancellationToken">CancellationToken</param>
    /// <returns>Kết quả giải quyết đã ban hành</returns>
    [HttpPost("petitions/{id:guid}/resolution")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ApiResponse<AquaReflect.Application.Features.Petitions.DTOs.PetitionResolutionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<AquaReflect.Application.Features.Petitions.DTOs.PetitionResolutionDto>>> UpdateResolution(
        Guid id,
        [FromForm] IssueResolutionRequest request,
        CancellationToken cancellationToken)
    {
        AquaReflect.Application.Common.Models.FileUploadModel? fileModel = null;
        if (request.OfficialDocument != null && request.OfficialDocument.Length > 0)
        {
            fileModel = new AquaReflect.Application.Common.Models.FileUploadModel
            {
                ContentStream = request.OfficialDocument.OpenReadStream(),
                FileName = request.OfficialDocument.FileName,
                ContentType = request.OfficialDocument.ContentType,
                Length = request.OfficialDocument.Length
            };
        }

        var command = new AquaReflect.Application.Features.Petitions.Commands.UpdateResolution.UpdatePetitionResolutionCommand
        {
            PetitionId = id,
            ConclusionText = request.ConclusionText,
            DocumentNumber = request.DocumentNumber,
            DocumentFile = fileModel
        };

        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(ApiResponse<AquaReflect.Application.Features.Petitions.DTOs.PetitionResolutionDto>.Ok(result, "Ban hành kết luận giải quyết thành công."));
    }

    /// <summary>
    /// Thêm ghi chú nghiệp vụ hoặc trao đổi nội bộ giữa các cán bộ
    /// </summary>
    /// <param name="id">ID hồ sơ phản ánh</param>
    /// <param name="request">Nội dung ghi chú</param>
    /// <param name="cancellationToken">CancellationToken</param>
    /// <returns>Bình luận / ghi chú nội bộ vừa tạo</returns>
    [HttpPost("petitions/{id:guid}/comments")]
    [ProducesResponseType(typeof(ApiResponse<AquaReflect.Application.Features.Petitions.DTOs.PetitionCommentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<AquaReflect.Application.Features.Petitions.DTOs.PetitionCommentDto>>> AddComment(
        Guid id,
        [FromBody] AddCommentRequest request,
        CancellationToken cancellationToken)
    {
        var command = new AquaReflect.Application.Features.Petitions.Commands.AddComment.AddPetitionCommentCommand
        {
            PetitionId = id,
            Content = request.Content
        };

        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(ApiResponse<AquaReflect.Application.Features.Petitions.DTOs.PetitionCommentDto>.Ok(result, "Thêm ghi chú nội bộ thành công."));
    }
}

public class IssueResolutionRequest
{
    /// <summary>
    /// Nội dung kết luận giải quyết và biện pháp xử lý
    /// </summary>
    public string ConclusionText { get; set; } = string.Empty;

    /// <summary>
    /// Số hiệu văn bản / Quyết định xử lý (ví dụ: Số 128/KL-CCTS)
    /// </summary>
    public string? DocumentNumber { get; set; }

    /// <summary>
    /// Tệp văn bản scan hoặc văn bản ký số đính kèm (PDF, DOCX, JPG, PNG)
    /// </summary>
    public IFormFile? OfficialDocument { get; set; }
}

public class AddCommentRequest
{
    /// <summary>
    /// Nội dung ghi chú nghiệp vụ nội bộ
    /// </summary>
    public string Content { get; set; } = string.Empty;
}

public class TransitionStatusRequest
{
    /// <summary>
    /// Trạng thái đích mong muốn (1=Submitted, 2=Assigned, 3=Investigating, 4=Resolved, 5=Rejected, 6=Closed)
    /// </summary>
    public int ToStatus { get; set; }

    /// <summary>
    /// ID phòng ban thụ lý (bắt buộc khi chuyển sang 2 - Đã phân công)
    /// </summary>
    public Guid? DepartmentId { get; set; }

    /// <summary>
    /// ID chuyên viên phụ trách (tùy chọn khi phân công cán bộ)
    /// </summary>
    public Guid? AssignedUserId { get; set; }

    /// <summary>
    /// Tóm tắt kết luận và biện pháp giải quyết (bắt buộc khi chuyển sang 4 - Đã giải quyết)
    /// </summary>
    public string? ResolutionSummary { get; set; }

    /// <summary>
    /// Ghi chú nghiệp vụ / Lý do điều phối (bắt buộc khi chuyển sang 5 - Từ chối)
    /// </summary>
    public string? Note { get; set; }
}
