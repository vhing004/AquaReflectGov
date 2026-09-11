using Microsoft.OpenApi.Models;

namespace AquaReflect.Api.Extensions;

public static class SwaggerServiceExtensions
{
    public static IServiceCollection AddSwaggerDocumentation(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "AquaReflect API - Cổng Phản ánh Kiến nghị Thủy sản",
                Version = "v1",
                Description = "Nền tảng tiếp nhận, xử lý và giám sát phản ánh kiến nghị trong ngành thủy sản (Dịch bệnh, Ô nhiễm nước, Vi phạm IUU, Giống & Vật tư).",
                Contact = new OpenApiContact
                {
                    Name = "AquaReflect Support",
                    Email = "support@aquareflect.gov.vn"
                }
            });

            // Cấu hình JWT Bearer trong Swagger UI
            var securityScheme = new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Description = "Nhập token JWT theo định dạng: Bearer {your token}",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer",
                BearerFormat = "JWT",
                Reference = new OpenApiReference
                {
                    Id = "Bearer",
                    Type = ReferenceType.SecurityScheme
                }
            };

            options.AddSecurityDefinition("Bearer", securityScheme);

            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    securityScheme,
                    Array.Empty<string>()
                }
            });
        });

        return services;
    }

    public static IApplicationBuilder UseSwaggerDocumentation(this IApplicationBuilder app)
    {
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "AquaReflect API v1");
            c.RoutePrefix = "swagger";
            c.DocumentTitle = "AquaReflect API Documentation";
        });

        return app;
    }
}
