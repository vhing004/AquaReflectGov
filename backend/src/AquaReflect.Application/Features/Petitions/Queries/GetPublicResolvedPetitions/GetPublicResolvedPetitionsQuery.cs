using AquaReflect.Application.Features.Petitions.DTOs;
using MediatR;

namespace AquaReflect.Application.Features.Petitions.Queries.GetPublicResolvedPetitions;

/// <summary>
/// Query lấy danh sách hồ sơ phản ánh đã giải quyết công khai (cho Trang chủ)
/// Không yêu cầu đăng nhập, dữ liệu được che mờ thông tin công dân.
/// </summary>
public class GetPublicResolvedPetitionsQuery : IRequest<List<PublicResolvedPetitionDto>>
{
    /// <summary>Lọc theo mã chuyên mục (tùy chọn, ví dụ: VI_PHAM_IUU)</summary>
    public string? CategoryCode { get; set; }

    /// <summary>Sắp xếp: "latest" (mới nhất) hoặc "rating" (đánh giá cao nhất)</summary>
    public string SortBy { get; set; } = "latest";

    /// <summary>Số lượng kết quả tối đa (mặc định: 6, tối đa: 20)</summary>
    public int Limit { get; set; } = 6;
}
