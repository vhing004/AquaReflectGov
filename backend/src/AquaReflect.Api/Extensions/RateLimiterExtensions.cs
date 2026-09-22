using System.Net;
using System.Threading.RateLimiting;
using AquaReflect.Application.Common.Models;
using Microsoft.AspNetCore.RateLimiting;

namespace AquaReflect.Api.Extensions;

public static class RateLimiterExtensions
{
    public const string AuthPolicy = "auth-policy";
    public const string PetitionSubmitPolicy = "petition-submit-policy";
    public const string FeedbackPolicy = "feedback-policy";
    public const string GlobalIpPolicy = "global-ip-policy";

    public static IServiceCollection AddCustomRateLimiting(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.OnRejected = async (context, token) =>
            {
                context.HttpContext.Response.ContentType = "application/json";
                var response = ApiResponse.Fail(
                    "Quý vị đã gửi quá nhiều yêu cầu trong một khoảng thời gian ngắn. Vui lòng thử lại sau.",
                    StatusCodes.Status429TooManyRequests,
                    new Dictionary<string, string[]>
                    {
                        { "RateLimit", new[] { "Quá giới hạn tần suất yêu cầu (Rate limit exceeded). Vui lòng chờ giây lát." } }
                    });

                await context.HttpContext.Response.WriteAsJsonAsync(response, cancellationToken: token);
            };

            // 1. Auth Policy: Chống Brute-force đăng nhập/đăng ký (10 req/phút/IP)
            options.AddPolicy(AuthPolicy, httpContext =>
            {
                var clientIp = GetClientIp(httpContext);
                return RateLimitPartition.GetSlidingWindowLimiter(
                    clientIp,
                    _ => new SlidingWindowRateLimiterOptions
                    {
                        PermitLimit = 10,
                        Window = TimeSpan.FromMinutes(1),
                        SegmentsPerWindow = 2,
                        QueueLimit = 0
                    });
            });

            // 2. Petition Submit Policy: Chống spam gửi đơn phản ánh (5 req/phút/IP)
            options.AddPolicy(PetitionSubmitPolicy, httpContext =>
            {
                var clientIp = GetClientIp(httpContext);
                return RateLimitPartition.GetFixedWindowLimiter(
                    clientIp,
                    _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 5,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0
                    });
            });

            // 3. Feedback Policy: Chống spam gửi đánh giá (10 req/phút/IP)
            options.AddPolicy(FeedbackPolicy, httpContext =>
            {
                var clientIp = GetClientIp(httpContext);
                return RateLimitPartition.GetFixedWindowLimiter(
                    clientIp,
                    _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 10,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0
                    });
            });

            // 4. Global Limiter: Bảo vệ toàn bộ hệ thống API (120 req/phút/IP)
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
            {
                var clientIp = GetClientIp(httpContext);
                return RateLimitPartition.GetFixedWindowLimiter(
                    clientIp,
                    _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 120,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 2
                    });
            });
        });

        return services;
    }

    private static string GetClientIp(HttpContext httpContext)
    {
        // Kiểm tra header X-Forwarded-For nếu chạy sau Reverse Proxy (Nginx/Cloudflare)
        var forwardedFor = httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(forwardedFor))
        {
            var ip = forwardedFor.Split(',').FirstOrDefault()?.Trim();
            if (!string.IsNullOrWhiteSpace(ip))
            {
                return ip;
            }
        }

        return httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous-ip";
    }
}
