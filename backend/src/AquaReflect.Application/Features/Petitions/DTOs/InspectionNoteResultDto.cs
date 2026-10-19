namespace AquaReflect.Application.Features.Petitions.DTOs;

/// <summary>
/// Kết quả thêm ghi chú nghiệp vụ hiện trường (Task 4.1)
/// </summary>
public class InspectionNoteResultDto
{
    public Guid CommentId { get; set; }
    public Guid PetitionId { get; set; }
    public string TrackingCode { get; set; } = string.Empty;
    public string AuthorName { get; set; } = string.Empty;
    public string NoteContent { get; set; } = string.Empty;
    public string NoteTypeName { get; set; } = string.Empty;
    public double? FieldLatitude { get; set; }
    public double? FieldLongitude { get; set; }
    public int AttachmentsAdded { get; set; }
    public List<PetitionAttachmentDto> Attachments { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public string Message { get; set; } = string.Empty;
}
