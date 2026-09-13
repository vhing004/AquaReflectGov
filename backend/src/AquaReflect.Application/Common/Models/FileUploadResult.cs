using AquaReflect.Domain.Enums;

namespace AquaReflect.Application.Common.Models;

public class FileUploadResult
{
    public string FileName { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public AttachmentType FileType { get; set; }
}
