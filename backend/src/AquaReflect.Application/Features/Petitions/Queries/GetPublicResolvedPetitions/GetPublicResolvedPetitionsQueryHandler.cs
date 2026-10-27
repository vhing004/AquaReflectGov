using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Features.Petitions.DTOs;
using AquaReflect.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Application.Features.Petitions.Queries.GetPublicResolvedPetitions;

/// <summary>
/// Handler lấy danh sách hồ sơ đã giải quyết cho trang công khai (không yêu cầu đăng nhập).
/// Tự động che mờ thông tin cá nhân công dân, chỉ trả dữ liệu công khai.
/// </summary>
public class GetPublicResolvedPetitionsQueryHandler
    : IRequestHandler<GetPublicResolvedPetitionsQuery, List<PublicResolvedPetitionDto>>
{
    private readonly IApplicationDbContext _context;

    public GetPublicResolvedPetitionsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<PublicResolvedPetitionDto>> Handle(
        GetPublicResolvedPetitionsQuery request, CancellationToken cancellationToken)
    {
        // Chỉ lấy hồ sơ đã giải quyết hoặc đã đóng, chưa bị xóa
        var query = _context.Petitions
            .Include(p => p.Category)
            .Include(p => p.Department)
            .Include(p => p.AdministrativeUnit)
            .Include(p => p.Attachments)
            .Include(p => p.Resolution)
            .Include(p => p.Feedback)
            .Where(p => !p.IsDeleted)
            .Where(p => p.Status == PetitionStatus.Resolved || p.Status == PetitionStatus.Closed)
            .AsNoTracking();

        // Lọc theo chuyên mục nếu có
        if (!string.IsNullOrWhiteSpace(request.CategoryCode))
        {
            var code = request.CategoryCode.Trim();
            query = query.Where(p => p.Category.Code == code);
        }

        // Lọc theo từ khóa tìm kiếm (tiêu đề, mã tra cứu, địa bàn)
        if (!string.IsNullOrWhiteSpace(request.Keyword))
        {
            var kw = request.Keyword.Trim().ToLower();
            query = query.Where(p =>
                p.Title.ToLower().Contains(kw) ||
                p.TrackingCode.ToLower().Contains(kw) ||
                (p.AddressText != null && p.AddressText.ToLower().Contains(kw)) ||
                (p.Resolution != null && p.Resolution.ConclusionText != null && p.Resolution.ConclusionText.ToLower().Contains(kw)));
        }

        // Sắp xếp
        query = request.SortBy?.ToLower() switch
        {
            "rating" => query
                .OrderByDescending(p => p.Feedback != null ? p.Feedback.Rating : 0)
                .ThenByDescending(p => p.ResolvedAt ?? p.CreatedAt),
            "oldest" => query.OrderBy(p => p.ResolvedAt ?? p.CreatedAt),
            _ => query.OrderByDescending(p => p.ResolvedAt ?? p.CreatedAt)
        };

        // Phân trang hoặc Giới hạn số lượng
        if (request.Page.HasValue && request.PageSize.HasValue)
        {
            var page = Math.Max(1, request.Page.Value);
            var pageSize = Math.Clamp(request.PageSize.Value, 1, 50);
            query = query.Skip((page - 1) * pageSize).Take(pageSize);
        }
        else
        {
            var limit = Math.Clamp(request.Limit, 1, 50);
            query = query.Take(limit);
        }

        var petitions = await query.ToListAsync(cancellationToken);

        // Map sang DTO
        return petitions.Select(p =>
        {
            var resolvedAt = p.ResolvedAt ?? DateTime.UtcNow;
            var actualHours = Math.Round((resolvedAt - p.CreatedAt).TotalHours, 1);
            var slaHours = p.Category.DefaultSlaHours;
            var slaMargin = Math.Round(slaHours - actualHours, 1);

            // Lấy thumbnail ảnh đầu tiên (nếu có)
            var firstImage = p.Attachments?
                .FirstOrDefault(a =>
                    a.MimeType.StartsWith("image/", StringComparison.OrdinalIgnoreCase));

            return new PublicResolvedPetitionDto
            {
                Id = p.Id,
                TrackingCode = p.TrackingCode,
                Title = p.Title,
                CategoryName = p.Category.Name,
                CategoryCode = p.Category.Code,
                StatusName = p.Status == PetitionStatus.Resolved ? "Đã giải quyết" : "Đã đóng hồ sơ",
                AddressText = p.AddressText,
                AdministrativeUnitName = p.AdministrativeUnit?.Name,
                DepartmentName = p.Department?.Name ?? "Chi cục Thủy sản",
                CreatedAt = p.CreatedAt,
                ResolvedAt = p.ResolvedAt,
                DefaultSlaHours = slaHours,
                ActualProcessingHours = actualHours,
                SlaMarginHours = slaMargin,
                IsAheadOfSla = slaMargin >= 0,
                ThumbnailUrl = firstImage?.FileUrl,
                ResolutionSummary = p.Resolution?.ConclusionText,
                ResolutionDocumentNumber = p.Resolution?.DocumentNumber,
                HasFeedback = p.Feedback != null,
                FeedbackRating = p.Feedback?.Rating,
                FeedbackComment = p.Feedback?.Comment,
            };
        }).ToList();
    }
}
