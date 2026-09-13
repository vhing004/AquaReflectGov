using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Features.Petitions.DTOs;
using AquaReflect.Domain.Entities;
using AquaReflect.Domain.Enums;
using AquaReflect.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Application.Features.Petitions.Queries.TrackPetitionByCode;

public class TrackPetitionByCodeQueryHandler : IRequestHandler<TrackPetitionByCodeQuery, PetitionTrackingDto>
{
    private readonly IApplicationDbContext _context;

    public TrackPetitionByCodeQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PetitionTrackingDto> Handle(TrackPetitionByCodeQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.TrackingCode))
        {
            throw new BadRequestException("Mã hồ sơ tra cứu không được để trống.");
        }

        var normalizedCode = request.TrackingCode.Trim().ToUpperInvariant();
        // Hỗ trợ người dùng nhập cả tiền tố '#' (ví dụ #TS-2026-...)
        if (normalizedCode.StartsWith('#'))
        {
            normalizedCode = normalizedCode.TrimStart('#');
        }

        var petition = await _context.Petitions
            .Include(p => p.Category)
            .Include(p => p.Department)
            .Include(p => p.AdministrativeUnit)
            .Include(p => p.AssignedUser)
            .Include(p => p.Attachments.Where(a => !a.IsDeleted))
            .Include(p => p.Histories.Where(h => !h.IsDeleted))
            .Include(p => p.Resolution)
                .ThenInclude(r => r!.ApprovedByUser)
            .Include(p => p.Feedback)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.TrackingCode == normalizedCode && !p.IsDeleted, cancellationToken);

        if (petition == null)
        {
            throw new NotFoundException($"Không tìm thấy hồ sơ phản ánh với mã tra cứu '{request.TrackingCode}'. Vui lòng kiểm tra lại tính chính xác của mã hồ sơ.");
        }

        // Nếu người dùng cung cấp số điện thoại để xác thực bảo mật
        if (!string.IsNullOrWhiteSpace(request.PhoneNumber) && !string.IsNullOrWhiteSpace(petition.CitizenPhone))
        {
            var searchPhone = request.PhoneNumber.Trim().Replace(" ", "").Replace(".", "").Replace("-", "");
            var recordPhone = petition.CitizenPhone.Trim().Replace(" ", "").Replace(".", "").Replace("-", "");

            if (!recordPhone.EndsWith(searchPhone) && !searchPhone.EndsWith(recordPhone))
            {
                throw new BadRequestException("Số điện thoại cung cấp không khớp với thông tin người nộp hồ sơ này.");
            }
        }

        var now = DateTime.UtcNow;
        var isOverdue = petition.DueDate.HasValue 
            && now > petition.DueDate.Value 
            && petition.Status != PetitionStatus.Resolved 
            && petition.Status != PetitionStatus.Closed;

        double? remainingHours = petition.DueDate.HasValue
            ? Math.Round((petition.DueDate.Value - now).TotalHours, 1)
            : null;

        var result = new PetitionTrackingDto
        {
            Id = petition.Id,
            TrackingCode = petition.TrackingCode,
            Title = petition.Title,
            Content = petition.Content,
            CategoryId = petition.CategoryId,
            CategoryName = petition.Category.Name,
            CategoryCode = petition.Category.Code,
            DefaultSlaHours = petition.Category.DefaultSlaHours,
            Status = (int)petition.Status,
            StatusName = GetStatusDisplayName(petition.Status),
            PriorityLevel = (int)petition.PriorityLevel,
            PriorityName = GetPriorityDisplayName(petition.PriorityLevel),
            AddressText = petition.AddressText,
            Latitude = petition.Latitude,
            Longitude = petition.Longitude,
            AdministrativeUnitId = petition.AdministrativeUnitId,
            AdministrativeUnitName = petition.AdministrativeUnit?.Name,
            DepartmentId = petition.DepartmentId,
            DepartmentName = petition.Department?.Name ?? "Chi cục Thủy sản tỉnh & Cơ quan Thường trực",
            AssignedUserName = petition.AssignedUser?.FullName,
            IsAnonymous = petition.IsAnonymous,
            CitizenNameMasked = MaskCitizenName(petition.CitizenName, petition.IsAnonymous),
            CitizenPhoneMasked = MaskCitizenPhone(petition.CitizenPhone, petition.IsAnonymous),
            CreatedAt = petition.CreatedAt,
            DueDate = petition.DueDate,
            ResolvedAt = petition.ResolvedAt,
            IsOverdue = isOverdue,
            RemainingHours = remainingHours,
            ResolutionSummary = petition.ResolutionSummary,
            Attachments = petition.Attachments.Select(a => new PetitionAttachmentDto
            {
                Id = a.Id,
                FileName = a.FileName,
                OriginalFileName = a.OriginalFileName,
                FileUrl = a.FileUrl,
                FileType = a.FileType.ToString(),
                MimeType = a.MimeType,
                FileSize = a.FileSize,
                ExifLatitude = a.ExifLatitude,
                ExifLongitude = a.ExifLongitude
            }).ToList(),
            Timeline = petition.Histories
                .OrderBy(h => h.CreatedAt)
                .Select(h => new PetitionTimelineItemDto
                {
                    Id = h.Id,
                    CreatedAt = h.CreatedAt,
                    Action = h.Action,
                    FromStatus = h.FromStatus.HasValue ? (int)h.FromStatus.Value : null,
                    FromStatusName = h.FromStatus.HasValue ? GetStatusDisplayName(h.FromStatus.Value) : null,
                    ToStatus = (int)h.ToStatus,
                    ToStatusName = GetStatusDisplayName(h.ToStatus),
                    Note = h.Note,
                    ActorName = h.PerformedByName ?? h.PerformedByUser?.FullName ?? "Bộ phận Tiếp nhận & Phân loại"
                }).ToList()
        };

        if (petition.Resolution != null)
        {
            result.Resolution = new PetitionResolutionDto
            {
                Id = petition.Resolution.Id,
                ConclusionText = petition.Resolution.ConclusionText,
                DocumentNumber = petition.Resolution.DocumentNumber,
                OfficialDocumentUrl = petition.Resolution.OfficialDocumentUrl,
                IssuedAt = petition.Resolution.IssuedAt,
                ApprovedByName = petition.Resolution.ApprovedByUser?.FullName
            };
        }

        if (petition.Feedback != null)
        {
            result.HasFeedback = true;
            result.FeedbackRating = petition.Feedback.Rating;
            result.FeedbackComment = petition.Feedback.Comment;
        }

        return result;
    }

    private static string GetStatusDisplayName(PetitionStatus status) => status switch
    {
        PetitionStatus.Submitted => "Mới tiếp nhận (Chờ phân loại)",
        PetitionStatus.Assigned => "Đã chuyển giao đơn vị xử lý",
        PetitionStatus.Investigating => "Đang thẩm tra & Khảo sát thực địa",
        PetitionStatus.Resolved => "Đã ban hành quyết định giải quyết",
        PetitionStatus.Rejected => "Từ chối thụ lý",
        PetitionStatus.Closed => "Đã hoàn tất đóng hồ sơ",
        _ => status.ToString()
    };

    private static string GetPriorityDisplayName(PriorityLevel priority) => priority switch
    {
        PriorityLevel.Normal => "Tiêu chuẩn",
        PriorityLevel.High => "Ưu tiên cao",
        PriorityLevel.Urgent => "Hỏa tốc / Khẩn cấp",
        _ => priority.ToString()
    };

    private static string MaskCitizenName(string? name, bool isAnonymous)
    {
        if (isAnonymous || string.IsNullOrWhiteSpace(name))
            return "Công dân ẩn danh";

        var parts = name.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length <= 1)
            return $"{parts[0][0]}***";

        // Giữ họ và tên đệm, che tên chính: vd "Nguyễn Văn Hải" -> "Nguyễn Văn H***"
        var last = parts[^1];
        var maskedLast = last.Length > 1 ? $"{last[0]}***" : "***";
        return $"{string.Join(" ", parts.Take(parts.Length - 1))} {maskedLast}";
    }

    private static string? MaskCitizenPhone(string? phone, bool isAnonymous)
    {
        if (isAnonymous || string.IsNullOrWhiteSpace(phone))
            return null;

        var clean = phone.Trim();
        if (clean.Length <= 6)
            return "***";

        // Giữ 4 số đầu và 3 số cuối: 0912***678
        var prefix = clean[..4];
        var suffix = clean[^3..];
        return $"{prefix}***{suffix}";
    }
}
