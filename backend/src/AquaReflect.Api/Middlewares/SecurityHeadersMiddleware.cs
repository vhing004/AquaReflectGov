namespace AquaReflect.Api.Middlewares;

/// <summary>
/// Middleware thiết lập các HTTP Security Headers nhằm nâng cao độ an toàn của hệ thống
/// </summary>
public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // 1. Chống MIME-type sniffing (ngăn trình duyệt tự ý đoán định dạng file tải về)
        context.Response.Headers.TryAdd("X-Content-Type-Options", "nosniff");

        // 2. Chống Clickjacking (chỉ cho phép nhúng frame từ chính hệ thống)
        context.Response.Headers.TryAdd("X-Frame-Options", "SAMEORIGIN");

        // 3. Kích hoạt bộ lọc XSS của trình duyệt
        context.Response.Headers.TryAdd("X-XSS-Protection", "1; mode=block");

        // 4. Giới hạn thông tin Referrer rò rỉ ra bên ngoài
        context.Response.Headers.TryAdd("Referrer-Policy", "strict-origin-when-cross-origin");

        // 5. Phân quyền thiết bị phần cứng (cho phép geolocation nội bộ cho bản đồ, cấm camera/micro)
        context.Response.Headers.TryAdd("Permissions-Policy", "geolocation=(self), camera=(), microphone=()");

        await _next(context);
    }
}
