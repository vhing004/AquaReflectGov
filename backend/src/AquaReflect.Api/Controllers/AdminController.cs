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
            Note = request.Note,
            DuplicateOfTrackingCode = request.DuplicateOfTrackingCode,
            DuplicateOfId = request.DuplicateOfId,
            ForwardToOrganization = request.ForwardToOrganization,
            ForwardReason = request.ForwardReason,
            NeedInfoReason = request.NeedInfoReason,
            NeedInfoDays = request.NeedInfoDays
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

        var evidenceFiles = new List<AquaReflect.Application.Common.Models.FileUploadModel>();
        if (request.EvidenceFiles != null && request.EvidenceFiles.Count > 0)
        {
            foreach (var ef in request.EvidenceFiles)
            {
                if (ef.Length > 0)
                {
                    evidenceFiles.Add(new AquaReflect.Application.Common.Models.FileUploadModel
                    {
                        ContentStream = ef.OpenReadStream(),
                        FileName = ef.FileName,
                        ContentType = ef.ContentType,
                        Length = ef.Length
                    });
                }
            }
        }

        var command = new AquaReflect.Application.Features.Petitions.Commands.UpdateResolution.UpdatePetitionResolutionCommand
        {
            PetitionId = id,
            ConclusionText = request.ConclusionText,
            DocumentNumber = request.DocumentNumber,
            ConclusionType = (AquaReflect.Domain.Enums.ConclusionType)request.ConclusionType,
            PublicSummary = request.PublicSummary,
            DocumentFile = fileModel,
            EvidenceFiles = evidenceFiles
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

    /// <summary>
    /// Lấy danh sách cán bộ/chuyên viên thuộc phòng ban kèm chỉ số tải công việc (Workload Status) để tự động gợi ý phân công
    /// </summary>
    /// <param name="departmentId">ID phòng ban cần lấy danh sách cán bộ</param>
    /// <param name="cancellationToken">CancellationToken</param>
    /// <returns>Danh sách cán bộ kèm chỉ số công việc đang thụ lý và đánh giá gợi ý</returns>
    [HttpGet("departments/{departmentId:guid}/officers")]
    [ProducesResponseType(typeof(ApiResponse<List<AquaReflect.Application.Features.Departments.Queries.GetDepartmentOfficers.DepartmentOfficerDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<List<AquaReflect.Application.Features.Departments.Queries.GetDepartmentOfficers.DepartmentOfficerDto>>>> GetDepartmentOfficers(
        Guid departmentId,
        CancellationToken cancellationToken)
    {
        var query = new AquaReflect.Application.Features.Departments.Queries.GetDepartmentOfficers.GetDepartmentOfficersQuery(departmentId);
        var result = await Mediator.Send(query, cancellationToken);
        return HandleResult(ApiResponse<List<AquaReflect.Application.Features.Departments.Queries.GetDepartmentOfficers.DepartmentOfficerDto>>.Ok(result, "Lấy danh sách cán bộ phòng ban thành công."));
    }

    /// <summary>
    /// [Task 4.1] Bắt đầu thẩm tra thực địa: Chuyển hồ sơ Assigned → Investigating.
    /// Chỉ Specialist (thuộc phòng ban phụ trách) hoặc SuperAdmin mới được thao tác.
    /// </summary>
    /// <param name="id">ID hồ sơ phản ánh</param>
    /// <param name="request">Ghi chú khởi động thẩm tra (tùy chọn)</param>
    /// <param name="cancellationToken">CancellationToken</param>
    [HttpPost("petitions/{id:guid}/begin-investigation")]
    [ProducesResponseType(typeof(ApiResponse<AquaReflect.Application.Features.Petitions.Commands.TransitionStatus.TransitionPetitionStatusResultDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<AquaReflect.Application.Features.Petitions.Commands.TransitionStatus.TransitionPetitionStatusResultDto>>> BeginInvestigation(
        Guid id,
        [FromBody] BeginInvestigationRequest request,
        CancellationToken cancellationToken)
    {
        var command = new AquaReflect.Application.Features.Petitions.Commands.TransitionStatus.TransitionPetitionStatusCommand
        {
            PetitionId = id,
            ToStatus = AquaReflect.Domain.Enums.PetitionStatus.Investigating,
            Note = request.Note
        };
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(ApiResponse<AquaReflect.Application.Features.Petitions.Commands.TransitionStatus.TransitionPetitionStatusResultDto>.Ok(result, result.Message));
    }

    /// <summary>
    /// [Task 4.1] Ghi chú nghiệp vụ hiện trường kèm ảnh biên bản thực địa.
    /// Dành cho Chuyên viên đang khảo sát thực địa (Assigned hoặc Investigating).
    /// Hỗ trợ đính kèm tối đa 5 tệp ảnh/video/PDF biên bản.
    /// </summary>
    /// <param name="id">ID hồ sơ phản ánh</param>
    /// <param name="request">Nội dung ghi chú, loại ghi chú, GPS và tệp đính kèm</param>
    /// <param name="cancellationToken">CancellationToken</param>
    [HttpPost("petitions/{id:guid}/inspection-notes")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ApiResponse<AquaReflect.Application.Features.Petitions.DTOs.InspectionNoteResultDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<AquaReflect.Application.Features.Petitions.DTOs.InspectionNoteResultDto>>> AddInspectionNote(
        Guid id,
        [FromForm] InspectionNoteRequest request,
        CancellationToken cancellationToken)
    {
        var fileUploadModels = new List<AquaReflect.Application.Common.Models.FileUploadModel>();
        if (request.Files != null && request.Files.Count > 0)
        {
            foreach (var formFile in request.Files)
            {
                if (formFile.Length > 0)
                {
                    fileUploadModels.Add(new AquaReflect.Application.Common.Models.FileUploadModel
                    {
                        ContentStream = formFile.OpenReadStream(),
                        FileName = formFile.FileName,
                        ContentType = formFile.ContentType,
                        Length = formFile.Length
                    });
                }
            }
        }

        var command = new AquaReflect.Application.Features.Petitions.Commands.AddInspectionNote.AddInspectionNoteCommand
        {
            PetitionId = id,
            NoteContent = request.NoteContent,
            NoteType = (AquaReflect.Application.Features.Petitions.Commands.AddInspectionNote.InspectionNoteType)request.NoteType,
            FieldLatitude = request.FieldLatitude,
            FieldLongitude = request.FieldLongitude,
            Files = fileUploadModels
        };

        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(ApiResponse<AquaReflect.Application.Features.Petitions.DTOs.InspectionNoteResultDto>.Ok(result, result.Message));
    }

    /// <summary>
    /// Nhập hộ phản ánh kiến nghị khi tiếp nhận qua điện thoại, trực tiếp hoặc văn bản (createOnBehalf)
    /// </summary>
    [HttpPost("petitions/on-behalf")]
    [Authorize(Roles = "SuperAdmin,Dispatcher")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ApiResponse<AquaReflect.Application.Features.Petitions.DTOs.CreatePetitionResultDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<AquaReflect.Application.Features.Petitions.DTOs.CreatePetitionResultDto>>> CreateOnBehalf(
        [FromForm] CreateOnBehalfRequest request,
        CancellationToken cancellationToken)
    {
        var fileUploadModels = new List<AquaReflect.Application.Common.Models.FileUploadModel>();
        if (request.Files != null && request.Files.Count > 0)
        {
            foreach (var formFile in request.Files)
            {
                if (formFile.Length > 0)
                {
                    fileUploadModels.Add(new AquaReflect.Application.Common.Models.FileUploadModel
                    {
                        ContentStream = formFile.OpenReadStream(),
                        FileName = formFile.FileName,
                        ContentType = formFile.ContentType,
                        Length = formFile.Length
                    });
                }
            }
        }

        var command = new AquaReflect.Application.Features.Petitions.Commands.CreateOnBehalf.CreatePetitionOnBehalfCommand
        {
            Title = request.Title,
            Content = request.Content,
            CategoryId = request.CategoryId,
            AddressText = request.AddressText,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            AdministrativeUnitId = request.AdministrativeUnitId,
            CitizenName = request.CitizenName,
            CitizenPhone = request.CitizenPhone,
            CitizenEmail = request.CitizenEmail,
            CitizenIdCard = request.CitizenIdCard,
            PriorityLevel = request.PriorityLevel,
            ReceptionSource = (AquaReflect.Domain.Enums.ReceptionSource)request.ReceptionSource,
            Files = fileUploadModels
        };

        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(ApiResponse<AquaReflect.Application.Features.Petitions.DTOs.CreatePetitionResultDto>.Created(result, result.Message));
    }
}

public class BeginInvestigationRequest
{
    /// <summary>Ghi chú ngắn khi bắt đầu thẩm tra (tùy chọn, ví dụ: "Bắt đầu kiểm tra khu vực nuôi trồng...")</summary>
    public string? Note { get; set; }
}

public class InspectionNoteRequest
{
    /// <summary>Nội dung ghi chú hiện trường (bắt buộc)</summary>
    public string NoteContent { get; set; } = string.Empty;

    /// <summary>
    /// Loại ghi chú: 1=Quan sát thực địa, 2=Biên bản kiểm tra, 3=Thu thập chứng cứ, 4=Ghi chú nội bộ
    /// </summary>
    public int NoteType { get; set; } = 1;

    /// <summary>Vĩ độ GPS vị trí chụp ảnh/ghi chú (WGS84, tùy chọn)</summary>
    public double? FieldLatitude { get; set; }

    /// <summary>Kinh độ GPS vị trí chụp ảnh/ghi chú (WGS84, tùy chọn)</summary>
    public double? FieldLongitude { get; set; }

    /// <summary>Tệp ảnh/video/biên bản PDF đính kèm từ thực địa (tối đa 5 tệp)</summary>
    public List<IFormFile>? Files { get; set; }
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
    /// Phân loại kết luận: 1=Đúng sự thật, 2=Đúng một phần, 3=Không đủ căn cứ / Sai sự thật
    /// </summary>
    public int ConclusionType { get; set; } = 1;

    /// <summary>
    /// Tóm tắt công khai hiển thị cho người dân trên cổng tra cứu và bản đồ GIS
    /// </summary>
    public string? PublicSummary { get; set; }

    /// <summary>
    /// Tệp văn bản scan hoặc văn bản ký số đính kèm (PDF, DOCX, JPG, PNG)
    /// </summary>
    public IFormFile? OfficialDocument { get; set; }

    /// <summary>
    /// Tệp minh chứng hiện trường khắc phục, hoàn trả mặt bằng hoặc biên bản xử phạt (tối đa 5 tệp)
    /// </summary>
    public List<IFormFile>? EvidenceFiles { get; set; }
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

    /// <summary>
    /// Mã biên nhận hồ sơ gốc khi gộp đơn (ToStatus = 8)
    /// </summary>
    public string? DuplicateOfTrackingCode { get; set; }

    /// <summary>
    /// ID hồ sơ gốc khi gộp đơn (tùy chọn)
    /// </summary>
    public Guid? DuplicateOfId { get; set; }

    /// <summary>
    /// Cơ quan chuyển tiếp (ToStatus = 9)
    /// </summary>
    public string? ForwardToOrganization { get; set; }

    /// <summary>
    /// Lý do chuyển tiếp ngoài ngành (ToStatus = 9)
    /// </summary>
    public string? ForwardReason { get; set; }

    /// <summary>
    /// Nội dung yêu cầu người dân bổ sung (ToStatus = 7)
    /// </summary>
    public string? NeedInfoReason { get; set; }

    /// <summary>
    /// Số ngày làm việc cho hạn bổ sung (mặc định 5 ngày)
    /// </summary>
    public int? NeedInfoDays { get; set; }
}

public class CreateOnBehalfRequest
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string? AddressText { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public int? AdministrativeUnitId { get; set; }
    public string CitizenName { get; set; } = string.Empty;
    public string CitizenPhone { get; set; } = string.Empty;
    public string? CitizenEmail { get; set; }
    public string? CitizenIdCard { get; set; }
    public AquaReflect.Domain.Enums.PriorityLevel? PriorityLevel { get; set; }
    public int ReceptionSource { get; set; }
    public List<IFormFile>? Files { get; set; }
}
