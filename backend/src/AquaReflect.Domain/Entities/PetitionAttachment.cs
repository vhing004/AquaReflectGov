using AquaReflect.Domain.Common;
using AquaReflect.Domain.Enums;

namespace AquaReflect.Domain.Entities;

public class PetitionAttachment : BaseEntity
{
    public Guid PetitionId { get; set; }
    public virtual Petition Petition { get; set; } = null!;

    public string FileName { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public AttachmentType FileType { get; set; } = AttachmentType.Image;
    public string MimeType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string? ThumbnailUrl { get; set; }

    // Trích xuất tọa độ GPS từ ảnh EXIF (nếu chụp trực tiếp tại hiện trường)
    public double? ExifLatitude { get; set; }
    public double? ExifLongitude { get; set; }
}
