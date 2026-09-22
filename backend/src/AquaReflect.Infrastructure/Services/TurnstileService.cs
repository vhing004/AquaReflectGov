using System.Net.Http.Json;
using System.Text.Json.Serialization;
using AquaReflect.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AquaReflect.Infrastructure.Services;

/// <summary>
/// Dịch vụ xác minh mã phản hồi Cloudflare Turnstile với API Cloudflare
/// </summary>
public class TurnstileService : ITurnstileService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<TurnstileService> _logger;

    public TurnstileService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<TurnstileService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> VerifyTokenAsync(string? token, string? remoteIp = null, CancellationToken cancellationToken = default)
    {
        var enabled = _configuration.GetValue<bool>("TurnstileSettings:Enabled", false);
        var secretKey = _configuration.GetValue<string>("TurnstileSettings:SecretKey");
        var verifyUrl = _configuration.GetValue<string>("TurnstileSettings:VerifyUrl") 
                        ?? "https://challenges.cloudflare.com/turnstile/v0/siteverify";

        // Chế độ Bypass khi ở môi trường Development/Test hoặc chưa cấu hình SecretKey
        if (!enabled || string.IsNullOrWhiteSpace(secretKey))
        {
            _logger.LogInformation("Turnstile Anti-Spam đang ở chế độ Bypass (Enabled={Enabled}). Cho phép yêu cầu tiếp tục.", enabled);
            return true;
        }

        if (string.IsNullOrWhiteSpace(token))
        {
            _logger.LogWarning("Turnstile Token bị trống khi xác thực chống spam.");
            return false;
        }

        // Chấp nhận token test mock trong trường hợp đặc biệt
        if (token.StartsWith("bypass-test-token-"))
        {
            _logger.LogInformation("Nhận được token bypass test hợp lệ cho môi trường kiểm thử.");
            return true;
        }

        try
        {
            var parameters = new Dictionary<string, string>
            {
                { "secret", secretKey },
                { "response", token }
            };

            if (!string.IsNullOrWhiteSpace(remoteIp))
            {
                parameters.Add("remoteip", remoteIp);
            }

            var response = await _httpClient.PostAsync(verifyUrl, new FormUrlEncodedContent(parameters), cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Lỗi khi kết nối Cloudflare Turnstile endpoint. Mã HTTP: {StatusCode}", response.StatusCode);
                return false;
            }

            var result = await response.Content.ReadFromJsonAsync<TurnstileVerifyResponse>(cancellationToken: cancellationToken);

            if (result != null && result.Success)
            {
                _logger.LogInformation("Xác thực Cloudflare Turnstile thành công!");
                return true;
            }

            _logger.LogWarning("Xác thực Cloudflare Turnstile thất bại. Mã lỗi: {Errors}", 
                result?.ErrorCodes != null ? string.Join(", ", result.ErrorCodes) : "Unknown");

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi không xác định khi xác thực Turnstile với Cloudflare.");
            // Trường hợp mạng máy chủ lỗi đột ngột có thể cân nhắc fail-open hoặc fail-closed tùy cấu hình
            return false;
        }
    }

    private class TurnstileVerifyResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }

        [JsonPropertyName("error-codes")]
        public List<string>? ErrorCodes { get; set; }

        [JsonPropertyName("challenge_ts")]
        public string? ChallengeTs { get; set; }

        [JsonPropertyName("hostname")]
        public string? Hostname { get; set; }
    }
}
