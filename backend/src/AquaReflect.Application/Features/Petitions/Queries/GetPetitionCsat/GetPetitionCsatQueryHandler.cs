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

    public GetPetitionCsatQueryHandler(IApplicationDbContext context)
    {
        _context = context;
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

        var canFeedback = isResolvedOrClosed && !hasFeedback && isWithin14Days;

        var canReopen = (score.HasValue && score.Value <= 2)
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
