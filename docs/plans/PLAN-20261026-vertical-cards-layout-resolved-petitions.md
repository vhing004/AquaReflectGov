# Kế hoạch chuyển đổi hiển thị Hồ sơ đã giải quyết sang Thẻ dọc (Vertical Cards) cho 3-4 hồ sơ tốt nhất

- **Mã kế hoạch:** `PLAN-20261026-vertical-cards-layout-resolved-petitions`
- **Ngày lập:** 26/10/2026
- **Trạng thái:** Đã hoàn thành (Completed)

---

## 1. Yêu cầu & Phân tích hiện trạng

- **Yêu cầu từ người dùng:** 
  - Chuyển cách hiển thị của phần "Hồ Sơ Đã Xác Minh & Ban Hành Kết Luận Xử Lý" từ thẻ ngang sang **dạng dọc** (Vertical Card - ảnh ở trên, thông tin kết luận & đánh giá ở dưới).
  - Chỉ hiển thị **3-4 hồ sơ tốt nhất / đánh giá cao nhất**.

- **Phân tích thiết kế:**
  1. **Thẻ dạng dọc (`variant="standard"` trong [ResolvedPetitionCard.tsx](file:///d:/AquaReflect/frontend/src/components/ResolvedPetitionCard.tsx)):**
     - Bố cục thẻ dọc:
       - **Ảnh thumbnail ở trên (tỉ lệ 16:10, chiều cao `h-44`):** Có badge mã hồ sơ `#TS-...`, ngày ban hành, huy hiệu "Đã kết luận" màu xanh ngọc lục bảo.
       - **Phần nội dung ở dưới (`p-5 flex-1 flex flex-col justify-between`):**
         - Nhãn chuyên mục chuẩn màu sắc.
         - Tiêu đề hồ sơ font sans đậm, không dãn chữ.
         - Địa bàn thụ lý & Tên phòng ban / Chi cục Thủy sản.
         - Hộp trích dẫn kết luận giải quyết chính thức (kèm số quyết định nếu có).
         - Đánh giá sao CSAT từ công dân (sao vàng + điểm số).
         - Thời gian giải quyết theo SLA và nút "Xem toàn văn kết luận & biên bản".
       - Thêm `h-full` để các thẻ dọc luôn cao đều nhau tăm tắp trong cùng một hàng.

  2. **Bố cục hiển thị trên [HomePage.tsx](file:///d:/AquaReflect/frontend/src/pages/HomePage.tsx):**
     - Lọc lấy **Top 3 hồ sơ tốt nhất / đánh giá cao nhất**:
       - Mặc định sắp xếp ưu tiên hồ sơ có đánh giá 5 sao từ người dân, kết hợp ngày giải quyết mới nhất (`slice(0, 3)`).
     - **Bố cục lưới 3 cột (Grid Layout 3 Columns):**
       - Lưới `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`: phân bổ 3 thẻ dọc thoáng đãng, cân đối trên mọi kích thước màn hình.
       - Sửa skeleton loading tương ứng (3 thẻ dọc loading).

---

## 2. Kế hoạch thay đổi chi tiết

| STT | File cần sửa | Chi tiết thực hiện |
|---|---|---|
| 1 | `frontend/src/components/ResolvedPetitionCard.tsx` | - Hoàn thiện `variant="standard"` (Thẻ dọc): bổ sung sao đánh giá CSAT nếu có feedback, chuẩn hóa khoảng cách chữ (tracking-wide), đảm bảo `h-full flex flex-col justify-between` để các thẻ bằng nhau. |
| 2 | `frontend/src/pages/HomePage.tsx` | - Cập nhật `displayPetitions` lấy 4 hồ sơ tốt nhất.<br>- Đổi container render sang thẻ dọc `variant="standard"`.<br>- Bố cục lưới `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5` (tự động thích ứng nếu 3 thẻ `lg:grid-cols-3`). |

---

## 3. Kế hoạch kiểm thử (Test Plan)
1. **Kiểm tra trực quan (UI):**
   - Thẻ hiển thị dạng dọc (ảnh trên, text dưới) đồng đều chiều cao.
   - Hiển thị 3-4 hồ sơ có đánh giá cao nhất.
   - Thẻ có đầy đủ hộp trích dẫn kết luận, tem số hiệu quyết định, thời gian giải quyết và sao đánh giá.
2. **Kiểm tra Build & Unit Tests:**
   - `npm run build` (`tsc -b && vite build`) đảm bảo 0 lỗi TypeScript.
   - `dotnet test backend/tests/AquaReflect.UnitTests/AquaReflect.UnitTests.csproj` đảm bảo 50/50 test cases pass.
