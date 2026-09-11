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

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
