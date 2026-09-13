namespace AquaReflect.Application.Common.Models;

public class FileUploadModel
{
    public Stream ContentStream { get; set; } = null!;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long Length { get; set; }
}
