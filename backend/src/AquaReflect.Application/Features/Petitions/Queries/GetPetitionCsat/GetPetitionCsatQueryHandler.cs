using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Features.Petitions.DTOs;
using AquaReflect.Domain.Enums;
using AquaReflect.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Application.Features.Petitions.Queries.GetPetitionCsat;

public class GetPetitionCsatQueryHandler : IRequestHandler<GetPetitionCsatQuery, CsatDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetPetitionCsatQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<CsatDto> Handle(GetPetitionCsatQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.TrackingCode))
            throw new BadRequestException("Mã tra cứu hồ sơ không được để trống.");

        var normalizedCode = request.TrackingCode.Trim().ToUpperInvariant().TrimStart('#');

        var petition = await _context.Petitions
            .Include(p => p.Feedback)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.TrackingCode == normalizedCode && !p.IsDeleted, cancellationToken);

        if (petition == null)
            throw new NotFoundException($"Không tìm thấy hồ sơ phản ánh với mã '{request.TrackingCode}'.");

        var now = DateTime.UtcNow;
        var referenceCloseDate = petition.ClosedAt ?? petition.ResolvedAt;
        var isResolvedOrClosed = petition.Status == PetitionStatus.Resolved || petition.Status == PetitionStatus.Closed;

        int? daysRemaining = null;
        bool isWithin14Days = false;
        if (referenceCloseDate.HasValue && isResolvedOrClosed)
        {
            var elapsedDays = (now - referenceCloseDate.Value).TotalDays;
            if (elapsedDays <= 14)
            {
                isWithin14Days = true;
                daysRemaining = Math.Max(0, 14 - (int)Math.Floor(elapsedDays));
            }
        }

        var score = petition.CsatScore ?? petition.Feedback?.Rating;
        var hasFeedback = petition.Feedback != null;

        // Xác định quyền chính chủ
        bool isOwner = false;
        if (_currentUser.IsAuthenticated && _currentUser.UserId.HasValue)
        {
            var currentUserIdStr = _currentUser.UserId.Value.ToString();
            var currentUsername = _currentUser.Username;

            var userEntity = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == _currentUser.UserId.Value, cancellationToken);

            var currentEmail = _currentUser.Email ?? userEntity?.Email;
            var currentPhone = userEntity?.PhoneNumber;

            if (!string.IsNullOrWhiteSpace(petition.CreatedBy) &&
                (petition.CreatedBy.Equals(currentUserIdStr, StringComparison.OrdinalIgnoreCase) ||
                 (!string.IsNullOrWhiteSpace(currentUsername) && petition.CreatedBy.Equals(currentUsername, StringComparison.OrdinalIgnoreCase)) ||
                 (!string.IsNullOrWhiteSpace(userEntity?.FullName) && petition.CreatedBy.Equals(userEntity.FullName, StringComparison.OrdinalIgnoreCase))))
            {
                isOwner = true;
            }
            else if (!string.IsNullOrWhiteSpace(petition.CitizenName) &&
                     ((!string.IsNullOrWhiteSpace(userEntity?.FullName) && petition.CitizenName.Trim().Equals(userEntity.FullName.Trim(), StringComparison.OrdinalIgnoreCase)) ||
                      (!string.IsNullOrWhiteSpace(currentUsername) && petition.CitizenName.Trim().Equals(currentUsername.Trim(), StringComparison.OrdinalIgnoreCase))))
            {
                isOwner = true;
            }
            else if (!string.IsNullOrWhiteSpace(petition.CitizenPhone) && !string.IsNullOrWhiteSpace(currentPhone))
            {
                var cleanPhone1 = petition.CitizenPhone.Trim().Replace(" ", "").Replace(".", "").Replace("-", "");
                var cleanPhone2 = currentPhone.Trim().Replace(" ", "").Replace(".", "").Replace("-", "");
                if (cleanPhone1.Length >= 9 && cleanPhone2.Length >= 9 && (cleanPhone1.EndsWith(cleanPhone2) || cleanPhone2.EndsWith(cleanPhone1)))
                {
                    isOwner = true;
                }
            }
            else if (!string.IsNullOrWhiteSpace(petition.CitizenEmail) && !string.IsNullOrWhiteSpace(currentEmail) &&
                     petition.CitizenEmail.Trim().Equals(currentEmail.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                isOwner = true;
            }

            if (_currentUser.Role.HasValue && 
                (_currentUser.Role.Value == UserRole.Dispatcher || _currentUser.Role.Value == UserRole.Specialist || _currentUser.Role.Value == UserRole.SuperAdmin))
            {
                isOwner = false;
            }
        }

        var canFeedback = isOwner && isResolvedOrClosed && !hasFeedback && isWithin14Days;

        var canReopen = isOwner
            && (score.HasValue && score.Value <= 2)
            && petition.ReopenCount == 0
            && petition.ReopenStatus == ReopenStatus.None
            && isWithin14Days;

        return new CsatDto
        {
            PetitionId = petition.Id,
            TrackingCode = petition.TrackingCode,
            Score = score,
            Comment = petition.Feedback?.Comment,
            FeedbackAt = petition.Feedback?.FeedbackAt,
            HasFeedback = hasFeedback,
            CanFeedback = canFeedback,
            CanReopen = canReopen,
            ReopenStatus = petition.ReopenStatus,
            ReopenStatusName = petition.ReopenStatus switch
            {
                ReopenStatus.Requested => "Đang chờ xem xét lại",
                ReopenStatus.Approved => "Đã duyệt mở lại",
                ReopenStatus.Rejected => "Từ chối mở lại",
                _ => "Không có"
            },
            ReopenCount = petition.ReopenCount,
            ReopenReason = petition.ReopenReason,
            ReopenedAt = petition.ReopenedAt,
            DaysRemainingForFeedback = daysRemaining
        };
    }
}
