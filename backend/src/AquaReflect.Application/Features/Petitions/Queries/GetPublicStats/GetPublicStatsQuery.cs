using AquaReflect.Application.Features.Petitions.DTOs;
using MediatR;

namespace AquaReflect.Application.Features.Petitions.Queries.GetPublicStats;

/// <summary>
/// Query lấy các chỉ số thống kê thực tế công khai hiển thị trên Trang chủ
/// </summary>
public record GetPublicStatsQuery : IRequest<PublicStatsDto>;
