using MediatR;

namespace AquaReflect.Application.Features.Petitions.Commands.WithdrawPetition;

/// <summary>
/// Lệnh rút phản ánh kiến nghị.
/// - Người dùng định danh: cần cung cấp TrackingCode + kiểm tra quyền sở hữu (CreatedBy).
/// - Người dùng vô danh: cần cung cấp TrackingCode + AccessPin plain-text để xác thực băm.
/// Chỉ cho phép rút khi hồ sơ đang ở trạng thái Submitted hoặc Assigned.
/// </summary>
public class WithdrawPetitionCommand : IRequest<WithdrawPetitionResultDto>
{
    /// <summary>Mã hồ sơ tra cứu (ví dụ: TS-202610-AB3KZ)</summary>
    public string TrackingCode { get; set; } = string.Empty;

    /// <summary>
    /// Mã PIN plain-text (bắt buộc với đơn vô danh).
    /// Server sẽ băm và so sánh với AccessPinHash trong DB.
    /// </summary>
    public string? AccessPin { get; set; }

    /// <summary>Lý do rút đơn (tùy chọn, tối đa 500 ký tự)</summary>
    public string? Reason { get; set; }
}
