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

    /// <summary>Số lượng kết quả tối đa (dùng khi không dùng Page/PageSize)</summary>
    public int Limit { get; set; } = 6;

    /// <summary>Từ khóa tìm kiếm (tiêu đề, mã hồ sơ, địa bàn)</summary>
    public string? Keyword { get; set; }

    /// <summary>Trang hiện tại (tùy chọn, bắt đầu từ 1)</summary>
    public int? Page { get; set; }

    /// <summary>Số lượng mỗi trang (tùy chọn, ví dụ: 9 hoặc 12)</summary>
    public int? PageSize { get; set; }
}
