namespace AquaReflect.Domain.Enums;

/// <summary>
/// Phân loại kết luận giải quyết phản ánh kiến nghị
/// </summary>
public enum ConclusionType
{
    Valid = 1,                 // Đúng sự thật
    PartiallyValid = 2,        // Đúng một phần
    InsufficientEvidence = 3   // Không đủ căn cứ / Sai sự thật
}
