using System.Text.Json.Serialization;
using AquaReflect.Api.Extensions;
using AquaReflect.Api.Middlewares;
using AquaReflect.Api.Services;
using AquaReflect.Application;
using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Infrastructure;
using AquaReflect.Infrastructure.Data;
using AquaReflect.Infrastructure.Hubs;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Cấu hình Serilog từ appsettings.json
builder.Host.UseSerilog((context, services, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration)
    .ReadFrom.Services(services)
    .Enrich.FromLogContext());

// Đăng ký các tầng trong Clean Architecture
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// Đăng ký thêm MediatR handlers từ Infrastructure (Reports: Excel/PDF)
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(AquaReflect.Infrastructure.Reports.ExportPetitionsToExcelQueryHandler).Assembly));


// Đăng ký SignalR Real-time Hubs
builder.Services.AddSignalR();

// Đăng ký HttpContextAccessor và CurrentUserService
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

// Cấu hình Controllers và Json Serializer
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Chuyển đổi Enum sang chuỗi (ví dụ: "Submitted" thay vì 1)
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// Cấu hình CORS cho Frontend ReactJS
var allowedOrigins = builder.Configuration.GetSection("CorsSettings:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:5173", "http://localhost:3000" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Cấu hình Swagger với tài liệu và JWT Authorization
builder.Services.AddSwaggerDocumentation();

// Cấu hình Rate Limiting chống Brute-force & Spam
builder.Services.AddCustomRateLimiting();

var app = builder.Build();

// Sử dụng Serilog để log tất cả HTTP requests
app.UseSerilogRequestLogging();

// Middleware thiết lập HTTP Security Headers
app.UseMiddleware<SecurityHeadersMiddleware>();

// Middleware xử lý lỗi tập trung toàn cục
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Kích hoạt Swagger UI cho môi trường Development và Test
if (app.Environment.IsDevelopment() || true)
{
    app.UseSwaggerDocumentation();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

// Kích hoạt kiểm soát tần suất truy cập Rate Limiting
app.UseRateLimiter();

// Kích hoạt phục vụ tệp tĩnh (ảnh/video đính kèm) trong wwwroot
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

// Chuyển hướng trang chủ về /swagger để tiện kiểm thử API
app.MapGet("/", () => Results.Redirect("/swagger"));

app.MapControllers();

// Đăng ký Endpoint SignalR Hub cho WebSocket real-time
app.MapHub<NotificationHub>("/hubs/notification");

try
{
    Log.Information("Khởi động AquaReflect API Server...");

    // Tự động kiểm tra và khởi tạo dữ liệu mẫu nếu database trống
    await ApplicationDbContextSeed.SeedSampleDataAsync(app.Services);

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Máy chủ AquaReflect API bị dừng bất ngờ.");
}
finally
{
    Log.CloseAndFlush();
}
