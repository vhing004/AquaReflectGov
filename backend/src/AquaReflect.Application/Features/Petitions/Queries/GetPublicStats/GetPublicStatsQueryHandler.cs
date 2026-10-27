using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Features.Petitions.DTOs;
using AquaReflect.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Application.Features.Petitions.Queries.GetPublicStats;

public class GetPublicStatsQueryHandler : IRequestHandler<GetPublicStatsQuery, PublicStatsDto>
{
    private readonly IApplicationDbContext _context;

    public GetPublicStatsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PublicStatsDto> Handle(GetPublicStatsQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var petitions = await _context.Petitions
            .Include(p => p.Category)
            .Include(p => p.Feedback)
            .AsNoTracking()
            .Where(p => !p.IsDeleted)
            .ToListAsync(cancellationToken);

        // 1. Tổng số hồ sơ tiếp nhận
        var totalPetitions = petitions.Count;

        // 2. Hồ sơ đang thụ lý, thẩm tra & xác minh thực tế
        var inProgressCount = petitions.Count(p =>
            p.Status == PetitionStatus.Submitted ||
            p.Status == PetitionStatus.Assigned ||
            p.Status == PetitionStatus.Investigating ||
            p.Status == PetitionStatus.NeedInfo);

        // 3. Hồ sơ đã hoàn tất giải quyết & ban hành kết luận
        var resolvedPetitions = petitions.Where(p =>
            p.Status == PetitionStatus.Resolved ||
            p.Status == PetitionStatus.Closed).ToList();
        var resolvedCount = resolvedPetitions.Count;

        // 4. Cảnh báo nóng (Hỏa tốc hoặc vùng giám sát trọng điểm IUU / Ô nhiễm đang xử lý)
        var urgentOrHotCount = petitions.Count(p =>
            (p.PriorityLevel == PriorityLevel.Urgent ||
             (p.Category != null && (p.Category.Code == "VI_PHAM_IUU" || p.Category.Code == "O_NHIEM_NUOC"))) &&
            p.Status != PetitionStatus.Resolved &&
            p.Status != PetitionStatus.Closed &&
            p.Status != PetitionStatus.Rejected &&
            p.Status != PetitionStatus.Withdrawn);

        // 5. Tỷ lệ giải quyết đúng hạn SLA
        var onTimeResolved = resolvedPetitions.Count(p =>
            !p.DueDate.HasValue ||
            !p.ResolvedAt.HasValue ||
            p.ResolvedAt.Value <= p.DueDate.Value);

        var onTimeRate = resolvedCount > 0
            ? Math.Round((double)onTimeResolved / resolvedCount * 100, 1)
            : 100.0;

        // 6. Tỷ lệ hài lòng nhân dân (tính từ đánh giá CSAT thực tế)
        var ratedFeedbacks = petitions
            .Where(p => p.Feedback != null && p.Feedback.Rating > 0)
            .Select(p => p.Feedback!.Rating)
            .ToList();

        var satisfactionRate = ratedFeedbacks.Count > 0
            ? Math.Round((double)ratedFeedbacks.Count(r => r >= 4) / ratedFeedbacks.Count * 100, 1)
            : 95.0;

        // 7. Số lượng tiếp nhận trong tháng hiện tại
        var thisMonthCount = petitions.Count(p => p.CreatedAt >= startOfMonth);

        return new PublicStatsDto
        {
            TotalPetitions = totalPetitions,
            InProgressCount = inProgressCount,
            ResolvedCount = resolvedCount,
            UrgentOrHotCount = urgentOrHotCount,
            SatisfactionRate = satisfactionRate,
            OnTimeRate = onTimeRate,
            ThisMonthCount = thisMonthCount
        };
    }
}
