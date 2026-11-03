using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Domain.Entities;
using AquaReflect.Domain.Enums;
using AquaReflect.Domain.Exceptions;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Application.Features.Users.Commands.CreateUser;

public record CreateUserCommand(
    string Username,
    string Password,
    string FullName,
    string Email,
    string? PhoneNumber,
    UserRole Role,
    Guid? DepartmentId,
    bool IsUnitLead) : IRequest<Guid>;

public class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserCommandValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Tên đăng nhập không được để trống.")
            .MinimumLength(3).WithMessage("Tên đăng nhập phải có ít nhất 3 ký tự.")
            .MaximumLength(50).WithMessage("Tên đăng nhập tối đa 50 ký tự.")
            .Matches(@"^[a-zA-Z0-9_]+$").WithMessage("Tên đăng nhập chỉ được chứa chữ cái, chữ số và gạch dưới.");

        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Họ và tên không được để trống.")
            .MaximumLength(150).WithMessage("Họ và tên tối đa 150 ký tự.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email không được để trống.")
            .EmailAddress().WithMessage("Địa chỉ email không đúng định dạng.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Mật khẩu không được để trống.")
            .MinimumLength(6).WithMessage("Mật khẩu phải có ít nhất 6 ký tự.");
    }
}

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public CreateUserCommandHandler(IApplicationDbContext context, IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<Guid> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var username = request.Username.Trim().ToLowerInvariant();
        var email = request.Email.Trim().ToLowerInvariant();

        var exists = await _context.Users
            .AnyAsync(u => u.Username.ToLower() == username || u.Email.ToLower() == email, cancellationToken);

        if (exists)
        {
            throw new BadRequestException("Tên đăng nhập hoặc địa chỉ email đã tồn tại trong hệ thống.");
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

        var (hash, salt) = _passwordHasher.HashPassword(request.Password);

        var newUser = new User
        {
            Username = request.Username.Trim(),
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim(),
            PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim(),
            PasswordHash = hash,
            PasswordSalt = salt,
            Role = request.Role,
            DepartmentId = request.Role == UserRole.Specialist ? request.DepartmentId : null,
            IsUnitLead = request.Role == UserRole.Specialist && request.IsUnitLead,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync(cancellationToken);

        return newUser.Id;
    }
}

