using AquaReflect.Domain.Common;

namespace AquaReflect.Domain.Entities;

/// <summary>
/// Thực thể lưu trữ các cấu hình động của toàn hệ thống (SLA, workflow, giới hạn rate limit)
/// </summary>
public class SystemSetting : BaseEntity
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string GroupName { get; set; } = "General";
    public string? Description { get; set; }
}
