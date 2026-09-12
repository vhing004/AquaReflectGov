using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Common.Models;
using AquaReflect.Application.Features.Auth.DTOs;
using AquaReflect.Domain.Entities;
using AquaReflect.Domain.Enums;
using AquaReflect.Domain.Exceptions;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Application.Features.Auth.Commands.Register;

public record RegisterCommand(
    string Username,
    string FullName,
    string Email,
    string? PhoneNumber,
    string Password,
    string ConfirmPassword) : IRequest<ApiResponse<AuthResponseDto>>;

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Tên đăng nhập không được để trống.")
            .MinimumLength(4).WithMessage("Tên đăng nhập phải có ít nhất 4 ký tự.")
            .MaximumLength(50).WithMessage("Tên đăng nhập tối đa 50 ký tự.")
            .Matches(@"^[a-zA-Z0-9_]+$").WithMessage("Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới.");

        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Họ và tên không được để trống.")
            .MaximumLength(150).WithMessage("Họ và tên tối đa 150 ký tự.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email không được để trống.")
            .EmailAddress().WithMessage("Địa chỉ email không đúng định dạng.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Mật khẩu không được để trống.")
            .MinimumLength(6).WithMessage("Mật khẩu phải có ít nhất 6 ký tự.");

        RuleFor(x => x.ConfirmPassword)
            .Equal(x => x.Password).WithMessage("Mật khẩu xác nhận không khớp.");
    }
}

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, ApiResponse<AuthResponseDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public RegisterCommandHandler(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<ApiResponse<AuthResponseDto>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var username = request.Username.Trim().ToLower();
        var email = request.Email.Trim().ToLower();

        var existingUser = await _context.Users
            .AnyAsync(u => u.Username.ToLower() == username || u.Email.ToLower() == email, cancellationToken);

        if (existingUser)
        {
            throw new BadRequestException("Tên đăng nhập hoặc Email đã tồn tại trên hệ thống.");
        }

        var (hash, salt) = _passwordHasher.HashPassword(request.Password);

        var newUser = new User
        {
            Username = request.Username.Trim(),
            FullName = request.FullName.Trim(),
            Email = email,
            PhoneNumber = request.PhoneNumber?.Trim(),
            PasswordHash = hash,
            PasswordSalt = salt,
            Role = UserRole.Citizen, // Mặc định đăng ký công khai là Người dân/Ngư dân
            IsActive = true
        };

        var accessToken = _jwtTokenGenerator.GenerateAccessToken(newUser);
        var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();

        newUser.RefreshToken = refreshToken;
        newUser.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        newUser.LastLoginAt = DateTime.UtcNow;

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync(cancellationToken);

        var authResponse = new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresIn = 86400,
            User = new UserInfoDto
            {
                Id = newUser.Id,
                Username = newUser.Username,
                FullName = newUser.FullName,
                Email = newUser.Email,
                PhoneNumber = newUser.PhoneNumber,
                Role = newUser.Role,
                DepartmentId = null,
                DepartmentName = null
            }
        };

        return ApiResponse<AuthResponseDto>.Created(authResponse, "Đăng ký tài khoản thành công.");
    }
}
