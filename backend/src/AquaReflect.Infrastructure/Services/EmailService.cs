using System.Net;
using System.Net.Mail;
using AquaReflect.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AquaReflect.Infrastructure.Services;

/// <summary>
/// Dịch vụ gửi email tự động với HTML template chuẩn Chính quyền số
/// Hỗ trợ cấu hình SMTP Server linh hoạt hoặc tự động fallback sang Logger an toàn
/// </summary>
public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    private const string BaseEmailStyles = @"
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 24px; text-align: center; color: #ffffff; }
        .header-success { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 24px; text-align: center; color: #ffffff; }
        .header h1, .header-success h1 { margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
        .header p, .header-success p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; }
        .content { padding: 24px; }
        .code-box { background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0; }
        .code-box .label { font-size: 12px; color: #3b82f6; font-weight: bold; text-transform: uppercase; }
        .code-box .code { font-size: 24px; font-weight: 800; color: #1d4ed8; letter-spacing: 1px; margin-top: 4px; }
        .info-table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; }
        .info-table td { padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
        .info-table td.label { color: #64748b; width: 35%; }
        .info-table td.value { font-weight: 600; color: #0f172a; }
        .status-badge { display: inline-block; padding: 6px 14px; background: #dbeafe; color: #1e40af; border-radius: 20px; font-weight: bold; font-size: 14px; }
        .note-box { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 16px 0; border-radius: 0 8px 8px 0; font-size: 14px; }
        .conclusion-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0; }
        .conclusion-box h3 { margin: 0 0 8px 0; color: #166534; font-size: 16px; }
        .conclusion-box p { margin: 0; color: #14532d; font-size: 14px; line-height: 1.6; white-space: pre-line; }
        .btn { display: inline-block; background: #0284c7; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; margin-top: 20px; text-align: center; }
        .btn-green { display: inline-block; background: #16a34a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; margin-top: 20px; text-align: center; }
        .footer { background: #f8fafc; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
    ";

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendPetitionReceivedEmailAsync(
        string recipientEmail,
        string citizenName,
        string trackingCode,
        string petitionTitle,
        DateTime createdAt,
        DateTime? dueDate,
        CancellationToken cancellationToken = default)
    {
        var subject = $"[AquaReflect] Biên nhận tiếp nhận phản ánh kiến nghị #{trackingCode}";
        var trackUrl = $"http://localhost:5173/track?code={trackingCode}";
        var dueDateStr = dueDate.HasValue ? dueDate.Value.ToString("dd/MM/yyyy HH:mm") : "Theo quy định";

        var body = $@"
        <!DOCTYPE html>
        <html lang=""vi"">
        <head>
            <meta charset=""UTF-8"">
            <style>{BaseEmailStyles}</style>
        </head>
        <body>
            <div class=""card"">
                <div class=""header"">
                    <h1>Hệ Thống Phản Ánh Thủy Sản</h1>
                    <p>Sở Nông nghiệp & Phát triển Nông thôn Tỉnh Cà Mau</p>
                </div>
                <div class=""content"">
                    <p>Kính gửi <strong>{citizenName}</strong>,</p>
                    <p>Hệ thống đã tiếp nhận thành công phản ánh kiến nghị của bạn trên Cổng Dịch vụ công Thủy sản (AquaReflect).</p>

                    <div class=""code-box"">
                        <div class=""label"">Mã số hồ sơ tra cứu</div>
                        <div class=""code"">{trackingCode}</div>
                    </div>

                    <table class=""info-table"">
                        <tr>
                            <td class=""label"">Tiêu đề phản ánh:</td>
                            <td class=""value"">{petitionTitle}</td>
                        </tr>
                        <tr>
                            <td class=""label"">Thời điểm tiếp nhận:</td>
                            <td class=""value"">{createdAt:dd/MM/yyyy HH:mm} (Giờ VN)</td>
                        </tr>
                        <tr>
                            <td class=""label"">Hạn cam kết xử lý (SLA):</td>
                            <td class=""value"">{dueDateStr}</td>
                        </tr>
                        <tr>
                            <td class=""label"">Trạng thái hiện tại:</td>
                            <td class=""value""><span style=""color: #0284c7;"">Mới tiếp nhận (Chờ phân công)</span></td>
                        </tr>
                    </table>

                    <div style=""text-align: center; margin-top: 24px;"">
                        <a href=""{trackUrl}"" class=""btn"">Tra Cứu Tiến Độ Trực Tuyến</a>
                    </div>
                </div>
                <div class=""footer"">
                    Email tự động từ hệ thống AquaReflect. Vui lòng không trả lời thư này.<br>
                    Đường dây nóng Chi cục Thủy sản Cà Mau: <strong>(0290) 3838 999</strong>
                </div>
            </div>
        </body>
        </html>";

        await SendEmailAsync(recipientEmail, subject, body, cancellationToken);
    }

    public async Task SendPetitionStatusUpdatedEmailAsync(
        string recipientEmail,
        string citizenName,
        string trackingCode,
        string petitionTitle,
        string previousStatusName,
        string newStatusName,
        string? updateNote,
        CancellationToken cancellationToken = default)
    {
        var subject = $"[AquaReflect] Cập nhật tiến độ xử lý hồ sơ #{trackingCode} -> {newStatusName}";
        var trackUrl = $"http://localhost:5173/track?code={trackingCode}";

        var noteHtml = string.IsNullOrWhiteSpace(updateNote)
            ? string.Empty
            : $@"<div class=""note-box"">
                    <strong>Nội dung thông báo từ cán bộ thụ lý:</strong><br>
                    {updateNote}
                </div>";

        var body = $@"
        <!DOCTYPE html>
        <html lang=""vi"">
        <head>
            <meta charset=""UTF-8"">
            <style>{BaseEmailStyles}</style>
        </head>
        <body>
            <div class=""card"">
                <div class=""header"">
                    <h1>Cập Nhật Tiến Độ Hồ Sơ</h1>
                </div>
                <div class=""content"">
                    <p>Kính gửi <strong>{citizenName}</strong>,</p>
                    <p>Hồ sơ phản ánh kiến nghị mã số <strong>{trackingCode}</strong> của bạn đã được chuyển trạng thái xử lý:</p>

                    <div style=""text-align: center; margin: 16px 0;"">
                        <span style=""color: #64748b;"">{previousStatusName}</span> ➔ <span class=""status-badge"">{newStatusName}</span>
                    </div>

                    {noteHtml}

                    <div style=""text-align: center; margin-top: 24px;"">
                        <a href=""{trackUrl}"" class=""btn"">Xem Chi Tiết Nhật Ký Thụ Lý</a>
                    </div>
                </div>
                <div class=""footer"">
                    Email tự động từ hệ thống AquaReflect. Đường dây nóng: <strong>(0290) 3838 999</strong>
                </div>
            </div>
        </body>
        </html>";

        await SendEmailAsync(recipientEmail, subject, body, cancellationToken);
    }

    public async Task SendPetitionResolutionEmailAsync(
        string recipientEmail,
        string citizenName,
        string trackingCode,
        string petitionTitle,
        string conclusionText,
        string? documentNumber,
        DateTime resolvedAt,
        CancellationToken cancellationToken = default)
    {
        var subject = $"[AquaReflect] Kết quả giải quyết chính thức cho hồ sơ #{trackingCode}";
        var trackUrl = $"http://localhost:5173/track?code={trackingCode}";

        var docNumberHtml = string.IsNullOrWhiteSpace(documentNumber)
            ? string.Empty
            : $"<p><strong>Số hiệu văn bản kết luận:</strong> {documentNumber}</p>";

        var body = $@"
        <!DOCTYPE html>
        <html lang=""vi"">
        <head>
            <meta charset=""UTF-8"">
            <style>{BaseEmailStyles}</style>
        </head>
        <body>
            <div class=""card"">
                <div class=""header-success"">
                    <h1>Thông Báo Kết Quả Giải Quyết</h1>
                    <p>Hồ sơ phản ánh đã hoàn thành xử lý</p>
                </div>
                <div class=""content"">
                    <p>Kính gửi <strong>{citizenName}</strong>,</p>
                    <p>Cơ quan chức năng đã ban hành kết luận giải quyết chính thức cho phản ánh kiến nghị <strong>#{trackingCode}</strong> (""{petitionTitle}"").</p>

                    {docNumberHtml}

                    <div class=""conclusion-box"">
                        <h3>Nội dung kết luận xử lý:</h3>
                        <p>{conclusionText}</p>
                    </div>

                    <p>Bạn có thể đánh giá mức độ hài lòng đối với quá trình xử lý của cơ quan chức năng trên trang tra cứu trực tuyến.</p>

                    <div style=""text-align: center; margin-top: 24px;"">
                        <a href=""{trackUrl}"" class=""btn-green"">Xem Quyết Định & Đánh Giá Dịch Vụ</a>
                    </div>
                </div>
                <div class=""footer"">
                    Trân trọng cảm ơn sự đóng góp thông tin của quý công dân vì sự phát triển bền vững ngành Thủy sản.<br>
                    Chi cục Thủy sản Tỉnh Cà Mau
                </div>
            </div>
        </body>
        </html>";

        await SendEmailAsync(recipientEmail, subject, body, cancellationToken);
    }

    private async Task SendEmailAsync(
        string recipientEmail,
        string subject,
        string htmlBody,
        CancellationToken cancellationToken)
    {
        var smtpHost = _configuration["EmailSettings:SmtpHost"];
        var smtpPort = _configuration.GetValue<int>("EmailSettings:SmtpPort", 587);
        var smtpUser = _configuration["EmailSettings:SmtpUser"];
        var smtpPass = _configuration["EmailSettings:SmtpPass"];
        var senderEmail = _configuration["EmailSettings:SenderEmail"] ?? "no-reply@aquareflect.gov.vn";
        var senderName = _configuration["EmailSettings:SenderName"] ?? "AquaReflect Cà Mau";

        if (!string.IsNullOrEmpty(smtpHost) && !string.IsNullOrEmpty(smtpUser))
        {
            try
            {
                using var client = new SmtpClient(smtpHost, smtpPort)
                {
                    Credentials = new NetworkCredential(smtpUser, smtpPass),
                    EnableSsl = true
                };

                using var mailMessage = new MailMessage
                {
                    From = new MailAddress(senderEmail, senderName),
                    Subject = subject,
                    Body = htmlBody,
                    IsBodyHtml = true
                };

                mailMessage.To.Add(recipientEmail);
                await client.SendMailAsync(mailMessage, cancellationToken);

                _logger.LogInformation("EmailService: Đã gửi email thành công tới {Recipient} qua SMTP.", recipientEmail);
                return;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "EmailService: Không thể gửi email qua SMTP tới {Recipient}. Chuyển sang ghi log.", recipientEmail);
            }
        }

        // Mock Logger Fallback an toàn khi chưa cấu hình máy chủ SMTP ngoài đời thực
        _logger.LogInformation(
            "=== [MOCK EMAIL SERVICE] ===\nĐến: {Recipient}\nTiêu đề: {Subject}\nThời gian: {Time}\n(Cấu hình 'EmailSettings:SmtpHost' trong appsettings.json để gửi mail thực tế)\n============================",
            recipientEmail, subject, DateTime.UtcNow);

        await Task.CompletedTask;
    }
}
