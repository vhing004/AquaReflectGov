namespace AquaReflect.Application.Features.Petitions.DTOs;

public class PublicCommentDto
{
    public Guid Id { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsAuthorOfPetition { get; set; }
}
