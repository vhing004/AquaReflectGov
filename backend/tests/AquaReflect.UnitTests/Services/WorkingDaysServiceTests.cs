using AquaReflect.Application.Services;
using AquaReflect.Domain.Entities;
using AquaReflect.Domain.Enums;
using AquaReflect.Infrastructure.Data;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace AquaReflect.UnitTests.Services;

public class WorkingDaysServiceTests
{
    private readonly Mock<ILogger<WorkingDaysService>> _loggerMock = new();

    private ApplicationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var context = new ApplicationDbContext(options);

        // Seed cấu hình và ngày nghỉ lễ mẫu
        context.SystemSettings.AddRange(
            new SystemSetting { Key = "SLA_Urgent_Days", Value = "2", GroupName = "SLA" },
            new SystemSetting { Key = "SLA_High_Days", Value = "5", GroupName = "SLA" },
            new SystemSetting { Key = "SLA_Normal_Days", Value = "10", GroupName = "SLA" }
        );

        context.HolidayCalendars.AddRange(
            // Nghỉ Tết Dương Lịch 01/01/2026 (Thứ Năm)
            new HolidayCalendar { HolidayDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), Year = 2026, Description = "Tết Dương Lịch", IsRecurringSolar = true },
            // Nghỉ 30/04
            new HolidayCalendar { HolidayDate = new DateTime(2026, 4, 30, 0, 0, 0, DateTimeKind.Utc), Year = 2026, Description = "30/04", IsRecurringSolar = true }
        );

        context.SaveChanges();
        return context;
    }

    [Fact]
    public async Task IsWorkingDay_Weekend_ShouldReturnFalse()
    {
        var context = CreateInMemoryDbContext();
        var service = new WorkingDaysService(context, _loggerMock.Object);

        // 03/01/2026 là Thứ 7, 04/01/2026 là Chủ Nhật
        var saturday = new DateTime(2026, 1, 3);
        var sunday = new DateTime(2026, 1, 4);

        (await service.IsWorkingDayAsync(saturday)).Should().BeFalse();
        (await service.IsWorkingDayAsync(sunday)).Should().BeFalse();
    }

    [Fact]
    public async Task IsWorkingDay_Holiday_ShouldReturnFalse()
    {
        var context = CreateInMemoryDbContext();
        var service = new WorkingDaysService(context, _loggerMock.Object);

        // 01/01/2026 là Thứ 5 nhưng là ngày nghỉ Tết Dương Lịch
        var holiday = new DateTime(2026, 1, 1);
        (await service.IsWorkingDayAsync(holiday)).Should().BeFalse();
    }

    [Fact]
    public async Task IsWorkingDay_RegularWeekday_ShouldReturnTrue()
    {
        var context = CreateInMemoryDbContext();
        var service = new WorkingDaysService(context, _loggerMock.Object);

        // 02/01/2026 là Thứ 6 bình thường
        var friday = new DateTime(2026, 1, 2);
        (await service.IsWorkingDayAsync(friday)).Should().BeTrue();
    }

    [Fact]
    public async Task AddWorkingDays_CrossingWeekend_ShouldSkipWeekend()
    {
        var context = CreateInMemoryDbContext();
        var service = new WorkingDaysService(context, _loggerMock.Object);

        // Thứ Sáu 02/01/2026 + 1 ngày làm việc => Thứ Hai 05/01/2026
        var friday = new DateTime(2026, 1, 2, 9, 0, 0, DateTimeKind.Utc);
        var nextWorkingDay = await service.AddWorkingDaysAsync(friday, 1);

        nextWorkingDay.Date.Should().Be(new DateTime(2026, 1, 5));
    }

    [Fact]
    public async Task AddWorkingDays_CrossingHoliday_ShouldSkipHolidayAndWeekend()
    {
        var context = CreateInMemoryDbContext();
        var service = new WorkingDaysService(context, _loggerMock.Object);

        // Thứ Tư 31/12/2025 + 2 ngày làm việc:
        // - Ngày 01/01/2026 (Nghỉ lễ) -> bỏ qua
        // - Ngày 02/01/2026 (Thứ 6) -> ngày 1
        // - Ngày 03/01/2026 (Thứ 7) -> bỏ qua
        // - Ngày 04/01/2026 (CN) -> bỏ qua
        // - Ngày 05/01/2026 (Thứ 2) -> ngày 2
        var wednesday = new DateTime(2025, 12, 31, 8, 0, 0, DateTimeKind.Utc);
        var result = await service.AddWorkingDaysAsync(wednesday, 2);

        result.Date.Should().Be(new DateTime(2026, 1, 5));
    }

    [Fact]
    public async Task CalculateDueDate_UrgentPriority_ShouldAdd2WorkingDays()
    {
        var context = CreateInMemoryDbContext();
        var service = new WorkingDaysService(context, _loggerMock.Object);

        // Thứ Hai 05/01/2026 + 2 ngày khẩn cấp => Thứ Tư 07/01/2026
        var monday = new DateTime(2026, 1, 5, 10, 0, 0, DateTimeKind.Utc);
        var dueDate = await service.CalculateDueDateAsync(monday, PriorityLevel.Urgent);

        dueDate.Date.Should().Be(new DateTime(2026, 1, 7));
    }

    [Fact]
    public void CalculateEffectiveDueDate_WithPausedMinutes_ShouldExtendDueDate()
    {
        var context = CreateInMemoryDbContext();
        var service = new WorkingDaysService(context, _loggerMock.Object);

        var originalDueDate = new DateTime(2026, 1, 10, 12, 0, 0, DateTimeKind.Utc);
        // Tạm dừng 120 phút (2 giờ)
        var effective = service.CalculateEffectiveDueDate(originalDueDate, 120);

        effective.Should().Be(new DateTime(2026, 1, 10, 14, 0, 0, DateTimeKind.Utc));
    }

    [Fact]
    public void EvaluateSlaStatus_ResolvedBeforeDueDate_ShouldNotBeOverdue()
    {
        var context = CreateInMemoryDbContext();
        var service = new WorkingDaysService(context, _loggerMock.Object);

        var dueDate = new DateTime(2026, 1, 10, 12, 0, 0, DateTimeKind.Utc);
        var resolvedAt = new DateTime(2026, 1, 9, 15, 0, 0, DateTimeKind.Utc);

        var (isOverdue, _) = service.EvaluateSlaStatus(dueDate, resolvedAt, 0);

        isOverdue.Should().BeFalse();
    }
}
