namespace AquaReflect.Application.Common.Interfaces;

/// <summary>
/// Dịch vụ gửi email thông báo tự động tới công dân và cán bộ
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Gửi email biên nhận tiếp nhận hồ sơ mới kèm mã tra cứu và QR
    /// </summary>
    Task SendPetitionReceivedEmailAsync(
        string recipientEmail,
        string citizenName,
        string trackingCode,
        string petitionTitle,
        DateTime createdAt,
        DateTime? dueDate,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gửi email cập nhật tiến độ chuyển trạng thái xử lý
    /// </summary>
    Task SendPetitionStatusUpdatedEmailAsync(
        string recipientEmail,
        string citizenName,
        string trackingCode,
        string petitionTitle,
        string previousStatusName,
        string newStatusName,
        string? updateNote,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gửi email thông báo kết luận giải quyết chính thức
    /// </summary>
    Task SendPetitionResolutionEmailAsync(
        string recipientEmail,
        string citizenName,
        string trackingCode,
        string petitionTitle,
        string conclusionText,
        string? documentNumber,
        DateTime resolvedAt,
        CancellationToken cancellationToken = default);
}
