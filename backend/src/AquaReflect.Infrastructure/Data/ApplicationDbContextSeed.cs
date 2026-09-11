using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Domain.Entities;
using AquaReflect.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace AquaReflect.Infrastructure.Data;

public static class ApplicationDbContextSeed
{
    public static async Task SeedSampleDataAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

        try
        {
            // 1. Seed Đơn vị hành chính
            if (!await context.AdministrativeUnits.AnyAsync())
            {
                logger.LogInformation("Đang khởi tạo dữ liệu mẫu Đơn vị hành chính...");

                var caMau = new AdministrativeUnit
                {
                    Code = "CM",
                    Name = "Tỉnh Cà Mau",
                    EnglishName = "Ca Mau Province",
                    Level = 1
                };
                var kienGiang = new AdministrativeUnit
                {
                    Code = "KG",
                    Name = "Tỉnh Kiên Giang",
                    EnglishName = "Kien Giang Province",
                    Level = 1
                };
                var benTre = new AdministrativeUnit
                {
                    Code = "BT",
                    Name = "Tỉnh Bến Tre",
                    EnglishName = "Ben Tre Province",
                    Level = 1
                };

                context.AdministrativeUnits.AddRange(caMau, kienGiang, benTre);
                await context.SaveChangesAsync();

                // Huyện thuộc Cà Mau
                var ngocHien = new AdministrativeUnit
                {
                    Code = "CM_NH",
                    Name = "Huyện Ngọc Hiển",
                    Level = 2,
                    ParentId = caMau.Id
                };
                var namCan = new AdministrativeUnit
                {
                    Code = "CM_NC",
                    Name = "Huyện Năm Căn",
                    Level = 2,
                    ParentId = caMau.Id
                };
                var tranVanThoi = new AdministrativeUnit
                {
                    Code = "CM_TVT",
                    Name = "Huyện Trần Văn Thời",
                    Level = 2,
                    ParentId = caMau.Id
                };

                context.AdministrativeUnits.AddRange(ngocHien, namCan, tranVanThoi);
                await context.SaveChangesAsync();

                // Xã tiêu biểu vùng biển/nuôi tôm
                var datMui = new AdministrativeUnit
                {
                    Code = "CM_NH_DM",
                    Name = "Xã Đất Mũi",
                    Level = 3,
                    ParentId = ngocHien.Id
                };
                var songDoc = new AdministrativeUnit
                {
                    Code = "CM_TVT_SD",
                    Name = "Thị trấn Sông Đốc (Cảng cá)",
                    Level = 3,
                    ParentId = tranVanThoi.Id
                };

                context.AdministrativeUnits.AddRange(datMui, songDoc);
                await context.SaveChangesAsync();
            }

            // 2. Seed Phòng ban / Cơ quan thụ lý
            Department? ccts = null;
            Department? ttkn = null;

            if (!await context.Departments.AnyAsync())
            {
                logger.LogInformation("Đang khởi tạo dữ liệu mẫu Phòng ban / Cơ quan chuyên môn...");

                var snn = new Department
                {
                    Name = "Sở Nông nghiệp & Phát triển Nông thôn",
                    Code = "SNNPTNT",
                    Phone = "0290.3831234",
                    Email = "snnptnt@camau.gov.vn",
                    Address = "Số 02, Đường Hùng Vương, TP Cà Mau"
                };

                ccts = new Department
                {
                    Name = "Chi cục Thủy sản",
                    Code = "CCTS",
                    Phone = "0290.3835678",
                    Email = "chicutthuysan@camau.gov.vn",
                    Address = "Số 15, Đường Lý Thường Kiệt, TP Cà Mau"
                };

                ttkn = new Department
                {
                    Name = "Đội Thanh tra Chuyên ngành Thủy sản - Kiểm ngư",
                    Code = "TTKN",
                    Phone = "0290.3839999",
                    Email = "kiemngu@camau.gov.vn",
                    Address = "Cảng cá Sông Đốc, Huyện Trần Văn Thời"
                };

                var pntts = new Department
                {
                    Name = "Phòng Nuôi trồng Thủy sản & Môi trường nước",
                    Code = "PNTTS",
                    Phone = "0290.3837777",
                    Email = "nuoitrong@camau.gov.vn",
                    Address = "Chi cục Thủy sản Cà Mau"
                };

                context.Departments.AddRange(snn, ccts, ttkn, pntts);
                await context.SaveChangesAsync();
            }
            else
            {
                ccts = await context.Departments.FirstOrDefaultAsync(d => d.Code == "CCTS");
                ttkn = await context.Departments.FirstOrDefaultAsync(d => d.Code == "TTKN");
            }

            // 3. Seed Danh mục loại phản ánh thủy sản
            if (!await context.PetitionCategories.AnyAsync())
            {
                logger.LogInformation("Đang khởi tạo danh mục Phản ánh Thủy sản...");

                var categories = new List<PetitionCategory>
                {
                    new()
                    {
                        Name = "Ô nhiễm nguồn nước nuôi trồng / Xả thải độc hại",
                        Code = "O_NHIEM_NUOC",
                        CategoryType = PetitionCategoryType.WaterPollution,
                        Description = "Phản ánh hiện tượng nước kênh rạch, vùng nuôi bị ô nhiễm màu đen/hôi, xả thải trộm từ nhà máy xí nghiệp.",
                        DefaultSlaHours = 48,
                        DisplayOrder = 1
                    },
                    new()
                    {
                        Name = "Dịch bệnh trên thủy hải sản (Tôm, cá chết hàng loạt)",
                        Code = "DICH_BENH",
                        CategoryType = PetitionCategoryType.AquaticDisease,
                        Description = "Phản ánh tôm cá nuôi đột ngột chết hàng loạt, có dấu hiệu lây lan diện rộng (đốm trắng, hoại tử gan tụy). Cần xử lý khẩn.",
                        DefaultSlaHours = 24,
                        DisplayOrder = 2
                    },
                    new()
                    {
                        Name = "Vi phạm khai thác hải sản IUU / Giã cào xung điện",
                        Code = "VI_PHAM_IUU",
                        CategoryType = PetitionCategoryType.IUUFishing,
                        Description = "Phản ánh tàu cá giã cào hủy diệt ven bờ, sử dụng xung điện, xiếc máy, khai thác sai vùng biển hoặc vi phạm thiết bị giám sát VMS.",
                        DefaultSlaHours = 24,
                        DisplayOrder = 3
                    },
                    new()
                    {
                        Name = "Chất lượng con giống & Thức ăn thủy sản kém chất lượng",
                        Code = "GIONG_THUC_AN",
                        CategoryType = PetitionCategoryType.SeedAndFeedQuality,
                        Description = "Phản ánh cơ sở kinh doanh giống tôm cá trôi nổi, thuốc thú y thủy sản giả hoặc thức ăn chăn nuôi không rõ nguồn gốc.",
                        DefaultSlaHours = 72,
                        DisplayOrder = 4
                    },
                    new()
                    {
                        Name = "Hạ tầng cảng cá, luồng lạch bồi lắng, khu neo đậu",
                        Code = "HA_TANG_CANG_CA",
                        CategoryType = PetitionCategoryType.FisheryInfrastructure,
                        Description = "Phản ánh cửa biển bị bồi lắng cản trở tàu bè ra vào, hư hỏng cầu cảng hoặc thiếu dịch vụ bến bãi neo đậu tránh bão.",
                        DefaultSlaHours = 120,
                        DisplayOrder = 5
                    },
                    new()
                    {
                        Name = "Cơ chế chính sách, TTHC đăng kiểm & cấp phép",
                        Code = "THU_TUC_HANH_CHINH",
                        CategoryType = PetitionCategoryType.AdministrativeProcedure,
                        Description = "Kiến nghị về thủ tục đăng ký, đăng kiểm tàu cá, cấp phép nuôi trồng biển, hỗ trợ thiên tai dịch bệnh.",
                        DefaultSlaHours = 72,
                        DisplayOrder = 6
                    },
                    new()
                    {
                        Name = "Vấn đề thủy sản khác",
                        Code = "KHAC",
                        CategoryType = PetitionCategoryType.Other,
                        Description = "Các kiến nghị và phản ánh khác liên quan đến đời sống và hoạt động sản xuất thủy sản.",
                        DefaultSlaHours = 72,
                        DisplayOrder = 99
                    }
                };

                context.PetitionCategories.AddRange(categories);
                await context.SaveChangesAsync();
            }

            // 4. Seed Tài khoản người dùng mẫu
            if (!await context.Users.AnyAsync())
            {
                logger.LogInformation("Đang khởi tạo các tài khoản người dùng mẫu...");

                var adminPass = passwordHasher.HashPassword("Admin@123");
                var canboPass = passwordHasher.HashPassword("Canbo@123");
                var danPass = passwordHasher.HashPassword("Dan@123");

                var admin = new User
                {
                    Username = "admin",
                    FullName = "Quản trị viên Hệ thống",
                    Email = "admin@aquareflect.gov.vn",
                    PhoneNumber = "0901234567",
                    Role = UserRole.SuperAdmin,
                    PasswordHash = adminPass.Hash,
                    PasswordSalt = adminPass.Salt,
                    IsActive = true
                };

                var dispatcher = new User
                {
                    Username = "diepphoi",
                    FullName = "Trần Thị Mai (Cán bộ Tiếp nhận CCTS)",
                    Email = "tiepnhan@aquareflect.gov.vn",
                    PhoneNumber = "0902345678",
                    Role = UserRole.Dispatcher,
                    DepartmentId = ccts?.Id,
                    PasswordHash = canboPass.Hash,
                    PasswordSalt = canboPass.Salt,
                    IsActive = true
                };

                var specialist = new User
                {
                    Username = "kiemngu",
                    FullName = "Lê Hoàng Long (Đội trưởng Thanh tra Kiểm ngư)",
                    Email = "kiemngu@aquareflect.gov.vn",
                    PhoneNumber = "0903456789",
                    Role = UserRole.Specialist,
                    DepartmentId = ttkn?.Id,
                    PasswordHash = canboPass.Hash,
                    PasswordSalt = canboPass.Salt,
                    IsActive = true
                };

                var citizen = new User
                {
                    Username = "ngudan",
                    FullName = "Nguyễn Văn Ngư (Hộ nuôi tôm Đất Mũi)",
                    Email = "ngudan@gmail.com",
                    PhoneNumber = "0909888999",
                    Role = UserRole.Citizen,
                    PasswordHash = danPass.Hash,
                    PasswordSalt = danPass.Salt,
                    IsActive = true
                };

                context.Users.AddRange(admin, dispatcher, specialist, citizen);
                await context.SaveChangesAsync();
            }

            logger.LogInformation("Khởi tạo dữ liệu mẫu thành công!");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Đã xảy ra lỗi khi khởi tạo dữ liệu mẫu.");
            throw;
        }
    }
}
