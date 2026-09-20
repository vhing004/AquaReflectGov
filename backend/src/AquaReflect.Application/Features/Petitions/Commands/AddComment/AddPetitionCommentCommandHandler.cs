using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Features.Petitions.DTOs;
using AquaReflect.Domain.Entities;
using AquaReflect.Domain.Enums;
using AquaReflect.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Application.Features.Petitions.Commands.AddComment;

public class AddPetitionCommentCommandHandler : IRequestHandler<AddPetitionCommentCommand, PetitionCommentDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public AddPetitionCommentCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<PetitionCommentDto> Handle(AddPetitionCommentCommand request, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra quyền truy cập
        if (!_currentUser.IsAuthenticated)
            throw new UnauthorizedAccessException("Vui lòng đăng nhập để gửi ghi chú nghiệp vụ.");

        var role = _currentUser.Role;
        if (role == UserRole.Citizen)
            throw new ForbiddenException("Chức năng ghi chú nội bộ chỉ dành riêng cho cán bộ thụ lý.");

        if (string.IsNullOrWhiteSpace(request.Content))
            throw new ValidationException("Nội dung ghi chú không được để trống.");

        // 2. Kiểm tra hồ sơ tồn tại
        var petition = await _context.Petitions
            .FirstOrDefaultAsync(p => p.Id == request.PetitionId && !p.IsDeleted, cancellationToken);

        if (petition == null)
            throw new NotFoundException($"Không tìm thấy hồ sơ phản ánh với ID: {request.PetitionId}");

        // 3. Specialist chỉ thêm ghi chú vào hồ sơ thuộc phòng ban mình
        if (role == UserRole.Specialist && _currentUser.DepartmentId.HasValue && petition.DepartmentId.HasValue)
        {
            if (petition.DepartmentId != _currentUser.DepartmentId)
            {
                throw new ForbiddenException("Bạn không thể thêm ghi chú cho hồ sơ thuộc phòng ban khác.");
            }
        }

        string authorName = _currentUser.Username ?? "Cán bộ thụ lý";
        if (_currentUser.UserId.HasValue)
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == _currentUser.UserId.Value, cancellationToken);
            if (user != null && !string.IsNullOrWhiteSpace(user.FullName))
            {
                authorName = user.FullName;
            }
        }

        // 4. Tạo bình luận / ghi chú nội bộ
        var comment = new PetitionComment
        {
            PetitionId = petition.Id,
            AuthorUserId = _currentUser.UserId,
            AuthorName = authorName,
            IsInternal = true,
            Content = request.Content.Trim()
        };

        _context.PetitionComments.Add(comment);
        await _context.SaveChangesAsync(cancellationToken);

        return new PetitionCommentDto
        {
            Id = comment.Id,
            PetitionId = comment.PetitionId,
            AuthorName = comment.AuthorName,
            AuthorUserId = comment.AuthorUserId,
            IsInternal = comment.IsInternal,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt
        };
    }
}
