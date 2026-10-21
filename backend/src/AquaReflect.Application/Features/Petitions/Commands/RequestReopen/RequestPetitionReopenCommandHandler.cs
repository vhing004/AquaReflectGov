using System.Security.Cryptography;
using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Domain.Entities;
using AquaReflect.Domain.Enums;
using AquaReflect.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AquaReflect.Application.Features.Petitions.Commands.RequestReopen;

public class RequestPetitionReopenCommandHandler : IRequestHandler<RequestPetitionReopenCommand, RequestPetitionReopenResultDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly INotificationService _notificationService;
    private readonly ILogger<RequestPetitionReopenCommandHandler> _logger;

    public RequestPetitionReopenCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        INotificationService notificationService,
        ILogger<RequestPetitionReopenCommandHandler> logger)
    {
        _context = context;
        _currentUser = currentUser;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<RequestPetitionReopenResultDto> Handle(RequestPetitionReopenCommand request, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra đầu vào
        if (string.IsNullOrWhiteSpace(request.TrackingCode))
            throw new BadRequestException("Mã tra cứu hồ sơ không được để trống.");

        if (string.IsNullOrWhiteSpace(request.Reason) || request.Reason.Trim().Length < 10)
            throw new BadRequestException("Vui lòng nêu rõ lý do đề nghị xem xét lại hồ sơ (tối thiểu 10 ký tự).");

        var normalizedCode = request.TrackingCode.Trim().ToUpperInvariant().TrimStart('#');

        // 2. Tải hồ sơ
        var petition = await _context.Petitions
            .Include(p => p.Feedback)
            .FirstOrDefaultAsync(p => p.TrackingCode == normalizedCode && !p.IsDeleted, cancellationToken);

        if (petition == null)
            throw new NotFoundException($"Không tìm thấy hồ sơ phản ánh với mã '{request.TrackingCode}'.");

        // 3. Kiểm tra trạng thái hồ sơ: Phải đã Closed hoặc Resolved
        if (petition.Status != PetitionStatus.Closed && petition.Status != PetitionStatus.Resolved)
        {
            throw new BadRequestException("Chỉ có thể gửi đề nghị xem xét lại khi hồ sơ đã hoàn tất xử lý (Closed/Resolved).");
        }

        // 4. Kiểm tra điểm CSAT: Điểm phải <= 2 sao
        var score = petition.CsatScore ?? petition.Feedback?.Rating;
        if (!score.HasValue)
        {
            throw new BadRequestException("Hồ sơ chưa được gửi đánh giá mức độ hài lòng (CSAT). Bạn cần gửi đánh giá trước khi đề nghị xem xét lại.");
        }

        if (score.Value > 2)
        {
            throw new BadRequestException($"Đánh giá hiện tại của bạn là {score.Value} sao. Đề nghị xem xét lại chỉ áp dụng cho hồ sơ có mức độ hài lòng không vượt quá 2 sao.");
        }

        // 5. Kiểm tra ReopenCount == 0 (Chỉ mở lại tối đa 1 lần)
        if (petition.ReopenCount > 0)
        {
            throw new BadRequestException("Hồ sơ này đã được mở lại xem xét trước đó. Theo quy định, mỗi hồ sơ chỉ được mở lại xem xét tối đa 1 lần. Bạn có thể nộp đơn khiếu nại chính thức theo hướng dẫn hành chính.");
        }

        // 6. Kiểm tra ReopenStatus: Chưa có yêu cầu hoặc None
        if (petition.ReopenStatus == ReopenStatus.Requested)
        {
            throw new BadRequestException("Yêu cầu xem xét lại hồ sơ của bạn đã được tiếp nhận và đang trong quá trình cán bộ điều phối duyệt.");
        }

        // 7. Kiểm tra thời hạn 14 ngày
        var now = DateTime.UtcNow;
        var referenceCloseDate = petition.ClosedAt ?? petition.ResolvedAt;
        if (!referenceCloseDate.HasValue || (now - referenceCloseDate.Value).TotalDays > 14)
        {
            throw new BadRequestException("Thời hạn đề nghị xem xét lại (14 ngày kể từ khi kết thúc/đóng hồ sơ) đã hết hiệu lực. Bạn vui lòng nộp hồ sơ phản ánh mới hoặc gửi khiếu nại văn bản.");
        }

        // 8. Xác thực người gửi nếu là đơn vô danh / định danh
        if (petition.IsAnonymous)
        {
            if (!string.IsNullOrWhiteSpace(petition.AccessPinHash))
            {
                if (string.IsNullOrWhiteSpace(request.AccessPin))
                    throw new BadRequestException("Đơn phản ánh ẩn danh yêu cầu mã PIN bảo mật để xác nhận quyền đề nghị xem xét lại.");

                var inputPinHash = HashPin(request.AccessPin.Trim());
                if (!CryptographicOperations.FixedTimeEquals(
                        System.Text.Encoding.UTF8.GetBytes(inputPinHash),
                        System.Text.Encoding.UTF8.GetBytes(petition.AccessPinHash)))
                {
                    throw new BadRequestException("Mã PIN bảo mật không chính xác.");
                }
            }
        }
        else
        {
            if (_currentUser.IsAuthenticated && _currentUser.UserId.HasValue)
            {
                var isOwner = petition.CreatedBy == _currentUser.UserId.Value.ToString();
                var isStaff = _currentUser.Role == UserRole.Dispatcher || _currentUser.Role == UserRole.SuperAdmin;
                if (!isOwner && !isStaff)
                {
                    throw new ForbiddenException("Bạn không phải chủ sở hữu hồ sơ phản ánh này.");
                }
            }
        }

        // 9. Cập nhật hồ sơ
        petition.ReopenReason = request.Reason.Trim();
        petition.ReopenStatus = ReopenStatus.Requested;
        petition.ReopenedAt = now;
        petition.UpdatedAt = now;

        // Lưu vết lịch sử
        var history = new PetitionHistory
        {
            PetitionId = petition.Id,
            Action = "Đề nghị xem xét lại hồ sơ (CSAT ≤ 2 sao)",
            FromStatus = petition.Status,
            ToStatus = petition.Status,
            Note = $"Lý do đề nghị xem xét lại: {petition.ReopenReason}",
            PerformedByName = petition.IsAnonymous ? "Công dân (Ẩn danh)" : (petition.CitizenName ?? "Công dân"),
            CreatedAt = now
        };

        _context.PetitionHistories.Add(history);
        await _context.SaveChangesAsync(cancellationToken);

        // 10. Gửi thông báo tới Dispatcher qua SignalR
        try
        {
            await _notificationService.NotifyPetitionStatusChangedAsync(
                petition,
                petition.Status,
                petition.Status,
                $"Công dân gửi đề nghị xem xét lại hồ sơ {petition.TrackingCode} (CSAT: {score.Value}★). Lý do: {petition.ReopenReason}",
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Lỗi khi gửi thông báo SignalR cho yêu cầu xem xét lại hồ sơ {TrackingCode}", petition.TrackingCode);
        }

        _logger.LogInformation(
            "Yêu cầu xem xét lại hồ sơ {TrackingCode} đã được ghi nhận (CSAT: {Score}★)",
            normalizedCode, score.Value);

        return new RequestPetitionReopenResultDto
        {
            PetitionId = petition.Id,
            TrackingCode = normalizedCode,
            RequestedAt = now,
            Message = "Đề nghị xem xét lại hồ sơ của bạn đã được gửi thành công tới Bộ phận Tiếp nhận & Phân loại để thẩm duyệt."
        };
    }

    private static string HashPin(string pin)
    {
        var bytes = System.Text.Encoding.UTF8.GetBytes(pin);
        var hash = SHA256.HashData(bytes);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}
