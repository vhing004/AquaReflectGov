# Kế Hoạch Tổng Thể Dự Án AquaReflect (PROJECT_PLAN.md)

> Hệ thống Phản ánh & Tiếp nhận Ý kiến Ngư dân / Quản lý Thủy sản Quản Ngãi (AquaReflect)

---

## 📊 Trạng Thái Tổng Quan Các Giai Đoạn

| Giai đoạn | Mô tả | Trạng thái | Ngày hoàn thành | Ghi chú |
| :--- | :--- | :---: | :---: | :--- |
| **Phase 1** | Core Architecture, DB Schema, Authentication & RBAC | ✅ Complete | 2026-10-01 | Web API .NET 9 + React + PostgreSQL |
| **Phase 2** | Tiếp nhận Phản ánh, Quy trình Thụ lý & Tra cứu Public | ✅ Complete | 2026-10-03 | Luồng gửi phản ánh, tracking code, CSAT |
| **Phase 3** | Thông báo Real-time (SignalR) & GIS Bản đồ Không gian | ✅ Complete | 2026-09-22 | Bản đồ Leaflet/PostGIS + WebSocket |
| **Phase 4** | Dashboard KPI, Security Hardening & Docker Containerization | ✅ Complete | 2026-09-23 | Anti-Spam, Rate Limit, Docker Compose |
| **Phase 5** | Tối ưu hóa UI/UX & Nâng cấp Giao diện Trang chủ | 🔄 Active | -- | Tối ưu trải nghiệm cho Ngư dân & Công dân |

---

## 🎯 Chi Tiết Các Task UI/UX & Tính Năng Mới

### ✅ Task 5.1: Nâng cấp Giao diện Trang chủ UI (`PLAN-20261007-homepage-ui-updates`)
- **Ngày hoàn thành**: `2026-10-07`
- **Kết quả đạt được**:
  1. **Danh mục chuyên ngành 4 món**: Mặc định hiển thị 4 danh mục chính với nút Toggle mượt mở rộng/thu gọn danh mục.
  2. **Banner Ảnh Minh Họa Chuyên Ngành**: Tạo và gán bộ ảnh đại diện chất lượng cao cho tất cả danh mục thủy sản/ngư nghiệp.
  3. **Tương tác Cuộn & Lọc Nhanh**: Mỗi Card danh mục tích hợp nút "Xem phản ánh đã xử lý" tự động scroll down mượt và kích hoạt Tab lọc tương ứng.
  4. **Section Hồ sơ Đã Giải quyết Thông minh**:
     - Endpoint API mới: `GET /api/v1/petitions/public-resolved` hỗ trợ lọc theo chuyên mục và sắp xếp theo mới nhất / CSAT hài lòng nhất.
     - Card hiển thị đầy đủ thông tin: Mã tracking, thời gian xử lý thực tế vs SLA, kết luận chính thức của Cán bộ thụ lý, ảnh hiện trường và số sao CSAT kèm comment của người dân.

### ✅ Task 5.2: Tinh chỉnh Giao diện Trang chủ (`PLAN-20261007-homepage-ui-refinements`)
- **Ngày hoàn thành**: `2026-10-07`
- **Kết quả đạt được**:
  1. **Lưới 4 Danh mục Cùng Một Hàng**: Cấu hình `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` giúp 4 danh mục mặc định xếp thành 1 hàng ngang duy nhất trên desktop.
  2. **Slider Tabs Cuộn Ngang & Full Chữ**: Loại bỏ việc cắt bớt chữ (`...`), hiển thị 100% đầy đủ tên danh mục và trang bị slider cuộn mượt kèm 2 nút mũi tên trượt trái/phải (`ChevronLeft` / `ChevronRight`).

### ✅ Task 5.3: Trang Chi Tiết Chuyên Ngành & Nâng Cấp Trang Danh Mục (`PLAN-20261008-category-detail-and-page-updates`)
- **Ngày hoàn thành**: `2026-10-08`
- **Kết quả đạt được**:
  1. **Fix Padding Description Card**: Cấu hình container `p-4 sm:p-5 flex-1` giúp phần mô tả card trên Trang chủ không còn bị sát mép viền.
  2. **Trang Chi Tiết Chuyên Ngành (`/categories/:code`)**: Tạo mới trang `CategoryDetailPage.tsx` tích hợp thông tin giới thiệu, quy trình 4 bước thụ lý, văn bản pháp quy căn cứ và thông tin đơn vị phụ trách.
  3. **Điều hướng Sang Trang Danh Mục (`/categories`)**: Nút "Xem tất cả danh mục & SLA" dẫn thẳng sang `/categories`. Nâng cấp `CategoriesPage.tsx` hiển thị giao diện banner đẹp đồng bộ như Trang chủ.

---

## 🚀 Hướng Phát Triển Nâng Cao (Đề Xuất Phân Tích)

1. **Hiệu năng & Caching**: Tích hợp Redis Caching cho endpoint `public-resolved` và `categories` để giảm tải query DB khi lượng truy cập Trang chủ lớn. (Mức ưu tiên: Trung bình)
2. **Trải nghiệm Người dùng**: Bổ sung hiệu ứng Skeleton Loader khi chuyển giữa các Tab Filter phản ánh trên Trang chủ. (Mức ưu tiên: Thấp)
3. **PWA (Progressive Web App)**: Cấu hình Service Worker giúp ngư dân lưu vết phản ánh và tra cứu offline khi ra khơi. (Mức ưu tiên: Cao)
