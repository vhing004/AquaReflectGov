using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Features.Petitions.DTOs;
using AquaReflect.Domain.Entities;
using AquaReflect.Domain.Enums;
using AquaReflect.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NetTopologySuite.Geometries;

namespace AquaReflect.Application.Features.Petitions.Commands.CreateOnBehalf;

public class CreatePetitionOnBehalfCommandHandler : IRequestHandler<CreatePetitionOnBehalfCommand, CreatePetitionResultDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _fileStorageService;
    private readonly ICurrentUserService _currentUserService;
    private readonly INotificationService _notificationService;
    private readonly IEmailService _emailService;
    private readonly IWorkingDaysService _workingDaysService;
    private readonly ILogger<CreatePetitionOnBehalfCommandHandler> _logger;

    public CreatePetitionOnBehalfCommandHandler(
        IApplicationDbContext context,
        IFileStorageService fileStorageService,
        ICurrentUserService currentUserService,
        INotificationService notificationService,
        IEmailService emailService,
        IWorkingDaysService workingDaysService,
        ILogger<CreatePetitionOnBehalfCommandHandler> logger)
    {
        _context = context;
        _fileStorageService = fileStorageService;
        _currentUserService = currentUserService;
        _notificationService = notificationService;
        _emailService = emailService;
        _workingDaysService = workingDaysService;
        _logger = logger;
    }

    public async Task<CreatePetitionResultDto> Handle(CreatePetitionOnBehalfCommand command, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra xác thực cán bộ (Kịch bản 23: chỉ Dispatcher hoặc SuperAdmin)
        if (!_currentUserService.IsAuthenticated)
            throw new UnauthorizedAccessException("Vui lòng đăng nhập để thực hiện chức năng nhập hộ hồ sơ.");

        var role = _currentUserService.Role;
        if (role != UserRole.Dispatcher && role != UserRole.SuperAdmin)
        {
            throw new ForbiddenException("Chuyên viên không có quyền nhập hộ phản ánh kiến nghị. Thao tác này chỉ dành cho Bộ phận Tiếp nhận & Phân loại hoặc Quản trị viên.");
        }

        // 2. Kịch bản 24: Bắt buộc chọn nguồn tiếp nhận (Điện thoại, Trực tiếp, Văn bản)
        if (command.ReceptionSource == ReceptionSource.Online)
        {
            throw new BadRequestException("Vui lòng nêu rõ nguồn tiếp nhận trực tiếp của hồ sơ (Điện thoại, Trực tiếp hoặc Văn bản).");
        }

        if (string.IsNullOrWhiteSpace(command.CitizenPhone))
        {
            throw new BadRequestException("Vui lòng cung cấp số điện thoại của người dân để liên hệ và tra cứu tiến độ.");
        }

        var category = await _context.PetitionCategories
            .FirstOrDefaultAsync(c => c.Id == command.CategoryId && !c.IsDeleted, cancellationToken);
        if (category == null)
            throw new NotFoundException($"Không tìm thấy danh mục phản ánh với ID: {command.CategoryId}");

        var priority = command.PriorityLevel ?? PriorityLevel.Normal;

        // Sinh mã tracking code
        var now = DateTime.UtcNow;
        var yearMonth = now.ToString("yyyyMM");
        var countThisMonth = await _context.Petitions
            .CountAsync(p => p.TrackingCode.StartsWith($"TS-{yearMonth}-"), cancellationToken);
        var sequenceNumber = (countThisMonth + 1).ToString("D5");
        var trackingCode = $"TS-{yearMonth}-{sequenceNumber}";

        Point? locationGeometry = null;
        if (command.Latitude.HasValue && command.Longitude.HasValue)
        {
            locationGeometry = new Point(command.Longitude.Value, command.Latitude.Value) { SRID = 4326 };
        }

        var dueDate = await _workingDaysService.CalculateDueDateAsync(now, priority, cancellationToken);

        var officerName = _currentUserService.Username ?? "Cán bộ tiếp nhận";
        if (_currentUserService.UserId.HasValue)
        {
            var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == _currentUserService.UserId.Value, cancellationToken);
            if (user != null && !string.IsNullOrWhiteSpace(user.FullName))
            {
                officerName = user.FullName;
            }
        }

        var sourceText = command.ReceptionSource switch
        {
            ReceptionSource.Phone => "Điện thoại / Hotline",
            ReceptionSource.InPerson => "Trực tiếp tại bộ phận Một cửa",
            ReceptionSource.Document => "Văn bản / Đơn thư giấy",
            _ => "Nội bộ"
        };

        var petition = new Petition
        {
            TrackingCode = trackingCode,
            Title = command.Title.Trim(),
            Content = command.Content.Trim(),
            CategoryId = command.CategoryId,
            AddressText = command.AddressText?.Trim() ?? string.Empty,
            Latitude = command.Latitude,
            Longitude = command.Longitude,
            LocationGeometry = locationGeometry,
            AdministrativeUnitId = command.AdministrativeUnitId,
            IsAnonymous = false,
            CitizenName = command.CitizenName.Trim(),
            CitizenPhone = command.CitizenPhone.Trim(),
            CitizenEmail = command.CitizenEmail?.Trim(),
            CitizenIdCard = command.CitizenIdCard?.Trim(),
            Status = PetitionStatus.Submitted,
            PriorityLevel = priority,
            DueDate = dueDate,
            ReceptionSource = command.ReceptionSource,
            CreatedOnBehalfByUserId = _currentUserService.UserId,
            CreatedBy = _currentUserService.Username ?? _currentUserService.UserId?.ToString()
        };

        // Xử lý tệp đính kèm (nếu có)
        if (command.Files != null && command.Files.Count > 0)
        {
            foreach (var file in command.Files)
            {
                var saveResult = await _fileStorageService.SaveFileAsync(file, "petitions", cancellationToken);

                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                var attachmentType = ext is ".jpg" or ".jpeg" or ".png" or ".webp" or ".gif"
                    ? AttachmentType.Image
                    : (ext is ".mp4" or ".mov" or ".avi" ? AttachmentType.Video : AttachmentType.Document);

                petition.Attachments.Add(new PetitionAttachment
                {
                    FileName = saveResult.FileName,
                    OriginalFileName = file.FileName,
                    FileUrl = saveResult.FileUrl,
                    FileType = attachmentType,
                    MimeType = file.ContentType,
                    FileSize = file.Length
                });
            }
        }

        // Ghi nhận Audit Trail
        var history = new PetitionHistory
        {
            Id = Guid.NewGuid(),
            PetitionId = petition.Id,
            FromStatus = null,
            ToStatus = PetitionStatus.Submitted,
            Action = "Tiếp nhận hộ phản ánh",
            Note = $"Cán bộ {officerName} nhập hộ phản ánh qua nguồn: {sourceText}.",
            PerformedByUserId = _currentUserService.UserId,
            PerformedByName = officerName,
            CreatedAt = DateTime.UtcNow
        };

        petition.Histories.Add(history);
        _context.Petitions.Add(petition);
        await _context.SaveChangesAsync(cancellationToken);

        // Bắn thông báo real-time qua SignalR
        await _notificationService.NotifyNewPetitionAsync(petition, cancellationToken);

        // Gửi email nếu công dân có cung cấp email
        if (!string.IsNullOrWhiteSpace(petition.CitizenEmail))
        {
            await _emailService.SendPetitionReceivedEmailAsync(
                petition.CitizenEmail,
                petition.CitizenName,
                petition.TrackingCode,
                petition.Title,
                petition.CreatedAt,
                petition.DueDate,
                cancellationToken);
        }

        _logger.LogInformation(
            "Cán bộ {Officer} đã nhập hộ thành công hồ sơ {TrackingCode} (Nguồn: {Source})",
            officerName, petition.TrackingCode, sourceText);

        return new CreatePetitionResultDto
        {
            Id = petition.Id,
            TrackingCode = petition.TrackingCode,
            Title = petition.Title,
            Status = petition.Status.ToString(),
            DueDate = petition.DueDate,
            Message = $"Nhập hộ hồ sơ phản ánh thành công! Mã biên nhận: {petition.TrackingCode}."
        };
    }
}
