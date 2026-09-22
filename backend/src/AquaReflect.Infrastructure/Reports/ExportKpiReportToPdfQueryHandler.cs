using AquaReflect.Application.Features.Dashboard.Queries.GetDashboardKpi;
using AquaReflect.Application.Features.Reports.Queries.ExportKpiReportToPdf;
using MediatR;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace AquaReflect.Infrastructure.Reports;

/// <summary>
/// Handler xuất báo cáo KPI tổng hợp ra file PDF dùng QuestPDF (Community license)
/// </summary>
public class ExportKpiReportToPdfQueryHandler : IRequestHandler<ExportKpiReportToPdfQuery, byte[]>
{
    private readonly IMediator _mediator;

    public ExportKpiReportToPdfQueryHandler(IMediator mediator)
    {
        _mediator = mediator;
    }

    public async Task<byte[]> Handle(ExportKpiReportToPdfQuery request, CancellationToken cancellationToken)
    {
        // Thiết lập license Community (miễn phí) và cấu hình fonts
        QuestPDF.Settings.License = LicenseType.Community;
        QuestPDF.Settings.UseSystemFonts = true;
        QuestPDF.Settings.ThrowOnMissingFontFamilies = false;

        // 1. Lấy dữ liệu KPI từ handler có sẵn
        var report = await _mediator.Send(
            new GetDashboardKpiQuery(request.Days, request.DepartmentId),
            cancellationToken);

        var now = DateTime.Now;
        var periodLabel = request.Days > 0 ? $"{request.Days} ngày gần nhất" : "Toàn bộ thời gian";

        // 2. Tạo tài liệu PDF
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, QuestPDF.Infrastructure.Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontFamily("Lato").FontSize(10));

                // --- HEADER ---
                page.Header().Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(inner =>
                        {
                            inner.Item().Text("SỞ NÔNG NGHIỆP VÀ PHÁT TRIỂN NÔNG THÔN TỈNH CÀ MAU")
                                .FontSize(9).FontColor(Colors.Grey.Medium);
                            inner.Item().Text("CHI CỤC THỦY SẢN – TRUNG TÂM THÔNG TIN NGÀNH")
                                .FontSize(9).FontColor(Colors.Grey.Medium);
                            inner.Item().PaddingTop(4).Text("BÁO CÁO KPI ĐIỀU HÀNH THỦY SẢN")
                                .FontSize(16).Bold().FontColor("#003c5c");
                            inner.Item().Text($"Kỳ báo cáo: {periodLabel}  |  Ngày xuất: {now:dd/MM/yyyy HH:mm}")
                                .FontSize(9).FontColor(Colors.Grey.Medium).Italic();
                        });

                        row.ConstantItem(80).AlignRight().AlignMiddle()
                            .Text("AquaReflect")
                            .FontSize(18).Bold().FontColor("#0284c7");
                    });

                    col.Item().PaddingTop(6).LineHorizontal(1.5f).LineColor("#006194");
                });

                // --- CONTENT ---
                page.Content().PaddingVertical(8).Column(col =>
                {
                    // === SECTION 1: KPI TỔNG QUAN ===
                    col.Item().PaddingBottom(6).Text("I. CHỈ SỐ KPI TỔNG QUAN")
                        .FontSize(12).Bold().FontColor("#006194");

                    col.Item().PaddingBottom(12).Table(table =>
                    {
                        table.ColumnsDefinition(cols =>
                        {
                            cols.RelativeColumn(3);
                            cols.RelativeColumn(1.5f);
                            cols.RelativeColumn(3);
                            cols.RelativeColumn(1.5f);
                        });

                        table.Header(header =>
                        {
                            foreach (var h in new[] { "Chỉ Số", "Giá Trị", "Chỉ Số", "Giá Trị" })
                            {
                                header.Cell().Background("#006194").Padding(5)
                                    .Text(h).FontColor("#ffffff").Bold().FontSize(9);
                            }
                        });

                        var kpi = report.KpiSummary;
                        var rows = new[]
                        {
                            ("Tổng hồ sơ tiếp nhận", kpi.TotalPetitions.ToString(),
                             "Đang xử lý", (kpi.AssignedCount + kpi.InProgressCount).ToString()),
                            ("Đã giải quyết / Đóng", kpi.ResolvedCount.ToString(),
                             "Hồ sơ quá hạn SLA", kpi.OverdueCount.ToString()),
                            ("Tỷ lệ giải quyết đúng hạn", $"{kpi.OnTimeRate}%",
                             "Khẩn cấp chờ xử lý", kpi.UrgentPendingCount.ToString()),
                            ("Thời gian giải quyết TB", $"{kpi.AverageResolutionHours} giờ",
                             "CSAT Hài lòng", $"{report.Satisfaction.AverageRating}★ / {report.Satisfaction.SatisfactionRate}%"),
                        };

                        bool evenRow = false;
                        foreach (var (k1, v1, k2, v2) in rows)
                        {
                            var bg = evenRow ? "#f0f9ff" : "#ffffff";
                            table.Cell().Background(bg).Padding(4).Text(k1).FontSize(9);
                            table.Cell().Background(bg).Padding(4).AlignCenter()
                                .Text(v1).Bold().FontSize(10).FontColor("#003c5c");
                            table.Cell().Background(bg).Padding(4).Text(k2).FontSize(9);
                            table.Cell().Background(bg).Padding(4).AlignCenter()
                                .Text(v2).Bold().FontSize(10).FontColor("#003c5c");
                            evenRow = !evenRow;
                        }
                    });

                    // === SECTION 2: HIỆU SUẤT PHÒNG BAN ===
                    col.Item().PaddingBottom(6).Text("II. HIỆU SUẤT XỬ LÝ THEO PHÒNG BAN")
                        .FontSize(12).Bold().FontColor("#006194");

                    col.Item().PaddingBottom(12).Table(table =>
                    {
                        table.ColumnsDefinition(cols =>
                        {
                            cols.RelativeColumn(3.5f);
                            cols.RelativeColumn(1.2f);
                            cols.RelativeColumn(1.2f);
                            cols.RelativeColumn(1.2f);
                            cols.RelativeColumn(1.4f);
                            cols.RelativeColumn(1.5f);
                        });

                        table.Header(header =>
                        {
                            foreach (var h in new[] { "Phòng Ban", "Được Giao", "Đã Xử Lý", "Quá Hạn", "Tỷ Lệ SLA", "TB Giải Quyết" })
                            {
                                header.Cell().Background("#006194").Padding(5)
                                    .Text(h).FontColor("#ffffff").Bold().FontSize(8).AlignCenter();
                            }
                        });

                        bool evenRow = false;
                        foreach (var dept in report.DepartmentPerformance)
                        {
                            var bg = evenRow ? "#f0f9ff" : "#ffffff";
                            var slaColorStr = dept.OnTimeRate >= 90 ? "#16a34a" : dept.OnTimeRate >= 70 ? "#d97706" : "#dc2626";
                            var overdueColorStr = dept.OverdueCount > 0 ? "#dc2626" : "#000000";

                            table.Cell().Background(bg).Padding(4).Text(dept.DepartmentName).FontSize(8);
                            table.Cell().Background(bg).Padding(4).AlignCenter().Text(dept.TotalAssigned.ToString()).FontSize(8);
                            table.Cell().Background(bg).Padding(4).AlignCenter().Text(dept.ResolvedCount.ToString()).FontSize(8);
                            table.Cell().Background(bg).Padding(4).AlignCenter()
                                .Text(dept.OverdueCount.ToString()).FontSize(8).FontColor(overdueColorStr);
                            table.Cell().Background(bg).Padding(4).AlignCenter()
                                .Text($"{dept.OnTimeRate}%").FontSize(8).Bold().FontColor(slaColorStr);
                            table.Cell().Background(bg).Padding(4).AlignCenter()
                                .Text($"{dept.AverageResolutionHours}h").FontSize(8);
                            evenRow = !evenRow;
                        }
                    });

                    // === SECTION 3: PHÂN BỔ CHUYÊN MỤC ===
                    col.Item().PaddingBottom(6).Text("III. PHÂN BỔ THEO CHUYÊN MỤC")
                        .FontSize(12).Bold().FontColor("#006194");

                    col.Item().PaddingBottom(12).Table(table =>
                    {
                        table.ColumnsDefinition(cols =>
                        {
                            cols.RelativeColumn(4);
                            cols.RelativeColumn(1.5f);
                            cols.RelativeColumn(1.5f);
                            cols.RelativeColumn(1.5f);
                        });

                        table.Header(header =>
                        {
                            foreach (var h in new[] { "Chuyên Mục", "Số Hồ Sơ", "Tỷ Trọng", "Quá Hạn" })
                            {
                                header.Cell().Background("#006194").Padding(5)
                                    .Text(h).FontColor("#ffffff").Bold().FontSize(9).AlignCenter();
                            }
                        });

                        bool evenRow = false;
                        foreach (var cat in report.CategoryDistribution)
                        {
                            var bg = evenRow ? "#f0f9ff" : "#ffffff";
                            var catOverdueColor = cat.OverdueCount > 0 ? "#dc2626" : "#000000";
                            table.Cell().Background(bg).Padding(4).Text(cat.CategoryName).FontSize(9);
                            table.Cell().Background(bg).Padding(4).AlignCenter().Text(cat.Count.ToString()).FontSize(9).Bold();
                            table.Cell().Background(bg).Padding(4).AlignCenter().Text($"{cat.Percentage}%").FontSize(9);
                            table.Cell().Background(bg).Padding(4).AlignCenter()
                                .Text(cat.OverdueCount.ToString()).FontSize(9).FontColor(catOverdueColor);
                            evenRow = !evenRow;
                        }
                    });

                    // === SECTION 4: ĐÁNH GIÁ HÀI LÒNG ===
                    if (report.Satisfaction.RecentFeedbacks.Count > 0)
                    {
                        col.Item().PaddingBottom(6).Text("IV. Ý KIẾN ĐÁNH GIÁ GẦN ĐÂY")
                            .FontSize(12).Bold().FontColor("#006194");

                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(cols =>
                            {
                                cols.RelativeColumn(1.5f);
                                cols.RelativeColumn(3.5f);
                                cols.RelativeColumn(1f);
                                cols.RelativeColumn(3f);
                            });

                            table.Header(header =>
                            {
                                foreach (var h in new[] { "Mã Hồ Sơ", "Tiêu Đề", "Sao", "Ý Kiến" })
                                {
                                    header.Cell().Background("#006194").Padding(5)
                                        .Text(h).FontColor("#ffffff").Bold().FontSize(8);
                                }
                            });

                            bool evenRow = false;
                            foreach (var fb in report.Satisfaction.RecentFeedbacks)
                            {
                                var bg = evenRow ? "#f0f9ff" : "#ffffff";
                                var fbColorStr = fb.Rating >= 4 ? "#16a34a" : "#d97706";
                                table.Cell().Background(bg).Padding(4).Text(fb.TrackingCode).FontSize(8);
                                table.Cell().Background(bg).Padding(4).Text(fb.PetitionTitle).FontSize(8);
                                table.Cell().Background(bg).Padding(4).AlignCenter()
                                    .Text(fb.Rating.ToString()).FontSize(9).Bold().FontColor(fbColorStr);
                                table.Cell().Background(bg).Padding(4)
                                    .Text(string.IsNullOrEmpty(fb.Comment) ? "—" : fb.Comment).FontSize(8)
                                    .FontColor("#374151");
                                evenRow = !evenRow;
                            }
                        });
                    }
                });

                // --- FOOTER ---
                page.Footer().PaddingTop(4).BorderTop(0.5f).BorderColor(Colors.Grey.Lighten2).Row(row =>
                {
                    row.RelativeItem()
                        .Text($"AquaReflect Gov – Hệ thống giám sát thủy sản Cà Mau  |  Xuất lúc {now:HH:mm dd/MM/yyyy}")
                        .FontSize(8).FontColor(Colors.Grey.Medium);
                    row.ConstantItem(60).AlignRight().Text(text =>
                    {
                        text.Span("Trang ").FontSize(8).FontColor(Colors.Grey.Medium);
                        text.CurrentPageNumber().FontSize(8).FontColor(Colors.Grey.Medium);
                        text.Span(" / ").FontSize(8).FontColor(Colors.Grey.Medium);
                        text.TotalPages().FontSize(8).FontColor(Colors.Grey.Medium);
                    });
                });
            });
        });

        return document.GeneratePdf();
    }
}
