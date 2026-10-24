using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Domain.Entities;
using AquaReflect.Domain.Enums;
using AquaReflect.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AquaReflect.Application.Features.Petitions.Commands.AssignMember;

/// <summary>
/// Handler xử lý phân công cán bộ thành viên trong đơn vị (Tầng 2 của luồng điều phối)
/// Chỉ dành cho:
/// - Trưởng đơn vị (Specialist có IsUnitLead = true) của chính đơn vị đó
/// - Hoặc SuperAdmin / Dispatcher
/// </summary>
public class AssignMemberCommandHandler : IRequestHandler<AssignMemberCommand, AssignMemberResultDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly INotificationService _notificationService;
    private readonly ILogger<AssignMemberCommandHandler> _logger;

    public AssignMemberCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        INotificationService notificationService,
        ILogger<AssignMemberCommandHandler> logger)
    {
        _context = context;
        _currentUser = currentUser;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<AssignMemberResultDto> Handle(AssignMemberCommand request, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra xác thực cán bộ
        if (!_currentUser.IsAuthenticated)
            throw new UnauthorizedAccessException("Vui lòng đăng nhập để thực hiện phân công cán bộ.");

        var role = _currentUser.Role;
        if (!role.HasValue || role == UserRole.Citizen)
            throw new ForbiddenException("Tài khoản người dân không có quyền phân công cán bộ thụ lý.");

        // 2. Tải hồ sơ từ DB
        var petition = await _context.Petitions
            .Include(p => p.Department)
            .Include(p => p.AssignedUser)
            .FirstOrDefaultAsync(p => p.Id == request.PetitionId && !p.IsDeleted, cancellationToken);

        if (petition == null)
            throw new NotFoundException($"Không tìm thấy hồ sơ phản ánh với ID: {request.PetitionId}");

        if (!petition.DepartmentId.HasValue)
            throw new BadRequestException("Hồ sơ chưa được giao về đơn vị xử lý. Cán bộ tiếp nhận (Dispatcher) phải giao đơn vị trước khi phân công thành viên.");

        // 3. Kiểm tra phân quyền: Trưởng đơn vị của đơn vị thụ lý HOẶC SuperAdmin / Dispatcher
        if (role == UserRole.Specialist)
        {
            if (!_currentUser.IsUnitLead)
                throw new ForbiddenException("Chỉ Trưởng đơn vị chuyên môn mới có quyền phân công cán bộ thụ lý trong đơn vị.");

            if (_currentUser.DepartmentId != petition.DepartmentId.Value)
                throw new ForbiddenException("Bạn chỉ có thẩm quyền phân công hồ sơ thuộc phạm vi đơn vị của mình.");
        }

        // 4. Kiểm tra trạng thái hồ sơ: Cho phép phân công ở trạng thái Assigned hoặc Investigating
        if (petition.Status != PetitionStatus.Assigned && petition.Status != PetitionStatus.Investigating && petition.Status != PetitionStatus.NeedInfo)
        {
            throw new BadRequestException($"Không thể phân công cán bộ khi hồ sơ đang ở trạng thái {petition.Status}.");
        }

        // 5. Kiểm tra thành viên được phân công
        var targetMember = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.AssignedUserId && !u.IsDeleted && u.IsActive, cancellationToken);

        if (targetMember == null)
            throw new NotFoundException("Cán bộ chuyên viên được phân công không tồn tại trên hệ thống hoặc đã bị khóa.");

        if (targetMember.DepartmentId != petition.DepartmentId.Value)
            throw new BadRequestException($"Cán bộ {targetMember.FullName} không thuộc đơn vị {petition.Department?.Name ?? "này"}. Chỉ được phân công cán bộ trong nội bộ đơn vị.");

        // 6. Cập nhật hồ sơ
        var previousAssigned = petition.AssignedUser?.FullName;
        petition.AssignedUserId = targetMember.Id;
        petition.AssignedUser = targetMember;
        petition.UpdatedAt = DateTime.UtcNow;
        petition.LastModifiedBy = _currentUser.Username ?? _currentUser.UserId?.ToString();

        // 7. Lấy tên hiển thị người phân công
        var performerName = _currentUser.Username ?? "Trưởng đơn vị";
        if (_currentUser.UserId.HasValue)
        {
            var currentUserEntity = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == _currentUser.UserId.Value, cancellationToken);
            if (currentUserEntity != null && !string.IsNullOrWhiteSpace(currentUserEntity.FullName))
            {
                performerName = currentUserEntity.FullName;
            }
        }

        // 8. Ghi nhận lịch sử xử lý (Audit Trail)
        var actionText = string.IsNullOrWhiteSpace(previousAssigned)
            ? $"Trưởng đơn vị phân công cán bộ {targetMember.FullName} thụ lý"
            : $"Trưởng đơn vị điều chuyển từ {previousAssigned} sang {targetMember.FullName}";

        var noteText = !string.IsNullOrWhiteSpace(request.Note)
            ? request.Note.Trim()
            : $"Phân công nhiệm vụ xử lý hồ sơ cho cán bộ {targetMember.FullName}";

        var history = new PetitionHistory
        {
            Id = Guid.NewGuid(),
            PetitionId = petition.Id,
            FromStatus = petition.Status,
            ToStatus = petition.Status,
            Action = actionText,
            Note = noteText,
            PerformedByUserId = _currentUser.UserId,
            PerformedByName = performerName,
            CreatedAt = DateTime.UtcNow
        };

        _context.PetitionHistories.Add(history);
        await _context.SaveChangesAsync(cancellationToken);

        // 9. Bắn thông báo thời gian thực (SignalR)
        await _notificationService.NotifyPetitionAssignedAsync(petition, targetMember, cancellationToken);

        _logger.LogInformation("Cán bộ {Performer} đã phân công hồ sơ {TrackingCode} cho cán bộ {Member} thuộc đơn vị {Dept}",
            performerName, petition.TrackingCode, targetMember.FullName, petition.Department?.Name);

        return new AssignMemberResultDto
        {
            PetitionId = petition.Id,
            TrackingCode = petition.TrackingCode,
            DepartmentId = petition.DepartmentId,
            DepartmentName = petition.Department?.Name,
            AssignedUserId = targetMember.Id,
            AssignedUserName = targetMember.FullName,
            Message = $"Đã phân công cán bộ {targetMember.FullName} thụ lý hồ sơ {petition.TrackingCode} thành công."
        };
    }
}
