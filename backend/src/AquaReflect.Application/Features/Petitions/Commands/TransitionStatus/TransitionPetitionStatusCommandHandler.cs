using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Domain.Entities;
using AquaReflect.Domain.Enums;
using AquaReflect.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Application.Features.Petitions.Commands.TransitionStatus;

/// <summary>
/// Handler xử lý chuyển trạng thái hồ sơ theo State Machine và ghi vết Audit Trail
/// </summary>
public class TransitionPetitionStatusCommandHandler
    : IRequestHandler<TransitionPetitionStatusCommand, TransitionPetitionStatusResultDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IPetitionWorkflowService _workflowService;
    private readonly INotificationService _notificationService;
    private readonly IEmailService _emailService;
    private readonly IWorkingDaysService _workingDaysService;

    public TransitionPetitionStatusCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IPetitionWorkflowService workflowService,
        INotificationService notificationService,
        IEmailService emailService,
        IWorkingDaysService workingDaysService)
    {
        _context = context;
        _currentUser = currentUser;
        _workflowService = workflowService;
        _notificationService = notificationService;
        _emailService = emailService;
        _workingDaysService = workingDaysService;
    }

    public async Task<TransitionPetitionStatusResultDto> Handle(
        TransitionPetitionStatusCommand request, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra xác thực cán bộ
        if (!_currentUser.IsAuthenticated)
            throw new UnauthorizedAccessException("Vui lòng đăng nhập để thực hiện thao tác luân chuyển hồ sơ.");

        if (!_currentUser.Role.HasValue || _currentUser.Role == UserRole.Citizen)
            throw new ForbiddenException("Tài khoản người dân không có quyền điều phối hoặc cập nhật trạng thái hồ sơ.");

        // 2. Tải hồ sơ hiện tại từ DB
        var petition = await _context.Petitions
            .Include(p => p.Department)
            .Include(p => p.AssignedUser)
            .FirstOrDefaultAsync(p => p.Id == request.PetitionId && !p.IsDeleted, cancellationToken);

        if (petition == null)
            throw new NotFoundException($"Không tìm thấy hồ sơ phản ánh với ID: {request.PetitionId}");

        var previousStatus = petition.Status;

        // 3. Xác thực quy tắc chuyển trạng thái theo State Machine
        _workflowService.ValidateTransition(
            petition,
            request.ToStatus,
            _currentUser.Role.Value,
            _currentUser.DepartmentId,
            request.DepartmentId,
            request.ResolutionSummary,
            request.Note,
            request.NeedInfoReason,
            request.DuplicateOfTrackingCode,
            request.ForwardToOrganization);

        // 4. Nếu chỉ định hoặc thay đổi phòng ban thụ lý
        if (request.DepartmentId.HasValue && request.DepartmentId.Value != petition.DepartmentId)
        {
            var targetDept = await _context.Departments
                .FirstOrDefaultAsync(d => d.Id == request.DepartmentId.Value && !d.IsDeleted, cancellationToken);

            if (targetDept == null)
                throw new NotFoundException("Phòng ban / Cơ quan chuyên môn được chọn không tồn tại trên hệ thống.");

            petition.DepartmentId = targetDept.Id;
            petition.Department = targetDept;
            petition.AssignedUserId = null; // Xóa chuyên viên cũ khi chuyển phòng ban mới
            petition.AssignedUser = null;
        }

        // 5. Nếu chỉ định chuyên viên phụ trách
        if (request.AssignedUserId.HasValue)
        {
            var targetUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == request.AssignedUserId.Value && !u.IsDeleted, cancellationToken);

            if (targetUser == null)
                throw new NotFoundException("Cán bộ chuyên viên được phân công không tồn tại trên hệ thống.");

            if (petition.DepartmentId.HasValue && targetUser.DepartmentId.HasValue && targetUser.DepartmentId != petition.DepartmentId)
            {
                throw new BadRequestException("Cán bộ chuyên viên được phân công không thuộc phòng ban thụ lý hồ sơ này.");
            }

            petition.AssignedUserId = targetUser.Id;
            petition.AssignedUser = targetUser;
        }

        // 6. Xử lý các nghiệp vụ ngoại lệ và cập nhật trạng thái
        if (previousStatus == PetitionStatus.NeedInfo && request.ToStatus != PetitionStatus.NeedInfo)
        {
            // Bỏ tạm dừng SLA và cộng dồn số phút đã tạm dừng
            if (petition.SlaPausedAt.HasValue)
            {
                var pausedMinutes = (int)(DateTime.UtcNow - petition.SlaPausedAt.Value).TotalMinutes;
                if (pausedMinutes > 0)
                {
                    petition.TotalSlaPausedMinutes += pausedMinutes;
                }
                petition.SlaPausedAt = null;
            }
        }

        if (request.ToStatus == PetitionStatus.NeedInfo)
        {
            var days = request.NeedInfoDays.GetValueOrDefault(5);
            petition.NeedInfoReason = request.NeedInfoReason ?? request.Note;
            petition.NeedInfoDeadline = await _workingDaysService.AddWorkingDaysAsync(DateTime.UtcNow, days, cancellationToken);
            petition.NeedInfoCount++;
            petition.SlaPausedAt = DateTime.UtcNow;
        }
        else if (request.ToStatus == PetitionStatus.Merged)
        {
            Guid? targetDuplicateId = request.DuplicateOfId;
            if (!targetDuplicateId.HasValue && !string.IsNullOrWhiteSpace(request.DuplicateOfTrackingCode))
            {
                var cleanCode = request.DuplicateOfTrackingCode.Trim().ToUpperInvariant();
                var rootPetition = await _context.Petitions
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.TrackingCode == cleanCode && !p.IsDeleted, cancellationToken);

                if (rootPetition == null)
                    throw new NotFoundException($"Không tìm thấy hồ sơ phản ánh gốc với mã tra cứu: {cleanCode}");

                if (rootPetition.Id == petition.Id)
                    throw new BadRequestException("Không thể gộp hồ sơ vào chính nó.");

                targetDuplicateId = rootPetition.Id;
            }

            if (!targetDuplicateId.HasValue)
                throw new ValidationException("Vui lòng cung cấp mã biên nhận hồ sơ gốc để thực hiện gộp đơn trùng lặp.");

            petition.DuplicateOfId = targetDuplicateId.Value;
        }
        else if (request.ToStatus == PetitionStatus.Forwarded)
        {
            petition.ForwardToOrganization = request.ForwardToOrganization?.Trim();
            petition.ForwardReason = (request.ForwardReason ?? request.Note)?.Trim();
        }
        else if (request.ToStatus == PetitionStatus.Assigned)
        {
            // Tự động tính hạn SLA chuẩn theo ngày làm việc nếu chưa có
            if (!petition.DueDate.HasValue)
            {
                petition.DueDate = await _workingDaysService.CalculateDueDateAsync(petition.CreatedAt, petition.PriorityLevel, cancellationToken);
            }
        }
        else if (request.ToStatus == PetitionStatus.Resolved)
        {
            petition.ResolvedAt = DateTime.UtcNow;
            petition.ResolutionSummary = request.ResolutionSummary;
        }

        petition.Status = request.ToStatus;
        petition.UpdatedAt = DateTime.UtcNow;
        petition.LastModifiedBy = _currentUser.Username ?? _currentUser.UserId?.ToString();

        // 7. Lấy tên hiển thị của người thực hiện thao tác
        var performerName = _currentUser.Username ?? "Cán bộ điều phối";
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

        // 8. Tự động ghi nhận lịch sử xử lý (Audit Trail vào bảng PetitionHistory)
        var actionDescription = _workflowService.GetActionDescription(previousStatus, request.ToStatus);
        var historyNote = !string.IsNullOrWhiteSpace(request.Note)
            ? request.Note.Trim()
            : (!string.IsNullOrWhiteSpace(request.NeedInfoReason)
                ? $"Yêu cầu: {request.NeedInfoReason.Trim()}"
                : (!string.IsNullOrWhiteSpace(request.ResolutionSummary) ? request.ResolutionSummary.Trim() : actionDescription));

        var history = new PetitionHistory
        {
            Id = Guid.NewGuid(),
            PetitionId = petition.Id,
            FromStatus = previousStatus,
            ToStatus = request.ToStatus,
            Action = actionDescription,
            Note = historyNote,
            PerformedByUserId = _currentUser.UserId,
            PerformedByName = performerName,
            CreatedAt = DateTime.UtcNow
        };

        _context.PetitionHistories.Add(history);

        // 9. Lưu toàn bộ thay đổi vào cơ sở dữ liệu
        await _context.SaveChangesAsync(cancellationToken);

        // 10. Phát thông báo real-time tới phòng ban / cán bộ liên quan và live sync Kanban
        await _notificationService.NotifyPetitionStatusChangedAsync(
            petition,
            previousStatus,
            request.ToStatus,
            request.Note ?? request.ResolutionSummary ?? request.NeedInfoReason,
            cancellationToken);

        // 11. Nếu có phân công chuyên viên, gửi thông báo đích danh cho chuyên viên đó
        if (petition.AssignedUser != null && request.AssignedUserId.HasValue)
        {
            await _notificationService.NotifyPetitionAssignedAsync(petition, petition.AssignedUser, cancellationToken);
        }

        // 12. Gửi email cập nhật tiến độ cho công dân nếu có email
        if (!string.IsNullOrWhiteSpace(petition.CitizenEmail))
        {
            await _emailService.SendPetitionStatusUpdatedEmailAsync(
                petition.CitizenEmail,
                petition.CitizenName ?? "Quý công dân",
                petition.TrackingCode,
                petition.Title,
                GetStatusName(previousStatus),
                GetStatusName(petition.Status),
                request.Note ?? request.ResolutionSummary ?? request.NeedInfoReason,
                cancellationToken);
        }

        return new TransitionPetitionStatusResultDto
        {
            PetitionId = petition.Id,
            TrackingCode = petition.TrackingCode,
            PreviousStatus = (int)previousStatus,
            PreviousStatusName = GetStatusName(previousStatus),
            NewStatus = (int)petition.Status,
            NewStatusName = GetStatusName(petition.Status),
            Action = actionDescription,
            DepartmentName = petition.Department?.Name,
            AssignedUserName = petition.AssignedUser?.FullName,
            ResolvedAt = petition.ResolvedAt,
            Message = $"Chuyển trạng thái hồ sơ {petition.TrackingCode} sang '{GetStatusName(petition.Status)}' thành công."
        };
    }

    private static string GetStatusName(PetitionStatus status) => status switch
    {
        PetitionStatus.Submitted => "Mới tiếp nhận",
        PetitionStatus.Assigned => "Đã phân công",
        PetitionStatus.Investigating => "Đang xử lý",
        PetitionStatus.Resolved => "Đã giải quyết",
        PetitionStatus.Rejected => "Từ chối thụ lý",
        PetitionStatus.Closed => "Đã đóng",
        PetitionStatus.NeedInfo => "Yêu cầu bổ sung thông tin",
        PetitionStatus.Merged => "Đã gộp đơn trùng",
        PetitionStatus.Forwarded => "Đã chuyển cơ quan khác",
        PetitionStatus.Withdrawn => "Người dân đã rút đơn",
        _ => status.ToString()
    };
}
