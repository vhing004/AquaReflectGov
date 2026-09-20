using System.Security.Cryptography;
using AquaReflect.Application.Common.Interfaces;
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
    private readonly ILogger<CreatePetitionCommandHandler> _logger;

    public CreatePetitionCommandHandler(
        IApplicationDbContext context,
        IFileStorageService fileStorageService,
        ICurrentUserService currentUserService,
        INotificationService notificationService,
        IEmailService emailService,
        ILogger<CreatePetitionCommandHandler> logger)
    {
        _context = context;
        _fileStorageService = fileStorageService;
        _currentUserService = currentUserService;
        _notificationService = notificationService;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<CreatePetitionResultDto> Handle(CreatePetitionCommand command, CancellationToken cancellationToken)
    {
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
            : (command.CitizenName?.Trim() ?? "Công dân");

        // 6. Khởi tạo đối tượng Petition
        var petition = new Petition
        {
            Id = Guid.NewGuid(),
            TrackingCode = trackingCode,
            Title = command.Title.Trim(),
            Content = command.Content.Trim(),
            AddressText = command.AddressText?.Trim() ?? string.Empty,
            Latitude = command.Latitude,
            Longitude = command.Longitude,
            AdministrativeUnitId = command.AdministrativeUnitId,
            IsAnonymous = command.IsAnonymous,
            CitizenName = command.IsAnonymous ? "Công dân (Ẩn danh)" : command.CitizenName?.Trim(),
            CitizenPhone = command.IsAnonymous ? null : command.CitizenPhone?.Trim(),
            CitizenEmail = command.IsAnonymous ? null : command.CitizenEmail?.Trim(),
            CitizenIdCard = command.IsAnonymous ? null : command.CitizenIdCard?.Trim(),
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
            Message = $"Nộp phản ánh kiến nghị thành công! Mã hồ sơ của bạn là {petition.TrackingCode}. Vui lòng lưu lại mã này để tra cứu tiến độ giải quyết."
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
}
