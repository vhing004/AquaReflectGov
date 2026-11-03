using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Domain.Enums;
using AquaReflect.Domain.Exceptions;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Application.Features.Users.Commands.UpdateUser;

public record UpdateUserCommand(
    Guid Id,
    string FullName,
    string? PhoneNumber,
    UserRole Role,
    Guid? DepartmentId,
    bool IsUnitLead,
    string? NewPassword = null) : IRequest<bool>;

public class UpdateUserCommandValidator : AbstractValidator<UpdateUserCommand>
{
    public UpdateUserCommandValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Họ và tên không được để trống.")
            .MaximumLength(150).WithMessage("Họ và tên tối đa 150 ký tự.");

        When(x => !string.IsNullOrEmpty(x.NewPassword), () =>
        {
            RuleFor(x => x.NewPassword)
                .MinimumLength(6).WithMessage("Mật khẩu mới phải có ít nhất 6 ký tự.");
        });
    }
}

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public UpdateUserCommandHandler(IApplicationDbContext context, IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<bool> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.Id && !u.IsDeleted, cancellationToken);

        if (user == null)
        {
            throw new NotFoundException($"Không tìm thấy người dùng với ID: {request.Id}");
        }

        if (request.DepartmentId.HasValue)
        {
            var deptExists = await _context.Departments
                .AnyAsync(d => d.Id == request.DepartmentId.Value && !d.IsDeleted, cancellationToken);
            if (!deptExists)
            {
                throw new NotFoundException("Phòng ban / Cơ quan chuyên môn được chọn không tồn tại.");
            }
        }

        user.FullName = request.FullName.Trim();
        user.PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim();
        user.Role = request.Role;
        user.DepartmentId = request.Role == UserRole.Specialist ? request.DepartmentId : null;
        user.IsUnitLead = request.Role == UserRole.Specialist && request.IsUnitLead;

        if (!string.IsNullOrWhiteSpace(request.NewPassword))
        {
            var (hash, salt) = _passwordHasher.HashPassword(request.NewPassword.Trim());
            user.PasswordHash = hash;
            user.PasswordSalt = salt;
        }

        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}

