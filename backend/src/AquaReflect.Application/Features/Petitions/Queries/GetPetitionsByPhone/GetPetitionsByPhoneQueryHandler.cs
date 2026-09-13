using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Features.Petitions.DTOs;
using AquaReflect.Domain.Enums;
using AquaReflect.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Application.Features.Petitions.Queries.GetPetitionsByPhone;

public class GetPetitionsByPhoneQueryHandler : IRequestHandler<GetPetitionsByPhoneQuery, List<PetitionSummaryDto>>
{
    private readonly IApplicationDbContext _context;

    public GetPetitionsByPhoneQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<PetitionSummaryDto>> Handle(GetPetitionsByPhoneQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.PhoneNumber))
        {
            throw new BadRequestException("Vui lòng cung cấp số điện thoại để tra cứu danh sách hồ sơ.");
        }

        var cleanPhone = request.PhoneNumber.Trim().Replace(" ", "").Replace(".", "").Replace("-", "");
        if (cleanPhone.Length < 9)
        {
            throw new BadRequestException("Số điện thoại tra cứu không hợp lệ (tối thiểu 9-10 chữ số).");
        }

        var now = DateTime.UtcNow;

        var petitions = await _context.Petitions
            .Include(p => p.Category)
            .Include(p => p.Department)
            .Include(p => p.Attachments.Where(a => !a.IsDeleted))
            .Where(p => !p.IsDeleted && p.CitizenPhone != null && p.CitizenPhone.Contains(cleanPhone))
            .OrderByDescending(p => p.CreatedAt)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return petitions.Select(p => new PetitionSummaryDto
        {
            Id = p.Id,
            TrackingCode = p.TrackingCode,
            Title = p.Title,
            CategoryName = p.Category.Name,
            Status = (int)p.Status,
            StatusName = GetStatusDisplayName(p.Status),
            PriorityLevel = (int)p.PriorityLevel,
            PriorityName = GetPriorityDisplayName(p.PriorityLevel),
            CreatedAt = p.CreatedAt,
            DueDate = p.DueDate,
            IsOverdue = p.DueDate.HasValue && now > p.DueDate.Value && p.Status != PetitionStatus.Resolved && p.Status != PetitionStatus.Closed,
            AttachmentsCount = p.Attachments.Count,
            DepartmentName = p.Department?.Name ?? "Chi cục Thủy sản tỉnh"
        }).ToList();
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
}
