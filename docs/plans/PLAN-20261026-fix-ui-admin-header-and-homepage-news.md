# Kế hoạch cải thiện giao diện UI (Admin Buttons, Header User Dropdown & Trang chủ phong cách Báo chí)

- **Mã kế hoạch:** `PLAN-20261026-fix-ui-admin-header-and-homepage-news`
- **Ngày lập:** 26/10/2026
- **Trạng thái:** Đã hoàn thành (Completed)

---

## 1. Yêu cầu & Phân tích hiện trạng

### Yêu cầu 1: Trang Admin
- **Lỗi 1.1**: Các button (Xuất Excel, Xuất PDF, Làm mới...) trên `DashboardPage.tsx` đang bị rớt dòng chữ (xuống dòng) khi màn hình vừa hoặc thanh toolbar hẹp.
- **Lỗi 1.2**: Button "Hồ sơ nghiệp vụ" trên thanh menu (`Navbar.tsx`): khi đang ở trang `/admin/petitions`, nút có nền xanh `#006194`, nhưng icon `<FileText />` được gán cứng class `text-[#006194]`, dẫn đến icon bị trùng màu với background và biến mất hoàn toàn.

### Yêu cầu 2: Toàn hệ thống (Header & Buttons)
- **Lỗi 2.1 (Header)**: Ô hiển thị tên người dùng khi click vào hiện popup dropdown, nhưng khi click chuột ra ngoài (click outside) thì popup không biến mất (thiếu `useRef` và sự kiện lắng nghe click ngoài).
- **Lỗi 2.2 (Buttons)**: Rà soát tất cả các button ở các trang chính (`DashboardPage`, `UnitDashboardPage`, `AdminPetitionsPage`, `AdminPetitionDetailPage`) để đảm bảo luôn có `whitespace-nowrap` và `shrink-0` để không bao giờ bị rớt dòng chữ.

### Yêu cầu 3: Trang Người dân (Trang chủ)
- **Cải tiến phần "Hồ sơ đã giải quyết"**: Thay vì lưới 3 cột đơn điệu kiểu card kỹ thuật, nâng cấp giao diện theo phong cách **Báo chí Chính luận / Cổng thông tấn Chính phủ điện tử (News Editorial / Press Release Portal)**:
  - Header mang phong cách thông tấn minh bạch: *"BẢN TIN MINH BẠCH KẾT QUẢ XỬ LÝ PHẢN ÁNH THỦY SẢN"* kèm huy hiệu kiểm chứng chính thức và ngày phát hành.
  - **Bố cục Báo chí (Editorial Magazine Grid)**:
    - **1 Bài Tiêu Điểm (Lead / Featured Story)**: Chiếm vị trí nổi bật bên trái với hình ảnh hiện trường lớn 16:9, headline đậm nét báo chí, ngày ban hành văn bản, chuyên mục báo điện tử, đoạn trích dẫn kết luận giải quyết của cơ quan có thẩm quyền, huy hiệu hoàn thành sớm/đúng SLA, và nút "Đọc toàn văn kết luận".
    - **Cột Danh Sách Bản Tin (Side News Feed)**: Các tin xử lý tiếp theo được thiết kế dạng card báo chí nằm bên phải kèm ảnh thu nhỏ, tiêu đề tin tức, cơ quan thụ lý, ngày giải quyết và đánh giá hài lòng từ ngư dân.
  - Tạo cảm giác uy tín, chuyên nghiệp, trang trọng như một trang báo chính thống của ngành nông nghiệp & thủy sản.

---

## 2. Kế hoạch triển khai chi tiết

### Bước 1: Sửa `Navbar.tsx`
- Sửa icon nút "Hồ sơ nghiệp vụ": Khi `isActive`, icon có màu `text-white`; khi không active thì màu `text-[#006194]`.
- Thêm `useRef` cho User Dropdown container và dùng `useEffect` bắt sự kiện `mousedown`/`touchstart` trên document để tự động đóng dropdown khi click ra ngoài.

### Bước 2: Chống rớt dòng tất cả các button trên trang Admin
- **`DashboardPage.tsx`**: Thêm `whitespace-nowrap shrink-0` cho các button Xuất Excel, Xuất PDF; bố trí lại toolbar flexbox responsive để không bị co ép rớt chữ.
- **`UnitDashboardPage.tsx`**: Thêm `whitespace-nowrap shrink-0` cho các nút Phân công, Duyệt nghiệm thu, Làm mới.
- **`AdminPetitionsPage.tsx` & `AdminPetitionDetailPage.tsx`**: Đảm bảo các nút tác vụ trên Top Control Bar và trong table đều có `whitespace-nowrap shrink-0`.

### Bước 3: Nâng cấp khu vực "Hồ sơ đã giải quyết" trên `HomePage.tsx` & `ResolvedPetitionCard.tsx`
- Thiết kế lại section "Hồ sơ đã giải quyết" theo layout báo chí hiện đại:
  - Header: Thêm nhãn *"BẢN TIN MINH BẠCH CHÍNH QUYỀN SỐ"*, typography phong cách báo chí.
  - Bố cục 2 phần: **Bài tiêu điểm (Lead News Story)** bên trái và **Danh sách các bản tin xử lý gần nhất (Sub News)** bên phải.
  - Thiết kế card `ResolvedPetitionCard.tsx` hỗ trợ 2 chế độ:
    - `mode="featured"`: Bố cục tin lớn tiêu điểm với ảnh lớn, trích dẫn kết luận, tem quyết định số, badge SLA nổi bật.
    - `mode="compact"` hoặc `mode="editorial"`: Bố cục tin bài báo chí thanh lịch, tiêu đề đậm, hình ảnh sắc nét, font chữ dễ đọc.

---

## 3. Danh sách file thay đổi

| STT | File | Thay đổi chính |
|---|---|---|
| 1 | `frontend/src/components/common/Navbar.tsx` | Đổi màu icon active nút Hồ sơ nghiệp vụ; thêm click outside đóng user dropdown |
| 2 | `frontend/src/pages/DashboardPage.tsx` | Thêm `whitespace-nowrap shrink-0` cho nút Xuất Excel, Xuất PDF, bố trí lại toolbar responsive |
| 3 | `frontend/src/pages/admin/UnitDashboardPage.tsx` | Thêm `whitespace-nowrap shrink-0` cho các button tác vụ |
| 4 | `frontend/src/components/ResolvedPetitionCard.tsx` | Thiết kế lại theo phong cách báo chí editorial (featured + standard layout) |
| 5 | `frontend/src/pages/HomePage.tsx` | Tái cấu trúc section Hồ sơ đã giải quyết theo phong cách Báo chí / Bản tin Thông tấn |

---

## 4. Kịch bản kiểm thử (Verification)
1. Kiểm tra Navbar:
   - Click vào avatar/tên user -> dropdown mở ra; click ra ngoài -> dropdown tự đóng lại.
   - Điều hướng vào trang `/admin/petitions` -> icon tệp văn bản của nút "Hồ sơ nghiệp vụ" đổi thành màu trắng, rõ ràng nổi bật trên nền xanh.
2. Kiểm tra các button Admin:
   - Thu nhỏ cửa sổ trình duyệt (responsive): Nút Xuất Excel, Xuất PDF, Phân công, Duyệt nghiệm thu không bị gãy dòng chữ.
3. Kiểm tra Trang chủ:
   - Phần "Hồ sơ đã giải quyết" hiển thị bài tiêu điểm lớn và danh sách tin bài minh bạch kết quả theo phong cách báo chí chuyên nghiệp.
4. Chạy `npm run build` đảm bảo 0 lỗi.
