using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Application.Features.Users.Commands.ToggleUserActive;

public record ToggleUserActiveCommand(Guid Id) : IRequest<bool>;

public class ToggleUserActiveCommandHandler : IRequestHandler<ToggleUserActiveCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public ToggleUserActiveCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<bool> Handle(ToggleUserActiveCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId.HasValue && _currentUser.UserId.Value == request.Id)
        {
            throw new BadRequestException("Bạn không thể tự khóa tài khoản quản trị của chính mình.");
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.Id && !u.IsDeleted, cancellationToken);

        if (user == null)
        {
            throw new NotFoundException($"Không tìm thấy người dùng với ID: {request.Id}");
        }

        user.IsActive = !user.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return user.IsActive;
    }
}

