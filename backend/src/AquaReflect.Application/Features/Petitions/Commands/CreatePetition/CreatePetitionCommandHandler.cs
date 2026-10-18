using System.Security.Cryptography;
using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Common.Security;
using AquaReflect.Application.Features.Petitions.DTOs;
using AquaReflect.Domain.Entities;
using AquaReflect.Domain.Enums;
using AquaReflect.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AquaReflect.Application.Features.Petitions.Commands.CreatePetition;

public class CreatePetitionCommandHandler : IRequestHandler<CreatePetitionCommand, CreatePetitionResultDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _fileStorageService;
    private readonly ICurrentUserService _currentUserService;
    private readonly INotificationService _notificationService;
    private readonly IEmailService _emailService;
    private readonly ITurnstileService _turnstileService;
    private readonly ILogger<CreatePetitionCommandHandler> _logger;

    public CreatePetitionCommandHandler(
        IApplicationDbContext context,
        IFileStorageService fileStorageService,
        ICurrentUserService currentUserService,
        INotificationService notificationService,
        IEmailService emailService,
        ITurnstileService turnstileService,
        ILogger<CreatePetitionCommandHandler> logger)
    {
        _context = context;
        _fileStorageService = fileStorageService;
        _currentUserService = currentUserService;
        _notificationService = notificationService;
        _emailService = emailService;
        _turnstileService = turnstileService;
        _logger = logger;
    }

    public async Task<CreatePetitionResultDto> Handle(CreatePetitionCommand command, CancellationToken cancellationToken)
    {
        // 0.1. Kiểm tra bẫy Honeypot chống Bot gửi tự động
        if (!string.IsNullOrWhiteSpace(command.Honeypot))
        {
            _logger.LogWarning("Phát hiện Bot kích hoạt bẫy Honeypot với giá trị: {Honeypot}", command.Honeypot);
            throw new BadRequestException("Yêu cầu không hợp lệ. Phát hiện truy cập tự động trái phép.");
        }

        // 0.2. Xác thực Cloudflare Turnstile token chống spam
        var isCaptchaValid = await _turnstileService.VerifyTokenAsync(
            command.TurnstileToken, 
            command.ClientIp, 
            cancellationToken);

        if (!isCaptchaValid)
        {
            _logger.LogWarning("Xác thực Cloudflare Turnstile thất bại cho ClientIp: {ClientIp}", command.ClientIp);
            throw new BadRequestException("Xác thực bảo mật chống spam không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.");
        }

        // 0.3. Khử độc dữ liệu (Anti-XSS Sanitization)
        var sanitizedTitle = InputSanitizer.SanitizePlainText(command.Title);
        var sanitizedContent = InputSanitizer.SanitizeRichText(command.Content);
        var sanitizedAddressText = InputSanitizer.SanitizePlainText(command.AddressText);
        var sanitizedCitizenName = InputSanitizer.SanitizePlainText(command.CitizenName);
        var sanitizedCitizenPhone = InputSanitizer.SanitizePlainText(command.CitizenPhone);
        var sanitizedCitizenEmail = InputSanitizer.SanitizePlainText(command.CitizenEmail);
        var sanitizedCitizenIdCard = InputSanitizer.SanitizePlainText(command.CitizenIdCard);

        // 1. Kiểm tra danh mục phản ánh
        var category = await _context.PetitionCategories
            .FirstOrDefaultAsync(c => c.Id == command.CategoryId, cancellationToken);

        if (category == null || !category.IsActive)
        {
            throw new NotFoundException("Danh mục phản ánh không tồn tại hoặc đã tạm dừng tiếp nhận.");
        }

        // 2. Kiểm tra đơn vị hành chính (nếu có)
        if (command.AdministrativeUnitId.HasValue)
        {
            var unitExists = await _context.AdministrativeUnits
                .AnyAsync(u => u.Id == command.AdministrativeUnitId.Value, cancellationToken);
            if (!unitExists)
            {
                throw new NotFoundException("Đơn vị hành chính được chỉ định không tồn tại.");
            }
        }

        // 3. Xác định mức độ ưu tiên
        var priority = command.PriorityLevel ?? DeterminePriority(category.CategoryType);

        // 4. Tính toán thời hạn giải quyết SLA
        var dueDate = DateTime.UtcNow.AddHours(category.DefaultSlaHours);

        // 5. Sinh mã tra cứu duy nhất TS-yyyyMM-XXXXX
        string trackingCode;
        do
        {
            trackingCode = GenerateTrackingCode();
        } while (await _context.Petitions.AnyAsync(p => p.TrackingCode == trackingCode, cancellationToken));

        var citizenDisplayName = command.IsAnonymous
            ? "Công dân (Ẩn danh)"
            : (!string.IsNullOrWhiteSpace(sanitizedCitizenName) ? sanitizedCitizenName : "Công dân");

        // Tự động gán tọa độ fallback theo địa bàn hành chính nếu công dân chưa bật GPS
        double? lat = command.Latitude;
        double? lng = command.Longitude;

        if (!lat.HasValue || !lng.HasValue)
        {
            string? unitName = null;
            if (command.AdministrativeUnitId.HasValue)
            {
                var unit = await _context.AdministrativeUnits
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.Id == command.AdministrativeUnitId.Value, cancellationToken);
                unitName = unit?.Name;
            }

            var fallback = GetFallbackCoordinates(unitName, sanitizedAddressText);
            if (fallback.HasValue)
            {
                lat = fallback.Value.Lat;
                lng = fallback.Value.Lng;
            }
        }

        // 6. Sinh mã PIN bảo mật cho đơn vô danh (plain-text chỉ tồn tại trong bộ nhớ, KHÔNG lưu DB)
        string? accessPin = null;
        string? accessPinHash = null;
        if (command.IsAnonymous)
        {
            accessPin = GenerateAccessPin();
            accessPinHash = HashPin(accessPin);
        }

        // 7. Khởi tạo đối tượng Petition với dữ liệu đã được khử độc an toàn
        var petition = new Petition
        {
            Id = Guid.NewGuid(),
            TrackingCode = trackingCode,
            Title = sanitizedTitle,
            Content = sanitizedContent,
            AddressText = sanitizedAddressText,
            Latitude = lat,
            Longitude = lng,
            AdministrativeUnitId = command.AdministrativeUnitId,
            IsAnonymous = command.IsAnonymous,
            CitizenName = command.IsAnonymous ? "Công dân (Ẩn danh)" : sanitizedCitizenName,
            CitizenPhone = command.IsAnonymous ? null : sanitizedCitizenPhone,
            CitizenEmail = command.IsAnonymous ? null : sanitizedCitizenEmail,
            CitizenIdCard = command.IsAnonymous ? null : sanitizedCitizenIdCard,
            AccessPinHash = accessPinHash,   // Chỉ lưu bản băm
            CategoryId = category.Id,
            Status = PetitionStatus.Submitted,
            PriorityLevel = priority,
            DueDate = dueDate,
            CreatedBy = _currentUserService.UserId?.ToString() ?? citizenDisplayName
        };

        // 7. Xử lý lưu các tệp đính kèm (ảnh/video/tài liệu)
        var attachmentDtos = new List<PetitionAttachmentDto>();
        if (command.Files != null && command.Files.Count > 0)
        {
            foreach (var file in command.Files)
            {
                var uploadResult = await _fileStorageService.SaveFileAsync(file, "petitions", cancellationToken);

                var attachment = new PetitionAttachment
                {
                    Id = Guid.NewGuid(),
                    PetitionId = petition.Id,
                    FileName = uploadResult.FileName,
                    OriginalFileName = uploadResult.OriginalFileName,
                    FileUrl = uploadResult.FileUrl,
                    FileType = uploadResult.FileType,
                    MimeType = uploadResult.MimeType,
                    FileSize = uploadResult.FileSize
                };

                petition.Attachments.Add(attachment);

                attachmentDtos.Add(new PetitionAttachmentDto
                {
                    Id = attachment.Id,
                    FileName = attachment.FileName,
                    OriginalFileName = attachment.OriginalFileName,
                    FileUrl = attachment.FileUrl,
                    FileType = attachment.FileType.ToString(),
                    MimeType = attachment.MimeType,
                    FileSize = attachment.FileSize
                });
            }
        }

        // 8. Tự động ghi vết lịch sử thụ lý đầu tiên (Audit Trail)
        var initialHistory = new PetitionHistory
        {
            Id = Guid.NewGuid(),
            PetitionId = petition.Id,
            FromStatus = null,
            ToStatus = PetitionStatus.Submitted,
            Action = "Tiếp nhận hồ sơ mới",
            Note = "Người dân nộp phản ánh trực tuyến thành công qua Cổng Dịch vụ công Thủy sản.",
            PerformedByUserId = _currentUserService.UserId,
            PerformedByName = citizenDisplayName
        };

        petition.Histories.Add(initialHistory);

        // 9. Lưu vào CSDL
        _context.Petitions.Add(petition);
        await _context.SaveChangesAsync(cancellationToken);

        // 10. Bắn thông báo real-time qua SignalR tới cán bộ trực ban
        await _notificationService.NotifyNewPetitionAsync(petition, cancellationToken);

        // 11. Gửi Email biên nhận tự động nếu công dân có cung cấp địa chỉ email
        if (!string.IsNullOrWhiteSpace(petition.CitizenEmail))
        {
            await _emailService.SendPetitionReceivedEmailAsync(
                petition.CitizenEmail,
                petition.CitizenName ?? "Quý công dân",
                petition.TrackingCode,
                petition.Title,
                petition.CreatedAt,
                petition.DueDate,
                cancellationToken);
        }

        _logger.LogInformation(
            "Tiếp nhận thành công phản ánh {TrackingCode}: {Title} (SLA: {SlaHours}h, Danh mục: {Category})",
            petition.TrackingCode, petition.Title, category.DefaultSlaHours, category.Name);

        var message = petition.IsAnonymous
            ? $"Nộp phản ánh kiến nghị ẩn danh thành công! Mã hồ sơ: {petition.TrackingCode}. " +
              $"Mã PIN bảo mật chỉ hiển thị MỘT LẦN DUY NHẤT — vui lòng sao chép và lưu lại ngay. " +
              $"Quý khách cần mã PIN này để tra cứu chi tiết, bổ sung tài liệu hoặc rút đơn khi cần."
            : $"Nộp phản ánh kiến nghị thành công! Mã hồ sơ của bạn là {petition.TrackingCode}. Vui lòng lưu lại mã này để tra cứu tiến độ giải quyết.";

        return new CreatePetitionResultDto
        {
            Id = petition.Id,
            TrackingCode = petition.TrackingCode,
            Title = petition.Title,
            Status = petition.Status.ToString(),
            PriorityLevel = petition.PriorityLevel.ToString(),
            CategoryId = category.Id,
            CategoryName = category.Name,
            DefaultSlaHours = category.DefaultSlaHours,
            DueDate = petition.DueDate,
            AddressText = petition.AddressText,
            Latitude = petition.Latitude,
            Longitude = petition.Longitude,
            IsAnonymous = petition.IsAnonymous,
            CitizenName = petition.CitizenName,
            CreatedAt = petition.CreatedAt,
            AttachmentsCount = petition.Attachments.Count,
            Attachments = attachmentDtos,
            AccessPin = accessPin,   // plain-text PIN — null nếu không phải đơn vô danh
            Message = message
        };
    }

    private static PriorityLevel DeterminePriority(PetitionCategoryType categoryType)
    {
        return categoryType switch
        {
            PetitionCategoryType.IUUFishing => PriorityLevel.Urgent,
            PetitionCategoryType.AquaticDisease => PriorityLevel.Urgent,
            PetitionCategoryType.WaterPollution => PriorityLevel.High,
            _ => PriorityLevel.Normal
        };
    }

    private static string GenerateTrackingCode()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var randomPart = RandomNumberGenerator.GetString(chars, 5);
        return $"TS-{DateTime.UtcNow:yyyyMM}-{randomPart}";
    }

    /// <summary>
    /// Sinh mã PIN 8 ký tự [A-Z0-9] an toàn bằng RandomNumberGenerator (CSPRNG).
    /// Loại bỏ ký tự dễ nhầm: I, O, 0, 1.
    /// </summary>
    private static string GenerateAccessPin()
    {
        const string pinChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        return RandomNumberGenerator.GetString(pinChars, 8);
    }

    /// <summary>
    /// Băm mã PIN bằng SHA-256. Chỉ lưu bản băm này vào DB — không bao giờ lưu plain-text.
    /// </summary>
    private static string HashPin(string pin)
    {
        var bytes = System.Text.Encoding.UTF8.GetBytes(pin);
        var hash = SHA256.HashData(bytes);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private static (double Lat, double Lng)? GetFallbackCoordinates(string? unitName, string? address)
    {
        var text = $"{unitName} {address}".ToLowerInvariant();
        if (text.Contains("ngọc hiển")) return (8.4352, 104.8321);
        if (text.Contains("đầm dơi")) return (8.9712, 105.1784);
        if (text.Contains("cà mau")) return (9.1768, 105.1524);
        if (text.Contains("sông đốc") || text.Contains("trần văn thời")) return (9.0521, 104.8214);
        if (text.Contains("năm căn")) return (8.7541, 105.0215);
        if (text.Contains("u minh") || text.Contains("khánh hội")) return (9.4215, 104.9124);
        if (text.Contains("ba tri") || text.Contains("bến tre")) return (10.0416, 106.5833);
        if (text.Contains("bình sơn") || text.Contains("sa kỳ") || text.Contains("quảng ngãi")) return (15.2289, 108.8685);
        if (text.Contains("bình châu") || text.Contains("xuyên mộc") || text.Contains("vũng tàu")) return (10.5123, 107.5412);
        if (text.Contains("kiên giang") || text.Contains("phú quốc")) return (10.2289, 103.9572);
        if (text.Contains("bạc liêu")) return (9.2941, 105.7278);
        return null;
    }
}
