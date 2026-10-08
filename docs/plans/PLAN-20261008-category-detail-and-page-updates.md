# Kế Hoạch Nâng Cấp Giao Diện Danh Mục & Trang Chi Tiết Chuyên Ngành (PLAN-20261008-category-detail-and-page-updates)

> **Mục tiêu**: 
> 1. Sửa lỗi Padding phần description card danh mục trên Trang chủ giúp văn bản không bị dính sát lề.
> 2. Xây dựng Trang Chi Tiết Chuyên Ngành (`/categories/:code`) cung cấp thông tin giới thiệu, quy trình xử lý, văn bản pháp lý & đơn vị thụ lý.
> 3. Điều hướng nút "Xem tất cả danh mục & SLA" trên Trang chủ trực tiếp sang trang Danh mục Thủy sản (`/categories`), nâng cấp trang `/categories` hiển thị đồng bộ giao diện như Trang chủ.

---

## 📐 1. Yêu Cầu Chi Tiết & Giải Pháp Thiết Kế

### 1.1 Tối ưu Padding & Điều Hướng Card Danh Mục trên Trang Chủ
- **Sửa padding**: Bọc phần description và nút bấm của Card danh mục trong container `p-4 sm:p-5 flex flex-col justify-between flex-1` giúp văn bản mô tả nằm cách lề cân đối, đẹp mắt.
- **Tương tác click Card**: Khi nhấp vào tiêu đề/ảnh hoặc nút "Xem chi tiết quy trình", người dùng sẽ được chuyển hướng sang trang chi tiết danh mục `/categories/:code`.
- **Bỏ nút Toggle mở rộng tại Trang chủ**: Bỏ nút "Xem tất cả danh mục (X) / Thu gọn" ở cuối section Trang chủ. Thay vào đó, nút "Xem tất cả danh mục & SLA" ở góc trên header sẽ chuyển trực tiếp sang trang `/categories`.

### 1.2 Xây Dựng Trang Chi Tiết Chuyên Ngành (`CategoryDetailPage.tsx`)
- **Đường dẫn**: `/categories/:categoryCode` (Khai báo trong `App.tsx`).
- **Nội dung hiển thị**:
  1. **Hero Banner**:
     - Ảnh bìa chuyên ngành chất lượng cao với hiệu ứng mờ gradient.
     - Badge Mã số chuyên ngành, Tên chuyên ngành, Thời gian cam kết giải quyết (SLA: 24h - 120h).
  2. **Tổng Quan & Phạm Vi Tiếp Nhận**:
     - Giới thiệu chức năng, vai trò quản lý nhà nước của chuyên ngành trong bảo vệ nguồn lợi thủy sản Quản Ngãi.
     - Các trường hợp/hành vi thường gặp cần công dân/ngư dân phản ánh (ví dụ: xả thải kênh rạch, dịch bệnh tôm chết rải rác, tàu cá vi phạm vùng biển, con giống kém chất lượng...).
  3. **Văn Bản Quy Định & Quy Trình Thụ Lý**:
     - Danh mục các văn bản pháp luật căn cứ (Luật Thủy sản, Nghị định quản lý, Thông tư hướng dẫn).
     - Quy trình 4 bước tiếp nhận và xử lý thụ lý chính thức của cơ quan thẩm quyền.
     - Cơ quan/Phòng ban trực tiếp chịu trách nhiệm thụ lý (Chi cục Thủy sản Quản Ngãi, Đồn Biên phòng, Trạm Thú y Thủy sản...).
  4. **Nút Hành Động Nhanh (Call to Action)**:
     - Nút "Nộp hồ sơ phản ánh cho chuyên ngành này" $\rightarrow$ `/submit?category=CODE`.
     - Nút "Tra cứu phản ánh đã xử lý" $\rightarrow$ `/track?category=CODE`.

### 1.3 Nâng Cấp Trang Danh Mục Thủy Sản (`CategoriesPage.tsx`)
- Đồng bộ giao diện Card danh mục tại `/categories` với phong cách thiết kế hiện đại của Trang chủ (Banner ảnh + SLA badge + Description padding đẹp).
- Mỗi Card cung cấp 2 nút hành động:
  1. **"Xem chi tiết & Văn bản quy định"** $\rightarrow$ `/categories/:code`
  2. **"Phản ánh ngay"** $\rightarrow$ `/submit?category=code`

---

## 🛠️ 2. Danh Sách File Cần Tạo & Cập Nhật

### Frontend (React + TypeScript)
1. `src/pages/HomePage.tsx`:
   - Fix padding description card (`p-4 sm:p-5`).
   - Thêm `Link` điều hướng sang `/categories/:code` khi click vào card danh mục.
   - Bỏ nút toggle mở rộng ở cuối section danh mục, chuyển hoàn toàn sang trang `/categories`.
2. `src/pages/CategoryDetailPage.tsx` *(Tạo mới)*:
   - Trang chi tiết thông tin giới thiệu, quy trình xử lý 4 bước, văn bản pháp lý & thông tin đơn vị thụ lý cho từng chuyên ngành.
3. `src/pages/CategoriesPage.tsx`:
   - Cập nhật giao diện danh sách danh mục đẹp mắt tương tự Trang chủ, dẫn sang `/categories/:code`.
4. `src/App.tsx`:
   - Đăng ký Route mới: `<Route path="/categories/:code" element={<CategoryDetailPage />} />`.

---

## 🧪 3. Kế Hoạch Kiểm Thử (Verification Plan)

1. **Kiểm thử Padding & Tương tác Trang chủ**:
   - Kiểm tra phần description trên Card danh mục có khoảng cách padding đều 4 phía, không dính sát lề.
   - Bấm vào Card danh mục $\rightarrow$ Chuyển hướng đúng sang `/categories/O_NHIEM_NUOC` (hoặc các mã tương ứng).
   - Bấm nút "Xem tất cả danh mục & SLA" $\rightarrow$ Chuyển sang `/categories`.
2. **Kiểm thử Trang Chi Tiết Danh Mục (`/categories/:code`)**:
   - Truy cập thử `/categories/VI_PHAM_IUU`, `/categories/O_NHIEM_NUOC`...
   - Kiểm tra thông tin giới thiệu, quy trình 4 bước, văn bản pháp quy và thông tin đơn vị thụ lý hiển thị đầy đủ, chính xác.
   - Bấm "Phản ánh ngay" $\rightarrow$ Chuyển sang form nộp đơn có sẵn danh mục đã chọn.
3. **Kiểm thử Trang Danh Mục (`/categories`)**:
   - Kiểm tra các Card hiển thị đẹp mắt với banner ảnh và nút bấm chuyển sang trang chi tiết.
