using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Features.Petitions.DTOs;
using AquaReflect.Domain.Enums;
using AquaReflect.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Application.Features.Petitions.Queries.GetInternalThread;

public class GetInternalThreadQueryHandler : IRequestHandler<GetInternalThreadQuery, List<PetitionCommentDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetInternalThreadQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<List<PetitionCommentDto>> Handle(GetInternalThreadQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated)
            throw new UnauthorizedAccessException("Vui lòng đăng nhập để xem trao đổi nội bộ.");

        var role = _currentUser.Role;
        if (role == UserRole.Citizen || !role.HasValue)
            throw new ForbiddenException("Trao đổi nội bộ chỉ dành cho cán bộ nghiệp vụ.");

        var petition = await _context.Petitions
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.PetitionId && !p.IsDeleted, cancellationToken);

        if (petition == null)
            throw new NotFoundException($"Không tìm thấy hồ sơ phản ánh với ID: {request.PetitionId}");

        if (role == UserRole.Specialist)
        {
            if (!_currentUser.DepartmentId.HasValue || petition.DepartmentId != _currentUser.DepartmentId.Value)
            {
                throw new ForbiddenException("Bạn không thể xem trao đổi nội bộ của hồ sơ thuộc đơn vị khác.");
            }
        }

        var comments = await _context.PetitionComments
            .AsNoTracking()
            .Include(c => c.AuthorUser)
            .Where(c => c.PetitionId == request.PetitionId && c.IsInternal)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new PetitionCommentDto
            {
                Id = c.Id,
                PetitionId = c.PetitionId,
                AuthorName = c.AuthorName,
                AuthorUserId = c.AuthorUserId,
                AuthorUsername = c.AuthorUser != null ? c.AuthorUser.Username : null,
                AuthorRoleName = c.AuthorUser != null ? (c.AuthorUser.Role == UserRole.SuperAdmin ? "Quản trị viên" : (c.AuthorUser.Role == UserRole.Dispatcher ? "Cán bộ Điều phối" : (c.AuthorUser.IsUnitLead ? "Trưởng đơn vị" : "Cán bộ thụ lý"))) : "Cán bộ",
                AuthorIsUnitLead = c.AuthorUser != null && c.AuthorUser.IsUnitLead,
                IsInternal = c.IsInternal,
                Content = c.Content,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return comments;
    }
}
