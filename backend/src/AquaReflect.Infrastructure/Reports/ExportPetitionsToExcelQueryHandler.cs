using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Features.Reports.Queries.ExportPetitionsToExcel;
using AquaReflect.Domain.Enums;
using ClosedXML.Excel;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AquaReflect.Infrastructure.Reports;

/// <summary>
/// Handler xuất danh sách phản ánh kiến nghị ra file Excel (.xlsx) dùng ClosedXML
/// </summary>
public class ExportPetitionsToExcelQueryHandler : IRequestHandler<ExportPetitionsToExcelQuery, byte[]>
{
    private readonly IApplicationDbContext _context;

    public ExportPetitionsToExcelQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<byte[]> Handle(ExportPetitionsToExcelQuery request, CancellationToken cancellationToken)
    {
        // 1. Xây dựng query lọc dữ liệu
        var query = _context.Petitions
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Department)
            .Include(p => p.AssignedUser)
            .Where(p => !p.IsDeleted);

        if (request.StartDate.HasValue)
            query = query.Where(p => p.CreatedAt >= request.StartDate.Value.ToUniversalTime());

        if (request.EndDate.HasValue)
            query = query.Where(p => p.CreatedAt <= request.EndDate.Value.ToUniversalTime().AddDays(1));

        if (request.DepartmentId.HasValue)
            query = query.Where(p => p.DepartmentId == request.DepartmentId.Value);

        if (request.Status.HasValue)
            query = query.Where(p => p.Status == request.Status.Value);

        var petitions = await query
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);

        var now = DateTime.Now;

        // 2. Tạo Workbook Excel
        using var workbook = new XLWorkbook();

        // === SHEET 1: Danh sách hồ sơ ===
        var ws = workbook.Worksheets.Add("Danh Sách Hồ Sơ");

        // Tiêu đề báo cáo
        ws.Range("A1:J1").Merge().Value = "DANH SÁCH PHẢN ÁNH KIẾN NGHỊ THỦY SẢN TỈNH CÀ MAU";
        ws.Cell("A1").Style.Font.Bold = true;
        ws.Cell("A1").Style.Font.FontSize = 14;
        ws.Cell("A1").Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        ws.Cell("A1").Style.Font.FontColor = XLColor.FromHtml("#003c5c");

        ws.Range("A2:J2").Merge().Value = $"Ngày xuất: {now:dd/MM/yyyy HH:mm}  |  Tổng số hồ sơ: {petitions.Count}";
        ws.Cell("A2").Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        ws.Cell("A2").Style.Font.Italic = true;
        ws.Cell("A2").Style.Font.FontSize = 10;

        // Dòng trống
        ws.Row(3).Height = 8;

        // Header cột
        var headers = new[]
        {
            "STT", "Mã Theo Dõi", "Tiêu Đề", "Chuyên Mục", "Phòng Ban Phụ Trách",
            "Trạng Thái", "Ưu Tiên", "Ngày Tiếp Nhận", "Hạn Giải Quyết", "Tình Trạng SLA"
        };

        for (int i = 0; i < headers.Length; i++)
        {
            var cell = ws.Cell(4, i + 1);
            cell.Value = headers[i];
            cell.Style.Font.Bold = true;
            cell.Style.Font.FontColor = XLColor.White;
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#006194");
            cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        }

        // Dữ liệu từng hồ sơ
        for (int i = 0; i < petitions.Count; i++)
        {
            var p = petitions[i];
            var row = i + 5;
            var isEven = (i % 2 == 0);

            var statusText = p.Status switch
            {
                PetitionStatus.Submitted => "Mới tiếp nhận",
                PetitionStatus.Assigned => "Đã phân công",
                PetitionStatus.Investigating => "Đang thẩm tra",
                PetitionStatus.Resolved => "Đã giải quyết",
                PetitionStatus.Rejected => "Từ chối",
                PetitionStatus.Closed => "Đã đóng",
                _ => p.Status.ToString()
            };

            var priorityText = p.PriorityLevel switch
            {
                PriorityLevel.Normal => "Bình thường",
                PriorityLevel.High => "Cao",
                PriorityLevel.Urgent => "Khẩn cấp",
                _ => p.PriorityLevel.ToString()
            };

            // Tính SLA
            string slaText;
            if (p.Status == PetitionStatus.Resolved && p.DueDate.HasValue && p.ResolvedAt.HasValue)
                slaText = p.ResolvedAt <= p.DueDate ? "✓ Đúng hạn" : "✗ Trễ hạn";
            else if (p.DueDate.HasValue && DateTime.UtcNow > p.DueDate.Value &&
                     p.Status != PetitionStatus.Resolved && p.Status != PetitionStatus.Closed)
                slaText = "⚠ Đang quá hạn";
            else if (p.DueDate.HasValue)
                slaText = "◷ Đang xử lý";
            else
                slaText = "—";

            ws.Cell(row, 1).Value = i + 1;
            ws.Cell(row, 2).Value = p.TrackingCode;
            ws.Cell(row, 3).Value = p.Title;
            ws.Cell(row, 4).Value = p.Category?.Name ?? "—";
            ws.Cell(row, 5).Value = p.Department?.Name ?? "Chưa phân công";
            ws.Cell(row, 6).Value = statusText;
            ws.Cell(row, 7).Value = priorityText;
            ws.Cell(row, 8).Value = p.CreatedAt.ToLocalTime().ToString("dd/MM/yyyy");
            ws.Cell(row, 9).Value = p.DueDate.HasValue ? p.DueDate.Value.ToLocalTime().ToString("dd/MM/yyyy") : "—";
            ws.Cell(row, 10).Value = slaText;

            // Màu nền xen kẽ
            var bgColor = isEven ? XLColor.FromHtml("#f0f9ff") : XLColor.White;
            ws.Range(row, 1, row, 10).Style.Fill.BackgroundColor = bgColor;

            // Highlight hồ sơ quá hạn/trễ
            if (slaText.Contains("quá hạn") || slaText.Contains("Trễ"))
            {
                ws.Cell(row, 10).Style.Font.FontColor = XLColor.Red;
                ws.Cell(row, 10).Style.Font.Bold = true;
            }
            else if (slaText.Contains("Đúng"))
            {
                ws.Cell(row, 10).Style.Font.FontColor = XLColor.FromHtml("#16a34a");
            }

            ws.Range(row, 1, row, 10).Style.Border.OutsideBorder = XLBorderStyleValues.Hair;
        }

        // === SHEET 2: Thống kê tóm tắt ===
        var wsSummary = workbook.Worksheets.Add("Thống Kê Tóm Tắt");

        wsSummary.Range("A1:C1").Merge().Value = "TỔNG HỢP THỐNG KÊ";
        wsSummary.Cell("A1").Style.Font.Bold = true;
        wsSummary.Cell("A1").Style.Font.FontSize = 13;
        wsSummary.Cell("A1").Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        wsSummary.Cell("A1").Style.Fill.BackgroundColor = XLColor.FromHtml("#003c5c");
        wsSummary.Cell("A1").Style.Font.FontColor = XLColor.White;

        var total = petitions.Count;
        var resolved = petitions.Count(p => p.Status == PetitionStatus.Resolved || p.Status == PetitionStatus.Closed);
        var onTime = petitions.Count(p =>
            (p.Status == PetitionStatus.Resolved || p.Status == PetitionStatus.Closed) &&
            p.DueDate.HasValue && p.ResolvedAt.HasValue && p.ResolvedAt <= p.DueDate);
        var onTimeRate = resolved > 0 ? Math.Round((double)onTime / resolved * 100, 1) : 0.0;
        var overdue = petitions.Count(p =>
            p.DueDate.HasValue && DateTime.UtcNow > p.DueDate.Value &&
            p.Status != PetitionStatus.Resolved && p.Status != PetitionStatus.Closed);
        var urgent = petitions.Count(p =>
            p.PriorityLevel == PriorityLevel.Urgent &&
            p.Status is PetitionStatus.Submitted or PetitionStatus.Assigned);

        var summaryData = new (string Col1, string Col2, string Col3)[]
        {
            ("Chỉ Số", "Số Lượng", "Ghi Chú"),
            ("Tổng hồ sơ tiếp nhận", total.ToString(), ""),
            ("Đã giải quyết / Đóng", resolved.ToString(), $"{(total > 0 ? Math.Round((double)resolved/total*100,1) : 0)}%"),
            ("Đang xử lý (quá hạn)", overdue.ToString(), "Cần ưu tiên xử lý"),
            ("Giải quyết đúng hạn", onTime.ToString(), $"Tỷ lệ: {onTimeRate}%"),
            ("Khẩn cấp chờ xử lý", urgent.ToString(), ""),
        };

        for (int i = 0; i < summaryData.Length; i++)
        {
            wsSummary.Cell(i + 2, 1).Value = summaryData[i].Col1;
            wsSummary.Cell(i + 2, 2).Value = summaryData[i].Col2;
            wsSummary.Cell(i + 2, 3).Value = summaryData[i].Col3;

            if (i == 0)
            {
                wsSummary.Range(i + 2, 1, i + 2, 3).Style.Font.Bold = true;
                wsSummary.Range(i + 2, 1, i + 2, 3).Style.Fill.BackgroundColor = XLColor.FromHtml("#dbeafe");
            }
        }

        // Auto-fit columns
        ws.Columns(1, 10).AdjustToContents();
        ws.Column(3).Width = 40;
        ws.Column(4).Width = 25;
        ws.Column(5).Width = 30;
        ws.SheetView.FreezeRows(4);

        wsSummary.Columns(1, 3).AdjustToContents();
        wsSummary.Column(1).Width = 35;

        // 3. Xuất ra byte[]
        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }
}
