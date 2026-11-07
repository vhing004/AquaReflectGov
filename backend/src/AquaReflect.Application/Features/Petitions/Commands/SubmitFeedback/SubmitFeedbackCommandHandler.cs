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
    private readonly ICurrentUserService _currentUser;
    private readonly ILogger<SubmitFeedbackCommandHandler> _logger;

    public SubmitFeedbackCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        ILogger<SubmitFeedbackCommandHandler> logger)
    {
        _context = context;
        _currentUser = currentUser;
        _logger = logger;
    }

    public async Task<SubmitFeedbackResultDto> Handle(SubmitFeedbackCommand request, CancellationToken cancellationToken)
    {
        // --- 1. Kiểm tra xác thực đăng nhập ---
        if (!_currentUser.IsAuthenticated || !_currentUser.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("Vui lòng đăng nhập tài khoản công dân để gửi đánh giá chất lượng phục vụ.");
        }

        // --- 2. Kiểm tra vai trò nội bộ: Cán bộ không được tự đánh giá ---
        if (_currentUser.Role.HasValue && 
            (_currentUser.Role.Value == UserRole.Dispatcher || _currentUser.Role.Value == UserRole.Specialist || _currentUser.Role.Value == UserRole.SuperAdmin))
        {
            throw new ForbiddenException("Cán bộ nội bộ không được quyền tự đánh giá hài lòng hoặc can thiệp CSAT của người dân.");
        }

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

        // --- 3. Kiểm tra quyền chính chủ của người gửi phản ánh ---
        var currentUserIdStr = _currentUser.UserId.Value.ToString();
        var currentUsername = _currentUser.Username;

        var userEntity = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == _currentUser.UserId.Value, cancellationToken);

        var currentEmail = _currentUser.Email ?? userEntity?.Email;
        var currentPhone = userEntity?.PhoneNumber;

        bool isOwner = false;
        // 3.1. Khớp UserId, Username hoặc FullName với CreatedBy
        if (!string.IsNullOrWhiteSpace(petition.CreatedBy) &&
            (petition.CreatedBy.Equals(currentUserIdStr, StringComparison.OrdinalIgnoreCase) ||
             (!string.IsNullOrWhiteSpace(currentUsername) && petition.CreatedBy.Equals(currentUsername, StringComparison.OrdinalIgnoreCase)) ||
             (!string.IsNullOrWhiteSpace(userEntity?.FullName) && petition.CreatedBy.Equals(userEntity.FullName, StringComparison.OrdinalIgnoreCase))))
        {
            isOwner = true;
        }
        // 3.2. Khớp họ tên người gửi phản ánh với FullName hoặc Username
        else if (!string.IsNullOrWhiteSpace(petition.CitizenName) &&
                 ((!string.IsNullOrWhiteSpace(userEntity?.FullName) && petition.CitizenName.Trim().Equals(userEntity.FullName.Trim(), StringComparison.OrdinalIgnoreCase)) ||
                  (!string.IsNullOrWhiteSpace(currentUsername) && petition.CitizenName.Trim().Equals(currentUsername.Trim(), StringComparison.OrdinalIgnoreCase))))
        {
            isOwner = true;
        }
        // 3.3. Khớp số điện thoại người dân lúc nộp đơn
        else if (!string.IsNullOrWhiteSpace(petition.CitizenPhone) && !string.IsNullOrWhiteSpace(currentPhone))
        {
            var cleanPhone1 = petition.CitizenPhone.Trim().Replace(" ", "").Replace(".", "").Replace("-", "");
            var cleanPhone2 = currentPhone.Trim().Replace(" ", "").Replace(".", "").Replace("-", "");
            if (cleanPhone1.Length >= 9 && cleanPhone2.Length >= 9 && (cleanPhone1.EndsWith(cleanPhone2) || cleanPhone2.EndsWith(cleanPhone1)))
            {
                isOwner = true;
            }
        }
        // 3.4. Khớp email người dân lúc nộp đơn
        else if (!string.IsNullOrWhiteSpace(petition.CitizenEmail) && !string.IsNullOrWhiteSpace(currentEmail) &&
                 petition.CitizenEmail.Trim().Equals(currentEmail.Trim(), StringComparison.OrdinalIgnoreCase))
        {
            isOwner = true;
        }

        if (!isOwner)
        {
            throw new ForbiddenException(
                "Chỉ tài khoản công dân đã gửi phản ánh này mới có quyền đánh giá chất lượng phục vụ. " +
                "Bạn có thể tham gia đóng góp ý kiến ở phần bình luận bên dưới.");
        }

        // --- Chỉ cho phép đánh giá khi đã Resolved hoặc Closed ---
        if (petition.Status != PetitionStatus.Resolved && petition.Status != PetitionStatus.Closed)
        {
            throw new BadRequestException(
                "Chỉ có thể đánh giá sau khi hồ sơ phản ánh đã được giải quyết. " +
                "Hồ sơ hiện đang trong quá trình xử lý.");
        }

        // --- Kiểm tra thời hạn 14 ngày đánh giá ---
        var referenceCloseDate = petition.ClosedAt ?? petition.ResolvedAt;
        if (referenceCloseDate.HasValue && (DateTime.UtcNow - referenceCloseDate.Value).TotalDays > 14)
        {
            throw new BadRequestException("Thời hạn gửi đánh giá cho hồ sơ này đã kết thúc (tối đa 14 ngày sau khi xử lý xong/đóng hồ sơ).");
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

        // --- Cập nhật CsatScore lên Petition để truy vấn nhanh ---
        petition.CsatScore = request.Rating;

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
