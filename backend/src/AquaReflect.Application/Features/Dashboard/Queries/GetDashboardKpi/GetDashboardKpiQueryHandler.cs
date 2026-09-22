using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Features.Dashboard.DTOs;
using AquaReflect.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Application.Features.Dashboard.Queries.GetDashboardKpi;

public class GetDashboardKpiQueryHandler : IRequestHandler<GetDashboardKpiQuery, DashboardReportDto>
{
    private readonly IApplicationDbContext _context;

    public GetDashboardKpiQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardReportDto> Handle(GetDashboardKpiQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var days = request.Days > 0 ? request.Days : 30;
        var startDate = request.Days > 0 ? now.Date.AddDays(-days + 1) : DateTime.MinValue;

        // Base query lọc theo thời gian và phòng ban
        var query = _context.Petitions
            .AsNoTracking()
            .Where(p => p.CreatedAt >= startDate);

        if (request.DepartmentId.HasValue)
        {
            query = query.Where(p => p.DepartmentId == request.DepartmentId.Value);
        }

        var petitions = await query
            .Include(p => p.Category)
            .Include(p => p.Department)
            .ToListAsync(cancellationToken);

        // 1. TÍNH TOÁN CÁC CHỈ SỐ KPI TỔNG THỂ
        var totalPetitions = petitions.Count;
        var submittedCount = petitions.Count(p => p.Status == PetitionStatus.Submitted);
        var assignedCount = petitions.Count(p => p.Status == PetitionStatus.Assigned);
        var inProgressCount = petitions.Count(p => p.Status == PetitionStatus.Investigating);
        var resolvedCount = petitions.Count(p => p.Status == PetitionStatus.Resolved || p.Status == PetitionStatus.Closed);
        var rejectedCount = petitions.Count(p => p.Status == PetitionStatus.Rejected);

        // Hồ sơ quá hạn: Đang xử lý mà đã quá DueDate
        var overdueCount = petitions.Count(p =>
            p.Status != PetitionStatus.Resolved &&
            p.Status != PetitionStatus.Closed &&
            p.Status != PetitionStatus.Rejected &&
            p.DueDate.HasValue &&
            p.DueDate.Value < now);

        // Hồ sơ giải quyết đúng hạn: Đã giải quyết và (ResolvedAt <= DueDate hoặc không có DueDate)
        var onTimeResolvedCount = petitions.Count(p =>
            (p.Status == PetitionStatus.Resolved || p.Status == PetitionStatus.Closed) &&
            (!p.DueDate.HasValue || !p.ResolvedAt.HasValue || p.ResolvedAt.Value <= p.DueDate.Value));

        var onTimeRate = resolvedCount > 0
            ? Math.Round((double)onTimeResolvedCount / resolvedCount * 100, 1)
            : 100.0;

        // Thời gian giải quyết trung bình (tính bằng giờ)
        var resolvedWithTime = petitions
            .Where(p => (p.Status == PetitionStatus.Resolved || p.Status == PetitionStatus.Closed) && p.ResolvedAt.HasValue)
            .ToList();

        var avgResolutionHours = resolvedWithTime.Count > 0
            ? Math.Round(resolvedWithTime.Average(p => (p.ResolvedAt!.Value - p.CreatedAt).TotalHours), 1)
            : 0.0;

        // Hồ sơ khẩn cấp chưa giải quyết
        var urgentPendingCount = petitions.Count(p =>
            p.PriorityLevel == PriorityLevel.Urgent &&
            p.Status != PetitionStatus.Resolved &&
            p.Status != PetitionStatus.Closed &&
            p.Status != PetitionStatus.Rejected);

        var kpiSummary = new DashboardKpiSummaryDto
        {
            TotalPetitions = totalPetitions,
            SubmittedCount = submittedCount,
            AssignedCount = assignedCount,
            InProgressCount = inProgressCount,
            ResolvedCount = resolvedCount,
            RejectedCount = rejectedCount,
            OverdueCount = overdueCount,
            OnTimeResolvedCount = onTimeResolvedCount,
            OnTimeRate = onTimeRate,
            AverageResolutionHours = avgResolutionHours,
            UrgentPendingCount = urgentPendingCount,
        };

        // 2. TÍNH TOÁN BIỂU ĐỒ XU HƯỚNG THEO NGÀY (TREND DATA)
        var trendData = new List<PetitionTrendItemDto>();
        var totalDays = (now.Date - startDate.Date).Days + 1;
        // Giới hạn tối đa 60 điểm để biểu đồ không bị rối mắt
        var step = totalDays > 60 ? (int)Math.Ceiling(totalDays / 30.0) : 1;

        var receivedByDate = petitions
            .GroupBy(p => p.CreatedAt.Date)
            .ToDictionary(g => g.Key, g => g.Count());

        var resolvedByDate = petitions
            .Where(p => p.ResolvedAt.HasValue)
            .GroupBy(p => p.ResolvedAt!.Value.Date)
            .ToDictionary(g => g.Key, g => g.Count());

        for (var d = startDate.Date; d <= now.Date; d = d.AddDays(step))
        {
            var dateKey = d;
            var nextDate = d.AddDays(step);

            var recCount = receivedByDate
                .Where(kvp => kvp.Key >= dateKey && kvp.Key < nextDate)
                .Sum(kvp => kvp.Value);

            var resCount = resolvedByDate
                .Where(kvp => kvp.Key >= dateKey && kvp.Key < nextDate)
                .Sum(kvp => kvp.Value);

            trendData.Add(new PetitionTrendItemDto
            {
                Date = d.ToString("yyyy-MM-dd"),
                Label = d.ToString("dd/MM"),
                ReceivedCount = recCount,
                ResolvedCount = resCount,
            });
        }

        // 3. THỐNG KÊ CƠ CẤU CHUYÊN MỤC (CATEGORY DISTRIBUTION)
        var categoryDistribution = petitions
            .Where(p => p.Category != null)
            .GroupBy(p => new { p.CategoryId, p.Category.Name, p.Category.CategoryType })
            .Select(g =>
            {
                var count = g.Count();
                var overdueInCat = g.Count(p =>
                    p.Status != PetitionStatus.Resolved &&
                    p.Status != PetitionStatus.Closed &&
                    p.Status != PetitionStatus.Rejected &&
                    p.DueDate.HasValue &&
                    p.DueDate.Value < now);

                return new CategoryStatItemDto
                {
                    CategoryId = g.Key.CategoryId,
                    CategoryName = g.Key.Name,
                    CategoryType = g.Key.CategoryType.ToString(),
                    Count = count,
                    Percentage = totalPetitions > 0 ? Math.Round((double)count / totalPetitions * 100, 1) : 0,
                    OverdueCount = overdueInCat,
                };
            })
            .OrderByDescending(c => c.Count)
            .ToList();

        // 4. ĐÁNH GIÁ HIỆU SUẤT THEO PHÒNG BAN (DEPARTMENT PERFORMANCE)
        var allDepartments = await _context.Departments
            .AsNoTracking()
            .Where(d => d.IsActive)
            .ToListAsync(cancellationToken);

        var departmentPerformance = allDepartments
            .Select(d =>
            {
                var deptPetitions = petitions.Where(p => p.DepartmentId == d.Id).ToList();
                var assigned = deptPetitions.Count;
                var inProg = deptPetitions.Count(p => p.Status == PetitionStatus.Assigned || p.Status == PetitionStatus.Investigating);
                var resolved = deptPetitions.Count(p => p.Status == PetitionStatus.Resolved || p.Status == PetitionStatus.Closed);
                var overdue = deptPetitions.Count(p =>
                    p.Status != PetitionStatus.Resolved &&
                    p.Status != PetitionStatus.Closed &&
                    p.Status != PetitionStatus.Rejected &&
                    p.DueDate.HasValue &&
                    p.DueDate.Value < now);

                var onTime = deptPetitions.Count(p =>
                    (p.Status == PetitionStatus.Resolved || p.Status == PetitionStatus.Closed) &&
                    (!p.DueDate.HasValue || !p.ResolvedAt.HasValue || p.ResolvedAt.Value <= p.DueDate.Value));

                var rate = resolved > 0 ? Math.Round((double)onTime / resolved * 100, 1) : 100.0;

                var deptResolvedTimes = deptPetitions
                    .Where(p => (p.Status == PetitionStatus.Resolved || p.Status == PetitionStatus.Closed) && p.ResolvedAt.HasValue)
                    .ToList();

                var avgHours = deptResolvedTimes.Count > 0
                    ? Math.Round(deptResolvedTimes.Average(p => (p.ResolvedAt!.Value - p.CreatedAt).TotalHours), 1)
                    : 0.0;

                return new DepartmentPerformanceDto
                {
                    DepartmentId = d.Id,
                    DepartmentName = d.Name,
                    DepartmentCode = d.Code,
                    TotalAssigned = assigned,
                    InProgressCount = inProg,
                    ResolvedCount = resolved,
                    OverdueCount = overdue,
                    OnTimeResolvedCount = onTime,
                    OnTimeRate = rate,
                    AverageResolutionHours = avgHours,
                };
            })
            .OrderByDescending(d => d.TotalAssigned)
            .ToList();

        // 5. CHỈ SỐ HÀI LÒNG CỦA CÔNG DÂN (CITIZEN SATISFACTION)
        var petitionIds = petitions.Select(p => p.Id).ToHashSet();

        var feedbacks = await _context.CitizenFeedbacks
            .AsNoTracking()
            .Include(f => f.Petition)
            .Where(f => petitionIds.Contains(f.PetitionId))
            .OrderByDescending(f => f.FeedbackAt)
            .ToListAsync(cancellationToken);

        var totalFeedbacks = feedbacks.Count;
        var fiveStar = feedbacks.Count(f => f.Rating == 5);
        var fourStar = feedbacks.Count(f => f.Rating == 4);
        var threeStar = feedbacks.Count(f => f.Rating == 3);
        var twoStar = feedbacks.Count(f => f.Rating == 2);
        var oneStar = feedbacks.Count(f => f.Rating == 1);

        var avgRating = totalFeedbacks > 0
            ? Math.Round(feedbacks.Average(f => f.Rating), 1)
            : 5.0; // Mặc định 5.0 nếu chưa có đánh giá nào

        var satisfactionRate = totalFeedbacks > 0
            ? Math.Round((double)(fiveStar + fourStar) / totalFeedbacks * 100, 1)
            : 100.0;

        var recentFeedbacks = feedbacks
            .Take(6)
            .Select(f => new RecentFeedbackItemDto
            {
                Id = f.Id,
                TrackingCode = f.Petition?.TrackingCode ?? string.Empty,
                PetitionTitle = f.Petition?.Title ?? string.Empty,
                Rating = f.Rating,
                Comment = f.Comment,
                FeedbackAt = f.FeedbackAt,
            })
            .ToList();

        var satisfactionStat = new SatisfactionStatDto
        {
            AverageRating = avgRating,
            TotalFeedbacks = totalFeedbacks,
            FiveStarCount = fiveStar,
            FourStarCount = fourStar,
            ThreeStarCount = threeStar,
            TwoStarCount = twoStar,
            OneStarCount = oneStar,
            SatisfactionRate = satisfactionRate,
            RecentFeedbacks = recentFeedbacks,
        };

        return new DashboardReportDto
        {
            KpiSummary = kpiSummary,
            TrendData = trendData,
            CategoryDistribution = categoryDistribution,
            DepartmentPerformance = departmentPerformance,
            Satisfaction = satisfactionStat,
        };
    }
}
