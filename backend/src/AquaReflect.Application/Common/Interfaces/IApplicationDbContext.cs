using AquaReflect.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<AdministrativeUnit> AdministrativeUnits { get; }
    DbSet<Department> Departments { get; }
    DbSet<User> Users { get; }
    DbSet<PetitionCategory> PetitionCategories { get; }
    DbSet<Petition> Petitions { get; }
    DbSet<PetitionAttachment> PetitionAttachments { get; }
    DbSet<PetitionHistory> PetitionHistories { get; }
    DbSet<PetitionComment> PetitionComments { get; }
    DbSet<PetitionResolution> PetitionResolutions { get; }
    DbSet<CitizenFeedback> CitizenFeedbacks { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<SystemSetting> SystemSettings { get; }
    DbSet<HolidayCalendar> HolidayCalendars { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
