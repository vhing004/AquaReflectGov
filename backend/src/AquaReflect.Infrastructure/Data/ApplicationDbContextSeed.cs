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

            // 5. Seed Các phản ánh kiến nghị mẫu có tọa độ GPS thực địa tại Cà Mau
            if (await context.Petitions.CountAsync() < 5)
            {
                logger.LogInformation("Đang bổ sung các phản ánh kiến nghị mẫu kèm tọa độ GPS tại Cà Mau...");

                var iuuCat = await context.PetitionCategories.FirstOrDefaultAsync(c => c.CategoryType == PetitionCategoryType.IUUFishing);
                var diseaseCat = await context.PetitionCategories.FirstOrDefaultAsync(c => c.CategoryType == PetitionCategoryType.AquaticDisease);
                var pollutionCat = await context.PetitionCategories.FirstOrDefaultAsync(c => c.CategoryType == PetitionCategoryType.WaterPollution);
                var infraCat = await context.PetitionCategories.FirstOrDefaultAsync(c => c.CategoryType == PetitionCategoryType.FisheryInfrastructure);
                var seedFeedCat = await context.PetitionCategories.FirstOrDefaultAsync(c => c.CategoryType == PetitionCategoryType.SeedAndFeedQuality);

                var ttknDept = await context.Departments.FirstOrDefaultAsync(d => d.Code == "TTKN");
                var cctsDept = await context.Departments.FirstOrDefaultAsync(d => d.Code == "CCTS");
                var ntsDept = await context.Departments.FirstOrDefaultAsync(d => d.Code == "CCNTTS");

                var specialistUser = await context.Users.FirstOrDefaultAsync(u => u.Username == "kiemngu");

                // Lấy đơn vị hành chính cấp huyện của Cà Mau
                var ngocHien = await context.AdministrativeUnits.FirstOrDefaultAsync(u => u.Name.Contains("Ngọc Hiển"));
                var damDoi = await context.AdministrativeUnits.FirstOrDefaultAsync(u => u.Name.Contains("Đầm Dơi"));
                var tpCaMau = await context.AdministrativeUnits.FirstOrDefaultAsync(u => u.Name.Contains("Cà Mau"));
                var tranVanThoi = await context.AdministrativeUnits.FirstOrDefaultAsync(u => u.Name.Contains("Trần Văn Thời"));
                var namCan = await context.AdministrativeUnits.FirstOrDefaultAsync(u => u.Name.Contains("Năm Căn"));
                var uMinh = await context.AdministrativeUnits.FirstOrDefaultAsync(u => u.Name.Contains("U Minh"));

                var samplePetitions = new List<Petition>
                {
                    new()
                    {
                        Id = Guid.NewGuid(),
                        TrackingCode = "TS-202609-HONK1",
                        Title = "Tàu cá cào bay hủy diệt nguồn lợi ven bờ khu bảo tồn biển Hòn Khoai",
                        Content = "Phát hiện 02 cặp tàu cá công suất lớn đang sử dụng cào bay cào sát đáy biển, cách bờ Hòn Khoai khoảng 3 hải lý, làm hư hỏng nhiều bẫy mực của ngư dân địa phương.",
                        Latitude = 8.4352,
                        Longitude = 104.8321,
                        AddressText = "Vùng biển Hòn Khoai, Xã Tân Ân, Huyện Ngọc Hiển, Cà Mau",
                        AdministrativeUnitId = ngocHien?.Id,
                        CitizenName = "Nguyễn Văn Hải",
                        CitizenPhone = "0918112233",
                        CitizenEmail = "nguyenhai.camaubien@gmail.com",
                        Status = PetitionStatus.Investigating,
                        PriorityLevel = PriorityLevel.Urgent,
                        CategoryId = iuuCat?.Id ?? Guid.NewGuid(),
                        DepartmentId = ttknDept?.Id,
                        AssignedUserId = specialistUser?.Id,
                        DueDate = DateTime.UtcNow.AddHours(12),
                        CreatedAt = DateTime.UtcNow.AddHours(-18),
                        CreatedBy = "Nguyễn Văn Hải"
                    },
                    new()
                    {
                        Id = Guid.NewGuid(),
                        TrackingCode = "TS-202609-DAMD2",
                        Title = "Ổ dịch đốm trắng lây lan trên 15ha đầm nuôi tôm quảng canh cải tiến",
                        Content = "Tôm sú nuôi được 45 ngày tuổi xuất hiện nhiều đốm trắng li ti trên vỏ đầu ngực, chết chìm đáy ao hàng loạt. Nguy cơ lây lan sang các hộ liền kề.",
                        Latitude = 8.9712,
                        Longitude = 105.1784,
                        AddressText = "Ấp Tân Long, Xã Tân Duyệt, Huyện Đầm Dơi, Cà Mau",
                        AdministrativeUnitId = damDoi?.Id,
                        CitizenName = "Trần Thanh Bình",
                        CitizenPhone = "0949223344",
                        CitizenEmail = "thanhbinh.damdoi@gmail.com",
                        Status = PetitionStatus.Assigned,
                        PriorityLevel = PriorityLevel.Urgent,
                        CategoryId = diseaseCat?.Id ?? Guid.NewGuid(),
                        DepartmentId = ntsDept?.Id,
                        DueDate = DateTime.UtcNow.AddHours(20),
                        CreatedAt = DateTime.UtcNow.AddHours(-4),
                        CreatedBy = "Trần Thanh Bình"
                    },
                    new()
                    {
                        Id = Guid.NewGuid(),
                        TrackingCode = "TS-202609-CAMAU3",
                        Title = "Xả nước thải đen nồng nặc trực tiếp ra kênh xáng Cà Mau - Bạc Liêu",
                        Content = "Cơ sở chế biến bột cá xả dòng nước đen hôi thối vào ban đêm khi triều rút, làm chết hàng loạt cá tự nhiên trên tuyến kênh nội đồng.",
                        Latitude = 9.1768,
                        Longitude = 105.1524,
                        AddressText = "Khóm 6, Phường 8, Thành phố Cà Mau, Tỉnh Cà Mau",
                        AdministrativeUnitId = tpCaMau?.Id,
                        CitizenName = "Lê Thị Cẩm",
                        CitizenPhone = "0908334455",
                        CitizenEmail = "camle.cm@yahoo.com",
                        Status = PetitionStatus.Submitted,
                        PriorityLevel = PriorityLevel.High,
                        CategoryId = pollutionCat?.Id ?? Guid.NewGuid(),
                        DueDate = DateTime.UtcNow.AddHours(40),
                        CreatedAt = DateTime.UtcNow.AddHours(-8),
                        CreatedBy = "Lê Thị Cẩm"
                    },
                    new()
                    {
                        Id = Guid.NewGuid(),
                        TrackingCode = "TS-202609-SONGD4",
                        Title = "Cửa biển Sông Đốc bị cồn cát bồi lắng cạn 1.2m lúc triều kiệt",
                        Content = "Luồng tàu chạy ra vào cảng cá Sông Đốc bị cạn nghiêm trọng, nhiều tàu cá đầy ắp hải sản phải nằm ngoài phao số 0 chờ nước lớn mới vào bến được.",
                        Latitude = 9.0521,
                        Longitude = 104.8214,
                        AddressText = "Cửa biển Sông Đốc, Thị trấn Sông Đốc, Huyện Trần Văn Thời, Cà Mau",
                        AdministrativeUnitId = tranVanThoi?.Id,
                        CitizenName = "Võ Văn Tâm",
                        CitizenPhone = "0939556677",
                        CitizenEmail = "tamvo.songdoc@gmail.com",
                        Status = PetitionStatus.Resolved,
                        PriorityLevel = PriorityLevel.Normal,
                        CategoryId = infraCat?.Id ?? Guid.NewGuid(),
                        DepartmentId = cctsDept?.Id,
                        DueDate = DateTime.UtcNow.AddDays(3),
                        ResolvedAt = DateTime.UtcNow.AddHours(-2),
                        ResolutionSummary = "Sở Giao thông Vận tải phối hợp Sở Nông nghiệp đã phê duyệt phương án nạo vét luồng lạch thông tuyến khẩn cấp bằng ngân sách phòng chống thiên tai.",
                        CreatedAt = DateTime.UtcNow.AddDays(-2),
                        CreatedBy = "Võ Văn Tâm"
                    },
                    new()
                    {
                        Id = Guid.NewGuid(),
                        TrackingCode = "TS-202609-NAMC5",
                        Title = "Đại lý bán tôm giống trôi nổi không giấy kiểm dịch thú y",
                        Content = "Một số hộ dân mua phải giống tôm thẻ chân trắng không rõ xuất xứ tại chợ Năm Căn, sau khi thả giống 5 ngày thì tôm hao hụt trên 80%.",
                        Latitude = 8.7541,
                        Longitude = 105.0215,
                        AddressText = "Khóm 1, Thị trấn Năm Căn, Huyện Năm Căn, Cà Mau",
                        AdministrativeUnitId = namCan?.Id,
                        CitizenName = "Huỳnh Tấn Phát",
                        CitizenPhone = "0977665544",
                        Status = PetitionStatus.Submitted,
                        PriorityLevel = PriorityLevel.Normal,
                        CategoryId = seedFeedCat?.Id ?? Guid.NewGuid(),
                        DueDate = DateTime.UtcNow.AddHours(60),
                        CreatedAt = DateTime.UtcNow.AddHours(-12),
                        CreatedBy = "Huỳnh Tấn Phát"
                    },
                    new()
                    {
                        Id = Guid.NewGuid(),
                        TrackingCode = "TS-202609-UMINH6",
                        Title = "Tàu giã cào đôi xung điện hoạt động ban đêm tại bờ biển U Minh",
                        Content = "Khoảng 23h đêm thường xuất hiện 3-4 cặp tàu vỏ sắt dùng lưới cào gắn dây điện rà quét sát bờ biển ven rừng phòng hộ U Minh Hạ, làm cạn kiệt cá tôm giống.",
                        Latitude = 9.4215,
                        Longitude = 104.9124,
                        AddressText = "Khu vực Bờ kè chống sạt lở Xã Khánh Hội, Huyện U Minh, Cà Mau",
                        AdministrativeUnitId = uMinh?.Id,
                        CitizenName = "Nguyễn Hoàng Minh",
                        CitizenPhone = "0988776655",
                        CitizenEmail = "hoangminh.uminh@gmail.com",
                        Status = PetitionStatus.Investigating,
                        PriorityLevel = PriorityLevel.Urgent,
                        CategoryId = iuuCat?.Id ?? Guid.NewGuid(),
                        DepartmentId = ttknDept?.Id,
                        AssignedUserId = specialistUser?.Id,
                        DueDate = DateTime.UtcNow.AddHours(6),
                        CreatedAt = DateTime.UtcNow.AddHours(-15),
                        CreatedBy = "Nguyễn Hoàng Minh"
                    }
                };

                context.Petitions.AddRange(samplePetitions);
                await context.SaveChangesAsync();
                logger.LogInformation("Khởi tạo 06 phản ánh kiến nghị mẫu kèm tọa độ GPS thành công!");
            }

            // 7. Seed Đánh giá mức độ hài lòng của công dân (CitizenFeedback)
            if (!await context.CitizenFeedbacks.AnyAsync())
            {
                var resolvedPetition = await context.Petitions.FirstOrDefaultAsync(p => p.Status == PetitionStatus.Resolved);
                if (resolvedPetition != null)
                {
                    var feedback = new CitizenFeedback
                    {
                        Id = Guid.NewGuid(),
                        PetitionId = resolvedPetition.Id,
                        Rating = 5,
                        Comment = "Cán bộ Chi cục Thủy sản phản hồi rất nhanh và có phương án nạo vét luồng lạch kịp thời cho bà con ngư dân. Rất cảm ơn!",
                        FeedbackAt = DateTime.UtcNow.AddHours(-1)
                    };
                    context.CitizenFeedbacks.Add(feedback);
                    await context.SaveChangesAsync();
                    logger.LogInformation("Khởi tạo đánh giá hài lòng mẫu thành công!");
                }
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
