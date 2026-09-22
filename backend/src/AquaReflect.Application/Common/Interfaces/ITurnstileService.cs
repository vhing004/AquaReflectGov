namespace AquaReflect.Application.Common.Interfaces;

/// <summary>
/// Dịch vụ xác thực tính hợp lệ của token bảo mật chống spam Cloudflare Turnstile
/// </summary>
public interface ITurnstileService
{
    /// <summary>
    /// Kiểm tra token Turnstile gửi từ client có hợp lệ hay không
    /// </summary>
    /// <param name="token">Token do widget Turnstile tạo ra trên trình duyệt</param>
    /// <param name="remoteIp">Địa chỉ IP của client (tùy chọn)</param>
    /// <param name="cancellationToken">CancellationToken</param>
    /// <returns>True nếu hợp lệ hoặc đang ở chế độ bypass dev; False nếu gian lận hoặc bot</returns>
    Task<bool> VerifyTokenAsync(string? token, string? remoteIp = null, CancellationToken cancellationToken = default);
}
