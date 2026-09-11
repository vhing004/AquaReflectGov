namespace AquaReflect.Domain.Common;

public interface IAuditableEntity
{
    public string? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? LastModifiedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
