using System.Text.Json.Serialization;
using AquaReflect.Api.Extensions;
using AquaReflect.Api.Middlewares;
using AquaReflect.Application;
using AquaReflect.Infrastructure;
using AquaReflect.Infrastructure.Data;
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

var app = builder.Build();

// Sử dụng Serilog để log tất cả HTTP requests
app.UseSerilogRequestLogging();

// Middleware xử lý lỗi tập trung toàn cục
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Kích hoạt Swagger UI cho môi trường Development và Test
if (app.Environment.IsDevelopment() || true)
{
    app.UseSwaggerDocumentation();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

// Chuyển hướng trang chủ về /swagger để tiện kiểm thử API
app.MapGet("/", () => Results.Redirect("/swagger"));

app.MapControllers();

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
