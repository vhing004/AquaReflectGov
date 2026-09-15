using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Domain.Entities;
using AquaReflect.Domain.Enums;
using AquaReflect.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AquaReflect.Application.Features.Petitions.Commands.SubmitFeedback;

/// <summary>
/// Xử lý yêu cầu đánh giá chất lượng phục vụ của công dân sau khi hồ sơ phản ánh đã được giải quyết.
/// Mỗi hồ sơ chỉ được đánh giá một lần duy nhất.
/// </summary>
public class SubmitFeedbackCommandHandler : IRequestHandler<SubmitFeedbackCommand, SubmitFeedbackResultDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<SubmitFeedbackCommandHandler> _logger;

    public SubmitFeedbackCommandHandler(IApplicationDbContext context, ILogger<SubmitFeedbackCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<SubmitFeedbackResultDto> Handle(SubmitFeedbackCommand request, CancellationToken cancellationToken)
    {
        // --- Validate input ---
        if (string.IsNullOrWhiteSpace(request.TrackingCode))
            throw new BadRequestException("Mã tra cứu hồ sơ không được để trống.");

        if (request.Rating < 1 || request.Rating > 5)
            throw new BadRequestException("Đánh giá phải từ 1 đến 5 sao.");

        var normalizedCode = request.TrackingCode.Trim().ToUpperInvariant().TrimStart('#');

        // --- Tìm hồ sơ ---
        var petition = await _context.Petitions
            .Include(p => p.Feedback)
            .FirstOrDefaultAsync(p => p.TrackingCode == normalizedCode && !p.IsDeleted, cancellationToken);

        if (petition == null)
            throw new NotFoundException($"Không tìm thấy hồ sơ phản ánh với mã '{request.TrackingCode}'.");

        // --- Chỉ cho phép đánh giá khi đã Resolved hoặc Closed ---
        if (petition.Status != PetitionStatus.Resolved && petition.Status != PetitionStatus.Closed)
        {
            throw new BadRequestException(
                "Chỉ có thể đánh giá sau khi hồ sơ phản ánh đã được giải quyết. " +
                "Hồ sơ hiện đang trong quá trình xử lý.");
        }

        // --- Kiểm tra đã đánh giá chưa ---
        if (petition.Feedback != null)
        {
            throw new BadRequestException(
                "Hồ sơ này đã được đánh giá trước đó. Mỗi hồ sơ chỉ được gửi đánh giá một lần.");
        }

        // --- Tạo đánh giá ---
        var feedback = new CitizenFeedback
        {
            PetitionId = petition.Id,
            Rating = request.Rating,
            Comment = !string.IsNullOrWhiteSpace(request.Comment)
                ? request.Comment.Trim()
                : null,
            FeedbackAt = DateTime.UtcNow
        };

        _context.CitizenFeedbacks.Add(feedback);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Công dân đã gửi đánh giá {Rating} sao cho hồ sơ {TrackingCode} (FeedbackId: {FeedbackId})",
            feedback.Rating, normalizedCode, feedback.Id);

        return new SubmitFeedbackResultDto
        {
            FeedbackId = feedback.Id,
            TrackingCode = normalizedCode,
            Rating = feedback.Rating,
            Comment = feedback.Comment,
            FeedbackAt = feedback.FeedbackAt,
            Message = $"Cảm ơn bạn đã đánh giá {feedback.Rating} sao! Phản hồi của bạn giúp chúng tôi cải thiện chất lượng phục vụ."
        };
    }
}
