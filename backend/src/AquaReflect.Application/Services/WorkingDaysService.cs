using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Domain.Entities;
using AquaReflect.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AquaReflect.Application.Services;

/// <summary>
/// Triển khai dịch vụ tính toán ngày làm việc và quản trị hạn SLA
/// </summary>
public class WorkingDaysService : IWorkingDaysService
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<WorkingDaysService> _logger;

    public WorkingDaysService(
        IApplicationDbContext context,
        ILogger<WorkingDaysService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<bool> IsWorkingDayAsync(DateTime date, CancellationToken cancellationToken = default)
    {
        // 1. Kiểm tra ngày cuối tuần (Thứ 7 & Chủ Nhật)
        if (date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday)
        {
            return false;
        }

        // 2. Kiểm tra ngày nghỉ lễ trong HolidayCalendars
        var dateUtc = DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);
        var year = date.Year;

        var isHoliday = await _context.HolidayCalendars
            .AsNoTracking()
            .AnyAsync(h =>
                (h.Year == year && h.HolidayDate.Date == dateUtc) ||
                (h.IsRecurringSolar && h.HolidayDate.Month == date.Month && h.HolidayDate.Day == date.Day),
                cancellationToken);

        return !isHoliday;
    }

    public async Task<DateTime> AddWorkingDaysAsync(DateTime startDate, int workingDays, CancellationToken cancellationToken = default)
    {
        if (workingDays <= 0)
        {
            return startDate;
        }

        var currentDate = startDate;
        var addedDays = 0;

        // Tải trước danh mục ngày nghỉ lễ của các năm liên quan để tối ưu query
        var startYear = startDate.Year;
        var estimatedEndYear = startDate.AddDays(workingDays * 2 + 30).Year;

        var holidays = await _context.HolidayCalendars
            .AsNoTracking()
            .Where(h => (h.Year >= startYear && h.Year <= estimatedEndYear) || h.IsRecurringSolar)
            .ToListAsync(cancellationToken);

        while (addedDays < workingDays)
        {
            currentDate = currentDate.AddDays(1);

            // Kiểm tra cuối tuần
            if (currentDate.DayOfWeek == DayOfWeek.Saturday || currentDate.DayOfWeek == DayOfWeek.Sunday)
            {
                continue;
            }

            // Kiểm tra nghỉ lễ
            var curDateOnly = currentDate.Date;
            var isHoliday = holidays.Any(h =>
                h.HolidayDate.Date == curDateOnly ||
                (h.IsRecurringSolar && h.HolidayDate.Month == currentDate.Month && h.HolidayDate.Day == currentDate.Day));

            if (!isHoliday)
            {
                addedDays++;
            }
        }

        return currentDate;
    }

    public async Task<int> GetWorkingDaysBetweenAsync(DateTime start, DateTime end, CancellationToken cancellationToken = default)
    {
        if (start >= end)
        {
            return 0;
        }

        var startYear = start.Year;
        var endYear = end.Year;

        var holidays = await _context.HolidayCalendars
            .AsNoTracking()
            .Where(h => (h.Year >= startYear && h.Year <= endYear) || h.IsRecurringSolar)
            .ToListAsync(cancellationToken);

        var count = 0;
        var cur = start.Date.AddDays(1);
        var endDate = end.Date;

        while (cur <= endDate)
        {
            if (cur.DayOfWeek != DayOfWeek.Saturday && cur.DayOfWeek != DayOfWeek.Sunday)
            {
                var isHoliday = holidays.Any(h =>
                    h.HolidayDate.Date == cur ||
                    (h.IsRecurringSolar && h.HolidayDate.Month == cur.Month && h.HolidayDate.Day == cur.Day));

                if (!isHoliday)
                {
                    count++;
                }
            }
            cur = cur.AddDays(1);
        }

        return count;
    }

    public async Task<DateTime> CalculateDueDateAsync(DateTime startDate, PriorityLevel priority, CancellationToken cancellationToken = default)
    {
        // 1. Đọc số ngày làm việc từ cấu hình SystemSettings
        var settingKey = priority switch
        {
            PriorityLevel.Urgent => "SLA_Urgent_Days",
            PriorityLevel.High => "SLA_High_Days",
            _ => "SLA_Normal_Days"
        };

        var fallbackDays = priority switch
        {
            PriorityLevel.Urgent => 2,
            PriorityLevel.High => 5,
            _ => 10
        };

        var setting = await _context.SystemSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Key == settingKey, cancellationToken);

        var workingDays = fallbackDays;
        if (setting != null && int.TryParse(setting.Value, out var parsedDays) && parsedDays > 0)
        {
            workingDays = parsedDays;
        }

        // 2. Tính hạn chót theo ngày làm việc
        return await AddWorkingDaysAsync(startDate, workingDays, cancellationToken);
    }

    public DateTime CalculateEffectiveDueDate(DateTime originalDueDate, double totalSlaPausedMinutes, DateTime? slaPausedAt = null)
    {
        var totalMinutesToAdd = totalSlaPausedMinutes;

        // Nếu hồ sơ hiện đang trong trạng thái tạm dừng, tính thêm khoảng thời gian từ lúc tạm dừng đến hiện tại
        if (slaPausedAt.HasValue && DateTime.UtcNow > slaPausedAt.Value)
        {
            totalMinutesToAdd += (DateTime.UtcNow - slaPausedAt.Value).TotalMinutes;
        }

        return originalDueDate.AddMinutes(totalMinutesToAdd);
    }

    public (bool IsOverdue, double RemainingHours) EvaluateSlaStatus(DateTime? dueDate, DateTime? resolvedAt, double totalSlaPausedMinutes, DateTime? slaPausedAt = null)
    {
        if (!dueDate.HasValue)
        {
            return (false, 0);
        }

        var effectiveDueDate = CalculateEffectiveDueDate(dueDate.Value, totalSlaPausedMinutes, slaPausedAt);
        var now = DateTime.UtcNow;

        // Nếu đã có kết quả giải quyết
        if (resolvedAt.HasValue)
        {
            var isOverdue = resolvedAt.Value > effectiveDueDate;
            return (isOverdue, 0);
        }

        // Nếu đang tạm dừng SLA (NeedInfo)
        if (slaPausedAt.HasValue)
        {
            // Số giờ còn lại được bảo lưu tại thời điểm tạm dừng
            var hoursLeftAtPause = Math.Round((effectiveDueDate - now).TotalHours, 1);
            return (hoursLeftAtPause < 0, Math.Max(0, hoursLeftAtPause));
        }

        var remainingHours = Math.Round((effectiveDueDate - now).TotalHours, 1);
        return (remainingHours < 0, remainingHours);
    }
}
