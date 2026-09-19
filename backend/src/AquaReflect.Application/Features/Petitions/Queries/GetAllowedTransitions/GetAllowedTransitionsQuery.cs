using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Domain.Enums;
using AquaReflect.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Application.Features.Petitions.Queries.GetAllowedTransitions;

public class AllowedTransitionDto
{
    public int Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public string ActionDescription { get; set; } = string.Empty;
    public bool RequiresDepartment { get; set; }
    public bool RequiresResolution { get; set; }
    public bool RequiresReason { get; set; }
}

public class GetAllowedTransitionsQuery : IRequest<List<AllowedTransitionDto>>
{
    public Guid PetitionId { get; set; }

    public GetAllowedTransitionsQuery(Guid petitionId)
    {
        PetitionId = petitionId;
    }
}

public class GetAllowedTransitionsQueryHandler : IRequestHandler<GetAllowedTransitionsQuery, List<AllowedTransitionDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IPetitionWorkflowService _workflowService;

    public GetAllowedTransitionsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IPetitionWorkflowService workflowService)
    {
        _context = context;
        _currentUser = currentUser;
        _workflowService = workflowService;
    }

    public async Task<List<AllowedTransitionDto>> Handle(
        GetAllowedTransitionsQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || !_currentUser.Role.HasValue)
            throw new UnauthorizedAccessException("Vui lòng đăng nhập để kiểm tra quyền hạn thao tác.");

        var role = _currentUser.Role.Value;
        if (role == UserRole.Citizen)
            return new List<AllowedTransitionDto>();

        var petition = await _context.Petitions
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.PetitionId && !p.IsDeleted, cancellationToken);

        if (petition == null)
            throw new NotFoundException($"Không tìm thấy hồ sơ phản ánh với ID: {request.PetitionId}");

        // Nếu là Specialist và hồ sơ không thuộc phòng ban của mình thì không có quyền
        if (role == UserRole.Specialist)
        {
            if (!_currentUser.DepartmentId.HasValue || petition.DepartmentId != _currentUser.DepartmentId.Value)
            {
                return new List<AllowedTransitionDto>();
            }
        }

        var allowedStatuses = _workflowService.GetAllowedTransitions(petition.Status, role);

        return allowedStatuses.Select(s => new AllowedTransitionDto
        {
            Status = (int)s,
            StatusName = GetStatusName(s),
            ActionDescription = _workflowService.GetActionDescription(petition.Status, s),
            RequiresDepartment = s == PetitionStatus.Assigned,
            RequiresResolution = s == PetitionStatus.Resolved,
            RequiresReason = s == PetitionStatus.Rejected,
        }).ToList();
    }

    private static string GetStatusName(PetitionStatus status) => status switch
    {
        PetitionStatus.Submitted => "Mới tiếp nhận",
        PetitionStatus.Assigned => "Đã phân công",
        PetitionStatus.Investigating => "Đang xử lý",
        PetitionStatus.Resolved => "Đã giải quyết",
        PetitionStatus.Rejected => "Từ chối thụ lý",
        PetitionStatus.Closed => "Đã đóng",
        _ => status.ToString()
    };
}
