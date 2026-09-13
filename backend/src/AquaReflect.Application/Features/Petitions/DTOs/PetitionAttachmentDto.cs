namespace AquaReflect.Application.Features.Petitions.DTOs;

public class PetitionAttachmentDto
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public double? ExifLatitude { get; set; }
    public double? ExifLongitude { get; set; }
}
