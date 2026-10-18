namespace AquaReflect.Application.Features.Petitions.DTOs;

public class CreatePetitionResultDto
{
    public Guid Id { get; set; }
    public string TrackingCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string PriorityLevel { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int DefaultSlaHours { get; set; }
    public DateTime? DueDate { get; set; }
    public string? AddressText { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public bool IsAnonymous { get; set; }
    public string? CitizenName { get; set; }
    public DateTime CreatedAt { get; set; }
    public int AttachmentsCount { get; set; }
    public List<PetitionAttachmentDto> Attachments { get; set; } = new();
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Mã PIN bảo mật plain-text — CHỈ trả về 1 lần duy nhất khi IsAnonymous = true.
    /// Sau khi hiển thị, frontend phải yêu cầu công dân tự lưu; server không bao giờ lưu giá trị này.
    /// </summary>
    public string? AccessPin { get; set; }
}
