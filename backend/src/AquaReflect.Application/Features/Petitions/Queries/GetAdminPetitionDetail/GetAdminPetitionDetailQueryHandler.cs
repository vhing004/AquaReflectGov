using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Features.Petitions.DTOs;
using AquaReflect.Domain.Entities;
using AquaReflect.Domain.Enums;
using AquaReflect.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Application.Features.Petitions.Queries.GetAdminPetitionDetail;

/// <summary>
/// Handler truy vấn chi tiết hồ sơ phản ánh toàn diện dành cho Cán bộ thụ lý
/// </summary>
public class GetAdminPetitionDetailQueryHandler : IRequestHandler<GetAdminPetitionDetailQuery, AdminPetitionDetailDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetAdminPetitionDetailQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<AdminPetitionDetailDto> Handle(GetAdminPetitionDetailQuery request, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra xác thực & quyền hạn
        if (!_currentUser.IsAuthenticated)
            throw new UnauthorizedAccessException("Vui lòng đăng nhập để xem thông tin chi tiết hồ sơ.");

        var role = _currentUser.Role;
        if (role == UserRole.Citizen)
            throw new ForbiddenException("Tài khoản người dân không có quyền truy cập hồ sơ quản trị.");

        // 2. Tải toàn bộ thông tin hồ sơ kèm các quan hệ liên kết
        var petition = await _context.Petitions
            .Include(p => p.Category)
            .Include(p => p.Department)
            .Include(p => p.AdministrativeUnit)
            .Include(p => p.AssignedUser)
            .Include(p => p.Attachments.Where(a => !a.IsDeleted))
            .Include(p => p.Histories)
                .ThenInclude(h => h.PerformedByUser)
            .Include(p => p.Resolution)
                .ThenInclude(r => r!.ApprovedByUser)
            .Include(p => p.Feedback)
            .Include(p => p.Comments.Where(c => !c.IsDeleted))
                .ThenInclude(c => c.AuthorUser)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.Id && !p.IsDeleted, cancellationToken);

        if (petition == null)
            throw new NotFoundException($"Không tìm thấy hồ sơ phản ánh với mã định danh: {request.Id}");

        // 3. Specialist chỉ được xem hồ sơ thuộc phòng ban phụ trách (nếu hồ sơ đã phân phòng ban)
        if (role == UserRole.Specialist && _currentUser.DepartmentId.HasValue && petition.DepartmentId.HasValue)
        {
            if (petition.DepartmentId != _currentUser.DepartmentId)
            {
                throw new ForbiddenException("Bạn không có quyền truy cập hồ sơ thuộc phòng ban khác.");
            }
        }

        // 4. Tính toán các chỉ số SLA
        double? remainingHours = null;
        bool isOverdue = false;
        var now = DateTime.UtcNow;

        if (petition.DueDate.HasValue)
        {
            if (petition.ResolvedAt.HasValue)
            {
                isOverdue = petition.ResolvedAt.Value > petition.DueDate.Value;
                remainingHours = 0;
            }
            else
            {
                isOverdue = now > petition.DueDate.Value;
                remainingHours = (petition.DueDate.Value - now).TotalHours;
            }
        }

        // 5. Khởi tạo DTO chi tiết
        var dto = new AdminPetitionDetailDto
        {
            Id = petition.Id,
            TrackingCode = petition.TrackingCode,
            Title = petition.Title,
            Content = petition.Content,
            CategoryId = petition.CategoryId,
            CategoryName = petition.Category?.Name ?? string.Empty,
            CategoryCode = petition.Category?.Code ?? string.Empty,
            DefaultSlaHours = petition.Category?.DefaultSlaHours ?? 72,

            Status = (int)petition.Status,
            StatusName = GetStatusDisplayName(petition.Status),
            PriorityLevel = (int)petition.PriorityLevel,
            PriorityName = GetPriorityDisplayName(petition.PriorityLevel),

            AddressText = petition.AddressText,
            Latitude = petition.Latitude,
            Longitude = petition.Longitude,
            AdministrativeUnitId = petition.AdministrativeUnitId,
            AdministrativeUnitName = petition.AdministrativeUnit?.Name,

            IsAnonymous = petition.IsAnonymous,
            CitizenName = petition.CitizenName,
            CitizenPhone = petition.CitizenPhone,
            CitizenEmail = petition.CitizenEmail,
            CitizenIdCard = petition.CitizenIdCard,

            DepartmentId = petition.DepartmentId,
            DepartmentName = petition.Department?.Name,
            AssignedUserId = petition.AssignedUserId,
            AssignedUserName = !string.IsNullOrWhiteSpace(petition.AssignedUser?.FullName)
                ? petition.AssignedUser.FullName
                : petition.AssignedUser?.Username,
            AssignedUserEmail = petition.AssignedUser?.Email,

            CreatedAt = petition.CreatedAt,
            UpdatedAt = petition.UpdatedAt,
            DueDate = petition.DueDate,
            ResolvedAt = petition.ResolvedAt,
            IsOverdue = isOverdue,
            RemainingHours = remainingHours,
            ResolutionSummary = petition.ResolutionSummary,

            // Tệp đính kèm
            Attachments = petition.Attachments.Select(a => new PetitionAttachmentDto
            {
                Id = a.Id,
                FileName = a.FileName,
                OriginalFileName = a.OriginalFileName,
                FileUrl = a.FileUrl,
                FileType = a.FileType.ToString(),
                MimeType = a.MimeType,
                FileSize = a.FileSize,
                ExifLatitude = a.ExifLatitude,
                ExifLongitude = a.ExifLongitude
            }).ToList(),

            // Dòng thời gian lịch sử xử lý (Audit Trail)
            Timeline = petition.Histories
                .OrderBy(h => h.CreatedAt)
                .Select(h => new PetitionTimelineItemDto
                {
                    Id = h.Id,
                    CreatedAt = h.CreatedAt,
                    Action = h.Action,
                    FromStatus = h.FromStatus.HasValue ? (int)h.FromStatus.Value : null,
                    FromStatusName = h.FromStatus.HasValue ? GetStatusDisplayName(h.FromStatus.Value) : null,
                    ToStatus = (int)h.ToStatus,
                    ToStatusName = GetStatusDisplayName(h.ToStatus),
                    Note = h.Note,
                    ActorName = h.PerformedByName ?? (
                        !string.IsNullOrWhiteSpace(h.PerformedByUser?.FullName)
                            ? h.PerformedByUser.FullName
                            : h.PerformedByUser?.Username ?? "Cán bộ thụ lý"
                    )
                }).ToList(),

            // Kết luận xử lý chính thức
            Resolution = petition.Resolution != null ? new PetitionResolutionDto
            {
                Id = petition.Resolution.Id,
                ConclusionText = petition.Resolution.ConclusionText,
                DocumentNumber = petition.Resolution.DocumentNumber,
                OfficialDocumentUrl = petition.Resolution.OfficialDocumentUrl,
                ApprovedByName = !string.IsNullOrWhiteSpace(petition.Resolution.ApprovedByUser?.FullName)
                    ? petition.Resolution.ApprovedByUser.FullName
                    : petition.Resolution.ApprovedByUser?.Username ?? "Lãnh đạo Chi cục",
                IssuedAt = petition.Resolution.IssuedAt
            } : null,

            // Đánh giá công dân
            HasFeedback = petition.Feedback != null,
            FeedbackRating = petition.Feedback?.Rating,
            FeedbackComment = petition.Feedback?.Comment,
            FeedbackCreatedAt = petition.Feedback?.CreatedAt,

            // Ghi chú nội bộ
            Comments = petition.Comments
                .OrderBy(c => c.CreatedAt)
                .Select(c => new PetitionCommentDto
                {
                    Id = c.Id,
                    PetitionId = c.PetitionId,
                    AuthorName = c.AuthorName,
                    AuthorUserId = c.AuthorUserId,
                    IsInternal = c.IsInternal,
                    Content = c.Content,
                    CreatedAt = c.CreatedAt
                }).ToList()
        };

        return dto;
    }

    private static string GetStatusDisplayName(PetitionStatus status) => status switch
    {
        PetitionStatus.Submitted => "Mới tiếp nhận",
        PetitionStatus.Assigned => "Đã phân công",
        PetitionStatus.Investigating => "Đang xác minh & xử lý",
        PetitionStatus.Resolved => "Đã giải quyết",
        PetitionStatus.Rejected => "Từ chối tiếp nhận",
        PetitionStatus.Closed => "Đã đóng",
        _ => status.ToString()
    };

    private static string GetPriorityDisplayName(PriorityLevel priority) => priority switch
    {
        PriorityLevel.Normal => "Bình thường",
        PriorityLevel.High => "Ưu tiên cao",
        PriorityLevel.Urgent => "Khẩn cấp",
        _ => priority.ToString()
    };
}
