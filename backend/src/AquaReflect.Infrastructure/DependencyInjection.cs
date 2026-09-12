using System.Text;
using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Domain.Enums;
using AquaReflect.Infrastructure.Data;
using AquaReflect.Infrastructure.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace AquaReflect.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Chuỗi kết nối 'DefaultConnection' không được tìm thấy trong cấu hình.");

        services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
            });
        });

        services.AddScoped<IApplicationDbContext>(provider =>
            provider.GetRequiredService<ApplicationDbContext>());

        // Dịch vụ mã hóa băm mật khẩu và sinh JWT
        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();

        // Cấu hình Authentication JWT Bearer
        var jwtKey = configuration["JwtSettings:Key"]
            ?? "AquaReflect_Secure_Super_Secret_Key_2026_Fisheries_Management_Key_Must_Be_Long";
        var jwtIssuer = configuration["JwtSettings:Issuer"] ?? "AquaReflectServer";
        var jwtAudience = configuration["JwtSettings:Audience"] ?? "AquaReflectClient";

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.RequireHttpsMetadata = false;
            options.SaveToken = true;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                ValidateIssuer = true,
                ValidIssuer = jwtIssuer,
                ValidateAudience = true,
                ValidAudience = jwtAudience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };
        });

        // Cấu hình phân quyền Authorization Policies
        services.AddAuthorization(options =>
        {
            options.AddPolicy("RequireSuperAdmin", policy =>
                policy.RequireRole(UserRole.SuperAdmin.ToString()));

            options.AddPolicy("RequireOfficer", policy =>
                policy.RequireRole(
                    UserRole.SuperAdmin.ToString(),
                    UserRole.Dispatcher.ToString(),
                    UserRole.Specialist.ToString()));

            options.AddPolicy("RequireDispatcher", policy =>
                policy.RequireRole(
                    UserRole.SuperAdmin.ToString(),
                    UserRole.Dispatcher.ToString()));

            options.AddPolicy("RequireSpecialist", policy =>
                policy.RequireRole(
                    UserRole.SuperAdmin.ToString(),
                    UserRole.Specialist.ToString()));

            options.AddPolicy("RequireCitizen", policy =>
                policy.RequireRole(UserRole.Citizen.ToString()));
        });

        return services;
    }
}
