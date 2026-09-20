namespace AquaReflect.Application.Features.Petitions.DTOs;

public class PetitionCommentDto
{
    public Guid Id { get; set; }
    public Guid PetitionId { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public Guid? AuthorUserId { get; set; }
    public bool IsInternal { get; set; } = false;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
