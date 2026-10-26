# Kế hoạch cải thiện Section "Hồ Sơ Đã Xác Minh & Ban Hành Kết Luận Xử Lý"

- **Mã kế hoạch:** `PLAN-20261026-fix-resolved-petitions-horizontal-layout`
- **Ngày lập:** 26/10/2026
- **Trạng thái:** Đã hoàn thành (Completed)

---

## 1. Yêu cầu & Phân tích hiện trạng

### Vấn đề 1: Khác biệt font chữ và chữ bị cách linh tinh (Letter-spacing)
- **Hiện trạng:**
  - Tiêu đề Section 5 ở [HomePage.tsx](file:///d:/AquaReflect/frontend/src/pages/HomePage.tsx) đang sử dụng class `font-serif` (`font-serif font-black text-slate-950`), trong khi toàn bộ hệ thống web sử dụng font không chân (Sans-serif - Inter/System font). Sự khác biệt này tạo cảm giác lệch tông, không đồng bộ với thiết kế tổng thể.
  - Sub-title và các badge sử dụng `tracking-widest` và `tracking-wider` kết hợp với viết hoa (uppercase), khiến khoảng cách giữa các ký tự bị kéo dãn bất thường ("các chữ bị cách linh tinh").
- **Giải pháp:**
  - Đồng bộ tiêu đề về font sans-serif chuẩn của toàn bộ hệ thống: `font-extrabold text-slate-900 tracking-tight`.
  - Chuẩn hóa khoảng cách chữ (tracking) về giá trị chuẩn (`tracking-normal` hoặc `tracking-tight`), loại bỏ dãn cách chữ quá đà.

### Vấn đề 2: Hiển thị item dạng ngang (Horizontal Card) và giới hạn 4 item tiêu biểu / đánh giá tốt nhất
- **Hiện trạng:**
  - Đang hiển thị 1 bản tin tiêu điểm rất lớn (`variant="featured"`) kết hợp lưới dọc 3 cột (`variant="standard"`), fetch 6 items.
- **Giải pháp:**
  - **Giới hạn số lượng:** Điều chỉnh API fetch & hiển thị đúng **4 item** tiêu biểu nhất hoặc đánh giá tốt nhất.
  - **Thuật toán sắp xếp hiển thị:**
    - Mặc định hoặc khi chọn "Đánh giá hài lòng nhất": Sắp xếp ưu tiên các hồ sơ có điểm đánh giá CSAT cao nhất (`feedbackRating` 5 sao), sau đó đến ngày giải quyết gần nhất.
    - Khi chọn "Mới giải quyết nhất": Sắp xếp theo thời gian ban hành kết luận mới nhất.
    - Cắt lấy chính xác 4 phần tử (`slice(0, 4)`).
  - **Thiết kế Card dạng ngang (`variant="horizontal"`):**
    - Thiết kế lại hoàn toàn thẻ ngang trong [ResolvedPetitionCard.tsx](file:///d:/AquaReflect/frontend/src/components/ResolvedPetitionCard.tsx) để hiển thị đầy đủ, trang trọng:
      - **Bên trái (Ảnh/Thumbnail & Nhãn):** Khối ảnh hiện trường kích thước tối ưu (khoảng `w-36 sm:w-56 h-auto min-h-[140px] sm:min-h-[160px]`), bo góc mượt mà, có badge chuyên mục nổi bật, badge mã hồ sơ `#TS-...` và trạng thái "Đã giải quyết".
      - **Bên phải (Nội dung thông tin):**
        - Dòng tiêu đề bài viết: Font sans chuẩn, đậm, cỡ chữ vừa vặn, hover đổi màu xanh thương hiệu `#006194`, không bị gãy cách chữ.
        - Địa bàn xác minh & Cơ quan giải quyết (Chi cục Thủy sản / Đội kiểm ngư...).
        - Trích dẫn kết luận giải quyết & Số quyết định ban hành (`resolutionDocumentNumber`) trong hộp màu xanh nhạt trang trọng.
        - Thanh chân thẻ (Footer bar): Chỉ số SLA (Thời gian giải quyết, Sớm/Đúng hạn), Đánh giá hài lòng của người dân (sao vàng CSAT), nút xem chi tiết *"Xem toàn văn kết luận & biên bản"*.
    - **Bố cục hiển thị trên HomePage:** 
      - Xếp thành danh sách 4 thẻ ngang toàn chiều rộng (`space-y-4`) phân tách rõ ràng, hoặc lưới 2 cột thẻ ngang (`grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5`).
      - Tùy chọn 4 hàng ngang dọc (`space-y-4`) mang lại trải nghiệm đọc tin tức thông cáo báo chí thoải mái, dễ đọc nhất.

---

## 2. Kế hoạch thay đổi chi tiết

| STT | File cần sửa | Mục đích |
|---|---|---|
| 1 | `frontend/src/pages/HomePage.tsx` | - Sửa tiêu đề Section 5: bỏ `font-serif`, bỏ `tracking-widest`, đồng bộ font chữ chuẩn.<br>- Giới hạn fetch và hiển thị 4 hồ sơ (`limit = 4` và `.slice(0, 4)`).<br>- Sắp xếp ưu tiên hồ sơ đánh giá tốt nhất khi chọn lọc.<br>- Đổi layout danh sách thành 4 thẻ ngang liên tiếp. |
| 2 | `frontend/src/components/ResolvedPetitionCard.tsx` | - Tối ưu và nâng cấp `variant="horizontal"` thành thẻ bản tin ngang cao cấp, đầy đủ thumbnail ảnh, tem số hiệu quyết định, trích dẫn kết luận, sao CSAT, thời gian giải quyết SLA.<br>- Chuẩn hóa typography (font sans, tracking chuẩn, không bị cách chữ linh tinh). |

---

## 3. Kế hoạch kiểm thử (Test Plan)
1. **Kiểm tra trực quan (UI):**
   - Tiêu đề không còn font serif lệch tông, không bị dãn chữ.
   - Hiển thị đúng 4 thẻ dạng ngang với đầy đủ ảnh, trích dẫn kết luận, thời gian giải quyết, số sao hài lòng.
   - Thử nghiệm trên các kích thước màn hình (Mobile, Tablet, Desktop) đảm bảo thẻ ngang co giãn mượt mà.
2. **Kiểm tra Build & Test:**
   - Chạy `npm run build` (`tsc -b && vite build`) đảm bảo 0 lỗi TypeScript.
   - Chạy `dotnet test tests\AquaReflect.UnitTests\AquaReflect.UnitTests.csproj --no-build` đảm bảo 50/50 test cases pass.
