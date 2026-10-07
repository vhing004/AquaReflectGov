# Kế Hoạch Tinh Chỉnh Giao Diện Trang Chủ (PLAN-20261007-homepage-ui-refinements)

> **Mục tiêu**: Điều chỉnh bố cục lưới 4 danh mục cùng hàng trên Trang chủ và biến thanh Filter Tab danh mục phản ánh đã giải quyết thành dạng Slider cuộn ngang hiển thị đầy đủ tên chữ (không bị cắt bớt `...`).

---

## 📐 1. Chi Tiết Yêu Cầu & Phương Án Điều Chỉnh

### 1.1 Bố cục 4 Danh Mục Chuyên Ngành cùng một hàng (4 items per row)
- **Hiện trạng**: Đang hiển thị lưới 2 cột (`grid-cols-1 md:grid-cols-2`), khiến 4 danh mục bị chia thành 2 hàng (mỗi hàng 2 item).
- **Điều chỉnh**:
  - Cấu hình lại Grid Layout cho Section Danh mục chuyên ngành: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6`.
  - Giúp 4 danh mục mặc định xuất hiện gọn gàng trên **1 hàng ngang duy nhất** đối với màn hình desktop/laptop (`lg:`).
  - Tối ưu lại chiều cao ảnh thumbnail (`h-36` hoặc `h-32`) và kích thước font chữ tiêu đề/mô tả để Card đạt tỉ lệ hài hòa và vừa vặn khi xếp 4 cột.

### 1.2 Thanh Filter Tab dạng Slider cuộn ngang & Hiển thị Đầy Đủ Tên chữ
- **Hiện trạng**: Tên danh mục dài đang bị cắt ngắn dạng `cat.name.substring(0, 20) + '...'` làm mất chữ, thiếu thông tin.
- **Điều chỉnh**:
  - **Bỏ cắt chữ**: Hiển thị 100% đầy đủ tên danh mục (`{cat.name}`) với style `whitespace-nowrap shrink-0`.
  - **Slider cuộn mượt (Horizontal Scroll Slider Carousel)**:
    - Bọc thanh Filter Tabs trong container hỗ trợ cuộn ngang mượt `flex items-center gap-2.5 overflow-x-auto scrollbar-none py-2 px-1 scroll-smooth`.
    - Thêm 2 nút bấm điều hướng **Mũi tên Mới/Cũ (Scroll Left / Scroll Right buttons)** ở 2 bên thanh Tab slider giúp người dùng dễ dàng bấm trượt sang trái/phải trên desktop.
    - Thêm hiệu ứng fade mờ nhẹ ở 2 cạnh slider để báo hiệu cho người dùng biết còn danh mục phía sau.

---

## 🛠️ 2. File Cần Đăng Ký Chỉnh Sửa

1. `frontend/src/pages/HomePage.tsx`
   - Cập nhật class grid của Section Danh mục (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`).
   - Tinh chỉnh `CATEGORY_IMAGES` / tỉ lệ Card cho 4 cột.
   - Thêm `useRef` cho slider tab bar + 2 nút điều hướng `ChevronLeft` / `ChevronRight`.
   - Bỏ `cat.name.substring(0, 20)` và thay bằng `{cat.name}` hiển thị nguyên vẹn tên danh mục.

---

## 🧪 3. Kế Hoạch Kiểm Thử (Verification Plan)

1. **Kiểm thử Bố cục 4 Danh mục**:
   - Mở Trang chủ trên màn hình Desktop $\rightarrow$ Xác nhận đúng 4 danh mục chính hiển thị trên **1 hàng ngang 4 cột**.
   - Bấm nút "Xem tất cả danh mục" $\rightarrow$ Hiển thị các danh mục tiếp theo xếp đều lưới 4 cột.

2. **Kiểm thử Slider Filter Tabs**:
   - Cuộn xuống phần "Hồ sơ Phản ánh Đã Giải quyết".
   - Kiểm tra tất cả các nút Tab chuyên ngành đều **hiển thị đầy đủ 100% chữ** (không còn dấu `...`).
   - Bấm nút mũi tên sang trái/phải hoặc vuốt trên thiết bị di động $\rightarrow$ Slider cuộn mượt giữa các tab.
