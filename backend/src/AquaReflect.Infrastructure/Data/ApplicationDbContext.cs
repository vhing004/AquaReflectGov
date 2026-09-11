using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Domain.Common;
using AquaReflect.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Infrastructure.Data;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<AdministrativeUnit> AdministrativeUnits => Set<AdministrativeUnit>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<User> Users => Set<User>();
    public DbSet<PetitionCategory> PetitionCategories => Set<PetitionCategory>();
    public DbSet<Petition> Petitions => Set<Petition>();
    public DbSet<PetitionAttachment> PetitionAttachments => Set<PetitionAttachment>();
    public DbSet<PetitionHistory> PetitionHistories => Set<PetitionHistory>();
    public DbSet<PetitionComment> PetitionComments => Set<PetitionComment>();
    public DbSet<PetitionResolution> PetitionResolutions => Set<PetitionResolution>();
    public DbSet<CitizenFeedback> CitizenFeedbacks => Set<CitizenFeedback>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 1. Cấu hình AdministrativeUnit
        modelBuilder.Entity<AdministrativeUnit>(entity =>
        {
            entity.ToTable("AdministrativeUnits");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Code).HasMaxLength(20).IsRequired();
            entity.Property(e => e.Name).HasMaxLength(150).IsRequired();
            entity.Property(e => e.EnglishName).HasMaxLength(150);
            entity.HasIndex(e => e.Code).IsUnique();

            entity.HasOne(e => e.Parent)
                .WithMany(p => p.Children)
                .HasForeignKey(e => e.ParentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // 2. Cấu hình Department
        modelBuilder.Entity<Department>(entity =>
        {
            entity.ToTable("Departments");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(250).IsRequired();
            entity.Property(e => e.Code).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.Address).HasMaxLength(300);
            entity.HasIndex(e => e.Code).IsUnique();

            entity.HasOne(e => e.AdministrativeUnit)
                .WithMany(a => a.Departments)
                .HasForeignKey(e => e.AdministrativeUnitId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // 3. Cấu hình User
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Username).HasMaxLength(50).IsRequired();
            entity.Property(e => e.FullName).HasMaxLength(150).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(100).IsRequired();
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.PasswordSalt).IsRequired();
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();

            entity.HasOne(e => e.Department)
                .WithMany(d => d.Users)
                .HasForeignKey(e => e.DepartmentId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // 4. Cấu hình PetitionCategory
        modelBuilder.Entity<PetitionCategory>(entity =>
        {
            entity.ToTable("PetitionCategories");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Code).HasMaxLength(50).IsRequired();
            entity.HasIndex(e => e.Code).IsUnique();
        });

        // 5. Cấu hình Petition (Thực thể cốt lõi)
        modelBuilder.Entity<Petition>(entity =>
        {
            entity.ToTable("Petitions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TrackingCode).HasMaxLength(30).IsRequired();
            entity.Property(e => e.Title).HasMaxLength(300).IsRequired();
            entity.Property(e => e.Content).IsRequired();
            entity.Property(e => e.AddressText).HasMaxLength(500);
            entity.Property(e => e.CitizenName).HasMaxLength(150);
            entity.Property(e => e.CitizenPhone).HasMaxLength(20);
            entity.Property(e => e.CitizenEmail).HasMaxLength(100);
            entity.Property(e => e.CitizenIdCard).HasMaxLength(25);

            // Bỏ qua LocationGeometry nếu không có PostGIS C-extension trên host
            entity.Ignore(e => e.LocationGeometry);

            // Chỉ mục duy nhất cho mã hồ sơ tra cứu
            entity.HasIndex(e => e.TrackingCode).IsUnique();

            // Chỉ mục tọa độ địa lý (Vĩ độ, Kinh độ) phục vụ tìm kiếm và hiển thị bản đồ
            entity.HasIndex(e => new { e.Latitude, e.Longitude });

            // Chỉ mục tìm kiếm và lọc thường dùng
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.PriorityLevel);
            entity.HasIndex(e => e.CategoryId);
            entity.HasIndex(e => e.DepartmentId);
            entity.HasIndex(e => e.CreatedAt);

            // Các mối quan hệ ngoại khóa
            entity.HasOne(e => e.Category)
                .WithMany(c => c.Petitions)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Department)
                .WithMany(d => d.Petitions)
                .HasForeignKey(e => e.DepartmentId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.AssignedUser)
                .WithMany(u => u.AssignedPetitions)
                .HasForeignKey(e => e.AssignedUserId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.AdministrativeUnit)
                .WithMany(a => a.Petitions)
                .HasForeignKey(e => e.AdministrativeUnitId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Resolution)
                .WithOne(r => r.Petition)
                .HasForeignKey<PetitionResolution>(r => r.PetitionId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Feedback)
                .WithOne(f => f.Petition)
                .HasForeignKey<CitizenFeedback>(f => f.PetitionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // 6. Cấu hình PetitionAttachment
        modelBuilder.Entity<PetitionAttachment>(entity =>
        {
            entity.ToTable("PetitionAttachments");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FileName).HasMaxLength(255).IsRequired();
            entity.Property(e => e.OriginalFileName).HasMaxLength(255).IsRequired();
            entity.Property(e => e.FileUrl).IsRequired();
            entity.Property(e => e.MimeType).HasMaxLength(100).IsRequired();

            entity.HasOne(e => e.Petition)
                .WithMany(p => p.Attachments)
                .HasForeignKey(e => e.PetitionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // 7. Cấu hình PetitionHistory
        modelBuilder.Entity<PetitionHistory>(entity =>
        {
            entity.ToTable("PetitionHistories");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Action).HasMaxLength(150).IsRequired();
            entity.Property(e => e.PerformedByName).HasMaxLength(150);

            entity.HasOne(e => e.Petition)
                .WithMany(p => p.Histories)
                .HasForeignKey(e => e.PetitionId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.PerformedByUser)
                .WithMany(u => u.PerformedHistories)
                .HasForeignKey(e => e.PerformedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // 8. Cấu hình PetitionComment
        modelBuilder.Entity<PetitionComment>(entity =>
        {
            entity.ToTable("PetitionComments");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AuthorName).HasMaxLength(150).IsRequired();
            entity.Property(e => e.Content).IsRequired();

            entity.HasOne(e => e.Petition)
                .WithMany(p => p.Comments)
                .HasForeignKey(e => e.PetitionId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.AuthorUser)
                .WithMany()
                .HasForeignKey(e => e.AuthorUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // 9. Cấu hình PetitionResolution
        modelBuilder.Entity<PetitionResolution>(entity =>
        {
            entity.ToTable("PetitionResolutions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ConclusionText).IsRequired();
            entity.Property(e => e.DocumentNumber).HasMaxLength(100);

            entity.HasOne(e => e.ApprovedByUser)
                .WithMany()
                .HasForeignKey(e => e.ApprovedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // 10. Cấu hình CitizenFeedback
        modelBuilder.Entity<CitizenFeedback>(entity =>
        {
            entity.ToTable("CitizenFeedbacks");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Comment).HasMaxLength(1000);
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
