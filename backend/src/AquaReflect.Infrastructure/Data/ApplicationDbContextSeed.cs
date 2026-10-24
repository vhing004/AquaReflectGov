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
            // 0. Tự động áp dụng EF Core Migrations nếu database mới được tạo (chỉ dành cho CSDL Relational)
            if (context.Database.IsRelational())
            {
                await context.Database.MigrateAsync();
            }

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

            // Bổ sung đầy đủ 28 tỉnh/thành phố ven biển Việt Nam nếu cơ sở dữ liệu còn thiếu
            var existingCodes = await context.AdministrativeUnits.Where(u => u.Level == 1).Select(u => u.Code).ToListAsync();
            var coastalProvincesToAdd = new List<AdministrativeUnit>();

            var allCoastals = new (string Code, string Name, string EnglishName)[]
            {
                ("QNG", "Tỉnh Quảng Ngãi (Trọng điểm)", "Quang Ngai Province"),
                ("DNG", "Thành phố Đà Nẵng", "Da Nang City"),
                ("QNA", "Tỉnh Quảng Nam", "Quang Nam Province"),
                ("BDH", "Tỉnh Bình Định", "Binh Dinh Province"),
                ("PYE", "Tỉnh Phú Yên", "Phu Yen Province"),
                ("KHA", "Tỉnh Khánh Hòa", "Khanh Hoa Province"),
                ("NTH", "Tỉnh Ninh Thuận", "Ninh Thuan Province"),
                ("BTH", "Tỉnh Bình Thuận", "Binh Thuan Province"),
                ("QNI", "Tỉnh Quảng Ninh", "Quang Ninh Province"),
                ("HPH", "Thành phố Hải Phòng", "Hai Phong City"),
                ("TBH", "Tỉnh Thái Bình", "Thai Binh Province"),
                ("NDH", "Tỉnh Nam Định", "Nam Dinh Province"),
                ("NBH", "Tỉnh Ninh Bình", "Ninh Binh Province"),
                ("THA", "Tỉnh Thanh Hóa", "Thanh Hoa Province"),
                ("NAN", "Tỉnh Nghệ An", "Nghe An Province"),
                ("HTI", "Tỉnh Hà Tĩnh", "Ha Tinh Province"),
                ("QBH", "Tỉnh Quảng Bình", "Quang Binh Province"),
                ("QTR", "Tỉnh Quảng Trị", "Quang Tri Province"),
                ("TTH", "Tỉnh Thừa Thiên Huế", "Thua Thien Hue Province"),
                ("BRV", "Tỉnh Bà Rịa - Vũng Tàu", "Ba Ria - Vung Tau Province"),
                ("HCM", "Thành phố Hồ Chí Minh (Cần Giờ)", "Ho Chi Minh City"),
                ("TGI", "Tỉnh Tiền Giang", "Tien Giang Province"),
                ("TVH", "Tỉnh Trà Vinh", "Tra Vinh Province"),
                ("STR", "Tỉnh Sóc Trăng", "Soc Trang Province"),
                ("BLI", "Tỉnh Bạc Liêu", "Bac Lieu Province"),
            };

            foreach (var (code, name, engName) in allCoastals)
            {
                if (!existingCodes.Contains(code))
                {
                    coastalProvincesToAdd.Add(new AdministrativeUnit
                    {
                        Code = code,
                        Name = name,
                        EnglishName = engName,
                        Level = 1
                    });
                }
            }

            if (coastalProvincesToAdd.Count > 0)
            {
                logger.LogInformation("Bổ sung {Count} tỉnh/thành phố ven biển còn thiếu vào cơ sở dữ liệu...", coastalProvincesToAdd.Count);
                context.AdministrativeUnits.AddRange(coastalProvincesToAdd);
                await context.SaveChangesAsync();
            }

            // 2. Seed Phòng ban / Cơ quan thụ lý
            logger.LogInformation("Kiểm tra và khởi tạo dữ liệu mẫu Phòng ban / Cơ quan chuyên môn...");

            var existingDepts = await context.Departments.ToListAsync();
            var deptsToAdd = new List<Department>();

            var defaultDepts = new (string Code, string Name, string Phone, string Email, string Address)[]
            {
                ("SNNPTNT", "Sở Nông nghiệp & Phát triển Nông thôn", "0290.3831234", "snnptnt@camau.gov.vn", "Số 02, Đường Hùng Vương, TP Cà Mau"),
                ("CCTS", "Chi cục Thủy sản", "0290.3835678", "chicutthuysan@camau.gov.vn", "Số 15, Đường Lý Thường Kiệt, TP Cà Mau"),
                ("TTKN", "Đội Thanh tra Chuyên ngành Thủy sản - Kiểm ngư", "0290.3839999", "kiemngu@camau.gov.vn", "Cảng cá Sông Đốc, Huyện Trần Văn Thời"),
                ("PNTTS", "Phòng Nuôi trồng Thủy sản", "0290.3837777", "nuoitrong@camau.gov.vn", "Chi cục Thủy sản Cà Mau"),
                ("QLMT", "Đội Quản lý Môi trường Nước", "0290.3836666", "moitruong@camau.gov.vn", "Số 15, Đường Lý Thường Kiệt, TP Cà Mau"),
                ("QLCL", "Đội Quản lý Chất lượng Giống & Thức ăn", "0290.3835555", "chatluong@camau.gov.vn", "Số 15, Đường Lý Thường Kiệt, TP Cà Mau"),
                ("HTCC", "Đội Hạ tầng Cảng cá & Luồng lạch", "0290.3834444", "hatang@camau.gov.vn", "Cảng cá Sông Đốc, Huyện Trần Văn Thời")
            };

            foreach (var (code, name, phone, email, addr) in defaultDepts)
            {
                var existing = existingDepts.FirstOrDefault(d => d.Code == code);
                if (existing == null)
                {
                    var newDept = new Department
                    {
                        Code = code,
                        Name = name,
                        Phone = phone,
                        Email = email,
                        Address = addr,
                        IsActive = true
                    };
                    deptsToAdd.Add(newDept);
                }
            }

            if (deptsToAdd.Count > 0)
            {
                context.Departments.AddRange(deptsToAdd);
                await context.SaveChangesAsync();
                existingDepts = await context.Departments.ToListAsync();
            }

            var ccts = existingDepts.FirstOrDefault(d => d.Code == "CCTS");
            var ttkn = existingDepts.FirstOrDefault(d => d.Code == "TTKN");
            var pntts = existingDepts.FirstOrDefault(d => d.Code == "PNTTS");
            var qlmt = existingDepts.FirstOrDefault(d => d.Code == "QLMT");
            var qlcl = existingDepts.FirstOrDefault(d => d.Code == "QLCL");
            var htcc = existingDepts.FirstOrDefault(d => d.Code == "HTCC");

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
            logger.LogInformation("Kiểm tra và khởi tạo các tài khoản người dùng mẫu (15 cán bộ 5 đơn vị + điều phối + công dân)...");

            var adminPass = passwordHasher.HashPassword("Admin@123");
            var canboPass = passwordHasher.HashPassword("Canbo@123");
            var danPass = passwordHasher.HashPassword("Dan@123");

            var existingUsers = await context.Users.ToListAsync();
            var usersToAdd = new List<User>();

            void EnsureUser(string username, string fullName, string email, string phone, UserRole role, bool isUnitLead, Guid? deptId, (string Hash, string Salt) pass)
            {
                if (!existingUsers.Any(u => u.Username.Equals(username, StringComparison.OrdinalIgnoreCase)))
                {
                    usersToAdd.Add(new User
                    {
                        Username = username,
                        FullName = fullName,
                        Email = email,
                        PhoneNumber = phone,
                        Role = role,
                        IsUnitLead = isUnitLead,
                        DepartmentId = deptId,
                        PasswordHash = pass.Hash,
                        PasswordSalt = pass.Salt,
                        IsActive = true
                    });
                }
            }

            // Quản trị viên & Điều phối viên CCTS
            EnsureUser("admin", "Quản trị viên Hệ thống", "admin@aquareflect.gov.vn", "0901234567", UserRole.SuperAdmin, false, null, adminPass);
            EnsureUser("diepphoi", "Trần Thị Mai (Cán bộ Tiếp nhận CCTS)", "tiepnhan@aquareflect.gov.vn", "0902345678", UserRole.Dispatcher, false, ccts?.Id, canboPass);

            // Đơn vị 1: TTKN - Đội Thanh tra Chuyên ngành Thủy sản - Kiểm ngư
            EnsureUser("kiemngu", "Lê Hoàng Long (Đội trưởng Thanh tra Kiểm ngư)", "kiemngu@aquareflect.gov.vn", "0903456789", UserRole.Specialist, true, ttkn?.Id, canboPass);
            EnsureUser("kiemngu_cb", "Nguyễn Văn Thụ (Cán bộ Kiểm ngư địa bàn)", "kiemngu_cb@aquareflect.gov.vn", "0903456780", UserRole.Specialist, false, ttkn?.Id, canboPass);
            EnsureUser("kiemngu_cb2", "Trần Minh Tuấn (Cán bộ Kiểm ngư tuần tra)", "kiemngu_cb2@aquareflect.gov.vn", "0903456781", UserRole.Specialist, false, ttkn?.Id, canboPass);

            // Đơn vị 2: PNTTS - Phòng Nuôi trồng Thủy sản
            EnsureUser("nuoitrong_lead", "Phạm Thị Hoa (Trưởng phòng Nuôi trồng Thủy sản)", "nuoitrong_lead@aquareflect.gov.vn", "0904123001", UserRole.Specialist, true, pntts?.Id, canboPass);
            EnsureUser("nuoitrong_cb1", "Bùi Văn An (Cán bộ Thụ lý Nuôi trồng 1)", "nuoitrong_cb1@aquareflect.gov.vn", "0904123002", UserRole.Specialist, false, pntts?.Id, canboPass);
            EnsureUser("nuoitrong_cb2", "Lê Thị Lan (Cán bộ Thụ lý Nuôi trồng 2)", "nuoitrong_cb2@aquareflect.gov.vn", "0904123003", UserRole.Specialist, false, pntts?.Id, canboPass);

            // Đơn vị 3: QLMT - Đội Quản lý Môi trường Nước
            EnsureUser("moitruong_lead", "Ngô Quang Minh (Đội trưởng Quản lý Môi trường Nước)", "moitruong_lead@aquareflect.gov.vn", "0905123001", UserRole.Specialist, true, qlmt?.Id, canboPass);
            EnsureUser("moitruong_cb1", "Trần Thị Ngọc (Cán bộ Quan trắc Môi trường 1)", "moitruong_cb1@aquareflect.gov.vn", "0905123002", UserRole.Specialist, false, qlmt?.Id, canboPass);
            EnsureUser("moitruong_cb2", "Phạm Văn Dũng (Cán bộ Giám sát Xả thải 2)", "moitruong_cb2@aquareflect.gov.vn", "0905123003", UserRole.Specialist, false, qlmt?.Id, canboPass);

            // Đơn vị 4: QLCL - Đội Quản lý Chất lượng Giống & Thức ăn
            EnsureUser("chatluong_lead", "Huỳnh Thị Thu (Đội trưởng Quản lý Chất lượng Giống & Thức ăn)", "chatluong_lead@aquareflect.gov.vn", "0906123001", UserRole.Specialist, true, qlcl?.Id, canboPass);
            EnsureUser("chatluong_cb1", "Nguyễn Minh Khải (Cán bộ Kiểm định Chất lượng 1)", "chatluong_cb1@aquareflect.gov.vn", "0906123002", UserRole.Specialist, false, qlcl?.Id, canboPass);
            EnsureUser("chatluong_cb2", "Lê Văn Bình (Cán bộ Kiểm tra Thú y Thủy sản 2)", "chatluong_cb2@aquareflect.gov.vn", "0906123003", UserRole.Specialist, false, qlcl?.Id, canboPass);

            // Đơn vị 5: HTCC - Đội Hạ tầng Cảng cá & Luồng lạch
            EnsureUser("hatang_lead", "Đặng Văn Hùng (Đội trưởng Hạ tầng Cảng cá & Luồng lạch)", "hatang_lead@aquareflect.gov.vn", "0907123001", UserRole.Specialist, true, htcc?.Id, canboPass);
            EnsureUser("hatang_cb1", "Võ Thị Phương (Cán bộ Quản lý Bến bãi Neo đậu 1)", "hatang_cb1@aquareflect.gov.vn", "0907123002", UserRole.Specialist, false, htcc?.Id, canboPass);
            EnsureUser("hatang_cb2", "Trần Văn Khánh (Cán bộ Giám sát Cửa biển & Luồng tàu 2)", "hatang_cb2@aquareflect.gov.vn", "0907123003", UserRole.Specialist, false, htcc?.Id, canboPass);

            // Người dân mẫu
            EnsureUser("ngudan", "Nguyễn Văn Ngư (Hộ nuôi tôm Đất Mũi)", "ngudan@gmail.com", "0909888999", UserRole.Citizen, false, null, danPass);

            if (usersToAdd.Count > 0)
            {
                context.Users.AddRange(usersToAdd);
                await context.SaveChangesAsync();
                logger.LogInformation("Đã khởi tạo bổ sung {Count} tài khoản người dùng mẫu.", usersToAdd.Count);
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

            // 8. Seed Cấu hình Hệ thống (SystemSettings)
            if (!await context.SystemSettings.AnyAsync())
            {
                logger.LogInformation("Đang khởi tạo cấu hình hệ thống mặc định...");
                var defaultSettings = new List<SystemSetting>
                {
                    new() { Key = "SLA_Urgent_Days", Value = "2", GroupName = "SLA", Description = "Thời hạn xử lý hồ sơ mức độ Khẩn cấp (ngày làm việc)" },
                    new() { Key = "SLA_High_Days", Value = "5", GroupName = "SLA", Description = "Thời hạn xử lý hồ sơ mức độ Cao (ngày làm việc)" },
                    new() { Key = "SLA_Normal_Days", Value = "10", GroupName = "SLA", Description = "Thời hạn xử lý hồ sơ mức độ Bình thường (ngày làm việc)" },
                    new() { Key = "Workflow_NeedInfo_Days", Value = "7", GroupName = "Workflow", Description = "Thời hạn tối đa để người dân bổ sung thông tin hồ sơ (ngày làm việc)" },
                    new() { Key = "Workflow_Max_NeedInfo_Count", Value = "2", GroupName = "Workflow", Description = "Số lần tối đa cán bộ được yêu cầu người dân bổ sung thông tin" },
                    new() { Key = "Workflow_Auto_Close_Days", Value = "5", GroupName = "Workflow", Description = "Thời hạn tự động đóng hồ sơ nếu Dispatcher không thao tác duyệt (ngày làm việc)" },
                    new() { Key = "Workflow_Csat_Window_Days", Value = "14", GroupName = "Workflow", Description = "Thời hạn người dân có thể đánh giá CSAT hoặc đề nghị xem xét lại sau khi đóng đơn (ngày)" },
                    new() { Key = "Workflow_Max_Reopen_Count", Value = "1", GroupName = "Workflow", Description = "Số lần tối đa hồ sơ được phép mở lại sau khi công dân không hài lòng (CSAT <= 2)" },
                    new() { Key = "Security_Daily_Rate_Limit_Per_Ip", Value = "10", GroupName = "Security", Description = "Giới hạn số đơn tối đa có thể nộp từ cùng một IP/thiết bị mỗi ngày" }
                };

                context.SystemSettings.AddRange(defaultSettings);
                await context.SaveChangesAsync();
                logger.LogInformation("Khởi tạo 09 cấu hình hệ thống thành công!");
            }

            // 9. Seed Lịch Nghỉ lễ Việt Nam (HolidayCalendars)
            if (!await context.HolidayCalendars.AnyAsync())
            {
                logger.LogInformation("Đang khởi tạo danh mục ngày nghỉ lễ Việt Nam...");
                var holidays = new List<HolidayCalendar>
                {
                    // Năm 2026
                    new() { HolidayDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), Year = 2026, Description = "Tết Dương lịch 2026", IsRecurringSolar = true },
                    new() { HolidayDate = new DateTime(2026, 2, 14, 0, 0, 0, DateTimeKind.Utc), Year = 2026, Description = "Tết Nguyên đán Bính Ngọ 2026 (Nghỉ bù)" },
                    new() { HolidayDate = new DateTime(2026, 2, 15, 0, 0, 0, DateTimeKind.Utc), Year = 2026, Description = "Tết Nguyên đán Bính Ngọ 2026 (Nghỉ bù)" },
                    new() { HolidayDate = new DateTime(2026, 2, 16, 0, 0, 0, DateTimeKind.Utc), Year = 2026, Description = "Tết Nguyên đán Bính Ngọ 2026 (29 Tết)" },
                    new() { HolidayDate = new DateTime(2026, 2, 17, 0, 0, 0, DateTimeKind.Utc), Year = 2026, Description = "Tết Nguyên đán Bính Ngọ 2026 (Mùng 1 Tết)" },
                    new() { HolidayDate = new DateTime(2026, 2, 18, 0, 0, 0, DateTimeKind.Utc), Year = 2026, Description = "Tết Nguyên đán Bính Ngọ 2026 (Mùng 2 Tết)" },
                    new() { HolidayDate = new DateTime(2026, 2, 19, 0, 0, 0, DateTimeKind.Utc), Year = 2026, Description = "Tết Nguyên đán Bính Ngọ 2026 (Mùng 3 Tết)" },
                    new() { HolidayDate = new DateTime(2026, 2, 20, 0, 0, 0, DateTimeKind.Utc), Year = 2026, Description = "Tết Nguyên đán Bính Ngọ 2026 (Mùng 4 Tết)" },
                    new() { HolidayDate = new DateTime(2026, 4, 26, 0, 0, 0, DateTimeKind.Utc), Year = 2026, Description = "Giỗ tổ Hùng Vương (10/03 Âm lịch)" },
                    new() { HolidayDate = new DateTime(2026, 4, 30, 0, 0, 0, DateTimeKind.Utc), Year = 2026, Description = "Ngày Giải phóng Miền Nam", IsRecurringSolar = true },
                    new() { HolidayDate = new DateTime(2026, 5, 1, 0, 0, 0, DateTimeKind.Utc), Year = 2026, Description = "Ngày Quốc tế Lao động", IsRecurringSolar = true },
                    new() { HolidayDate = new DateTime(2026, 9, 2, 0, 0, 0, DateTimeKind.Utc), Year = 2026, Description = "Ngày Quốc khánh", IsRecurringSolar = true },
                    new() { HolidayDate = new DateTime(2026, 9, 3, 0, 0, 0, DateTimeKind.Utc), Year = 2026, Description = "Nghỉ liền kề Quốc khánh", IsRecurringSolar = true }
                };

                context.HolidayCalendars.AddRange(holidays);
                await context.SaveChangesAsync();
                logger.LogInformation("Khởi tạo 13 ngày nghỉ lễ Việt Nam năm 2026 thành công!");
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
