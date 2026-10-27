using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Features.Petitions.DTOs;
using AquaReflect.Domain.Entities;
using AquaReflect.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Application.Features.Petitions.Commands.AddPublicComment;

public class AddPublicCommentCommandHandler : IRequestHandler<AddPublicCommentCommand, PublicCommentDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public AddPublicCommentCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<PublicCommentDto> Handle(AddPublicCommentCommand request, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra xác thực: Bắt buộc phải đăng nhập tài khoản
        if (!_currentUser.IsAuthenticated)
        {
            throw new UnauthorizedAccessException("Vui lòng đăng nhập tài khoản công dân để gửi bình luận.");
        }

        if (string.IsNullOrWhiteSpace(request.Content))
        {
            throw new ValidationException("Nội dung bình luận không được để trống.");
        }

        var trimmedContent = request.Content.Trim();
        if (trimmedContent.Length > 1000)
        {
            throw new ValidationException("Nội dung bình luận không được vượt quá 1000 ký tự.");
        }

        // 2. Tìm hồ sơ phản ánh theo mã tra cứu
        if (string.IsNullOrWhiteSpace(request.TrackingCode))
        {
            throw new BadRequestException("Mã hồ sơ tra cứu không hợp lệ.");
        }

        var normalizedCode = request.TrackingCode.Trim().ToUpperInvariant();
        if (normalizedCode.StartsWith('#'))
        {
            normalizedCode = normalizedCode.TrimStart('#');
        }

        var petition = await _context.Petitions
            .FirstOrDefaultAsync(p => p.TrackingCode == normalizedCode && !p.IsDeleted, cancellationToken);

        if (petition == null)
        {
            throw new NotFoundException($"Không tìm thấy hồ sơ phản ánh với mã tra cứu: {request.TrackingCode}");
        }

        // 3. Xác định tên tác giả bình luận
        string authorName = _currentUser.Username ?? "Công dân";
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

        // 4. Lưu bình luận công khai (IsInternal = false)
        var comment = new PetitionComment
        {
            PetitionId = petition.Id,
            AuthorName = authorName,
            AuthorUserId = _currentUser.UserId,
            IsInternal = false,
            Content = trimmedContent
        };

        _context.PetitionComments.Add(comment);
        await _context.SaveChangesAsync(cancellationToken);

        // 5. Kiểm tra xem người bình luận có phải chính là chủ hồ sơ gửi ban đầu hay không
        bool isAuthor = (!string.IsNullOrWhiteSpace(petition.CitizenName) && authorName.Trim().Equals(petition.CitizenName.Trim(), StringComparison.OrdinalIgnoreCase))
            || (!string.IsNullOrWhiteSpace(petition.CreatedBy) && _currentUser.Username != null && petition.CreatedBy.Equals(_currentUser.Username, StringComparison.OrdinalIgnoreCase));

        return new PublicCommentDto
        {
            Id = comment.Id,
            AuthorName = comment.AuthorName,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt,
            IsAuthorOfPetition = isAuthor
        };
    }
}
