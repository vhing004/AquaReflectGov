using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Common.Models;
using AquaReflect.Application.Features.Users.DTOs;
using AquaReflect.Domain.Enums;
using AquaReflect.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Application.Features.Users.Queries.GetUserPetitions;

public record GetUserPetitionsQuery : IRequest<PaginatedResult<UserPetitionDto>>
{
    public Guid UserId { get; init; }
    public string? FilterType { get; init; } = "resolved"; // "resolved" | "active" | "all"
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}

public class GetUserPetitionsQueryHandler : IRequestHandler<GetUserPetitionsQuery, PaginatedResult<UserPetitionDto>>
{
    private readonly IApplicationDbContext _context;

    public GetUserPetitionsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<UserPetitionDto>> Handle(GetUserPetitionsQuery request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == request.UserId && !u.IsDeleted, cancellationToken);

        if (user == null)
        {
            throw new NotFoundException($"Khong tim thay nguoi dung voi ID: {request.UserId}");
        }

        var query = _context.Petitions
            .Include(p => p.Category)
            .Include(p => p.Feedback)
            .Include(p => p.Resolution)
            .Where(p => !p.IsDeleted && p.AssignedUserId == request.UserId)
            .AsNoTracking();

        var filter = (request.FilterType ?? "resolved").ToLowerInvariant();
        if (filter == "resolved")
        {
            query = query.Where(p => p.Status == PetitionStatus.Resolved || p.Status == PetitionStatus.Closed);
        }
        else if (filter == "active")
        {
            query = query.Where(p =>
                p.Status == PetitionStatus.Assigned ||
                p.Status == PetitionStatus.Investigating ||
                p.Status == PetitionStatus.PendingApproval);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var pagedQuery = query
            .OrderByDescending(p => p.ResolvedAt ?? p.UpdatedAt ?? p.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize);

        var items = await pagedQuery.Select(p => new UserPetitionDto
        {
            Id = p.Id,
            TrackingCode = p.TrackingCode,
            Title = p.Title,
            CategoryName = p.Category != null ? p.Category.Name : "Khac",
            Status = (int)p.Status,
            StatusName = p.Status == PetitionStatus.Submitted ? "Moi tiep nhan" :
                         p.Status == PetitionStatus.Assigned ? "Da tiep nhan" :
                         p.Status == PetitionStatus.Investigating ? "Dang tham tra" :
                         p.Status == PetitionStatus.Resolved ? "Da giai quyet" :
                         p.Status == PetitionStatus.Rejected ? "Tu choi" :
                         p.Status == PetitionStatus.Closed ? "Da dong" :
                         p.Status == PetitionStatus.NeedInfo ? "Cho bo sung" :
                         p.Status == PetitionStatus.Merged ? "Da gop" :
                         p.Status == PetitionStatus.Forwarded ? "Da chuyen tiep" :
                         p.Status == PetitionStatus.Withdrawn ? "Da rut" :
                         p.Status == PetitionStatus.PendingApproval ? "Cho duyet nghiem thu" : "Khong xac dinh",
            PriorityLevel = (int)p.PriorityLevel,
            PriorityName = p.PriorityLevel == PriorityLevel.Urgent ? "Khan cap" :
                           p.PriorityLevel == PriorityLevel.High ? "Uu tien cao" : "Binh thuong",
            AddressText = p.AddressText,
            CreatedAt = p.CreatedAt,
            ResolvedAt = p.ResolvedAt,
            FeedbackRating = p.Feedback != null ? (int?)p.Feedback.Rating : null,
            FeedbackComment = p.Feedback != null ? p.Feedback.Comment : null,
            IsOverdue = p.DueDate.HasValue && (p.ResolvedAt ?? DateTime.UtcNow) > p.DueDate.Value,
            ResolutionSummary = p.ResolutionSummary ?? (p.Resolution != null ? p.Resolution.ConclusionText : null)
        }).ToListAsync(cancellationToken);

        return PaginatedResult<UserPetitionDto>.Create(items, totalCount, request.PageNumber, request.PageSize);
    }
}
