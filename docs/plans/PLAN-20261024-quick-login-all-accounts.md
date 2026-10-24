# Kế Hoạch Triển Khai: Bổ Sung Toàn Bộ Danh Sách Tài Khoản Đăng Nhập Nhanh 1 Chạm

> **Task ID**: `TASK-QUICK-LOGIN-ALL-ACCOUNTS`  
> **Ngày lập**: 24/10/2026  
> **Trạng thái**: ⏳ Chờ người dùng duyệt (Pending Approval)  
> **Mục tiêu**: Bổ sung đầy đủ 18 tài khoản hệ thống (Admin, Dispatcher, 5 Trưởng đơn vị, 10 Cán bộ chuyên viên, Công dân) vào trang `LoginPage.tsx` với cơ chế 1-click đăng nhập ngay lập tức.

---

## 1. Yêu Cầu & Bối Cảnh Nghiệp Vụ

### 1.1. Thực trạng
- Trang `LoginPage.tsx` hiện chỉ hiển thị 4 nút tài khoản mẫu sơ sài (`admin`, `diepphoi`, `kiemngu`, `ngudan`).
- Khi kiểm thử quy trình phân công 2 tầng (Tiếp nhận ➔ Trưởng đơn vị giao việc ➔ Cán bộ báo cáo ➔ Trưởng đơn vị duyệt ➔ Ban hành), người dùng phải mất nhiều thời gian gõ username/password cho từng vai trò và từng đơn vị khác nhau (`nuoitrong_lead`, `moitruong_lead`, `hatang_cb1`, v.v.).
- Thao tác click hiện tại chỉ mới điền form chứ chưa tự động submit, người dùng vẫn phải bấm thêm nút "Đăng Nhập".

### 1.2. Giải pháp đề xuất
1. **Thiết kế bảng Đăng nhập nhanh đa năng & trực quan** ngay dưới form đăng nhập tại `LoginPage.tsx`:
   - Phân nhóm rõ ràng theo 4 nhóm/tabs hoặc thẻ danh mục:
     1. **Cấp Điều phối & Quản trị**: SuperAdmin (`admin`), Cán bộ Tiếp nhận CCTS (`diepphoi`).
     2. **Trưởng đơn vị (5 Đơn vị)**: `kiemngu` (TTKN), `nuoitrong_lead` (PNTTS), `moitruong_lead` (QLMT), `chatluong_lead` (QLCL), `hatang_lead` (HTCC) — Có gắn huy hiệu ⭐ **Trưởng ĐV**.
     3. **Cán bộ chuyên viên trực tiếp (10 Cán bộ)**: `kiemngu_cb`, `kiemngu_cb2`, `nuoitrong_cb1`, `nuoitrong_cb2`, `moitruong_cb1`, `moitruong_cb2`, `chatluong_cb1`, `chatluong_cb2`, `hatang_cb1`, `hatang_cb2`.
     4. **Người dân**: `ngudan` (Hộ nuôi tôm Đất Mũi).
2. **Cơ chế 1-Click Login (Đăng nhập tức thì)**:
   - Khi bấm vào thẻ tài khoản bất kỳ: Tự động điền tài khoản, mật khẩu và tự động kích hoạt API `login` ngay, chuyển hướng vào hệ thống mà không cần người dùng thao tác thêm nút nào.
   - Hiển thị spinner loading nhẹ nhàng trên tài khoản đang được chọn.

---

## 2. Chi Tiết Danh Sách 18 Tài Khoản Hệ Thống

| Nhóm | Username | Mật khẩu | Họ và tên | Vai trò | Đơn vị |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Quản trị** | `admin` | `Admin@123` | Quản trị viên Hệ thống | `SuperAdmin` | Toàn quyền hệ thống |
| **Tiếp nhận** | `diepphoi` | `Canbo@123` | Trần Thị Mai | `Dispatcher` | Cán bộ Tiếp nhận CCTS |
| **Trưởng ĐV** | `kiemngu` | `Canbo@123` | Lê Hoàng Long (Đội trưởng) | `Specialist` (Lead) | Đội TTCN Thủy sản - Kiểm ngư |
| **Cán bộ** | `kiemngu_cb` | `Canbo@123` | Nguyễn Văn Thụ | `Specialist` | Đội TTCN Thủy sản - Kiểm ngư |
| **Cán bộ** | `kiemngu_cb2` | `Canbo@123` | Trần Minh Tuấn | `Specialist` | Đội TTCN Thủy sản - Kiểm ngư |
| **Trưởng ĐV** | `nuoitrong_lead` | `Canbo@123` | Phạm Thị Hoa (Trưởng phòng) | `Specialist` (Lead) | Phòng Nuôi trồng Thủy sản |
| **Cán bộ** | `nuoitrong_cb1` | `Canbo@123` | Bùi Văn An | `Specialist` | Phòng Nuôi trồng Thủy sản |
| **Cán bộ** | `nuoitrong_cb2` | `Canbo@123` | Lê Thị Lan | `Specialist` | Phòng Nuôi trồng Thủy sản |
| **Trưởng ĐV** | `moitruong_lead` | `Canbo@123` | Ngô Quang Minh (Đội trưởng) | `Specialist` (Lead) | Đội Quản lý Môi trường Nước |
| **Cán bộ** | `moitruong_cb1` | `Canbo@123` | Trần Thị Ngọc | `Specialist` | Đội Quản lý Môi trường Nước |
| **Cán bộ** | `moitruong_cb2` | `Canbo@123` | Phạm Văn Dũng | `Specialist` | Đội Quản lý Môi trường Nước |
| **Trưởng ĐV** | `chatluong_lead` | `Canbo@123` | Huỳnh Thị Thu (Đội trưởng) | `Specialist` (Lead) | Đội Quản lý CL Giống & Thức ăn |
| **Cán bộ** | `chatluong_cb1` | `Canbo@123` | Nguyễn Minh Khải | `Specialist` | Đội Quản lý CL Giống & Thức ăn |
| **Cán bộ** | `chatluong_cb2` | `Canbo@123` | Lê Văn Bình | `Specialist` | Đội Quản lý CL Giống & Thức ăn |
| **Trưởng ĐV** | `hatang_lead` | `Canbo@123` | Đặng Văn Hùng (Đội trưởng) | `Specialist` (Lead) | Đội Hạ tầng Cảng cá & Luồng lạch |
| **Cán bộ** | `hatang_cb1` | `Canbo@123` | Võ Thị Phương | `Specialist` | Đội Hạ tầng Cảng cá & Luồng lạch |
| **Cán bộ** | `hatang_cb2` | `Canbo@123` | Trần Văn Khánh | `Specialist` | Đội Hạ tầng Cảng cá & Luồng lạch |
| **Công dân** | `ngudan` | `Dan@123` | Nguyễn Văn Ngư | `Citizen` | Hộ nuôi tôm Đất Mũi |

---

## 3. Các Bước Triển Khai

1. **Cấu trúc lại giao diện `LoginPage.tsx`**:
   - Mở rộng vùng hiển thị Quick Login với bộ lọc Tab nhanh:
     - `Tất cả` (18 tài khoản)
     - `Lãnh đạo / Trưởng ĐV` (5 Trưởng đơn vị)
     - `Chuyên viên xử lý` (10 cán bộ)
     - `Tiếp nhận & Admin` (2 tài khoản)
     - `Công dân` (1 tài khoản)
   - Mỗi thẻ tài khoản hiển thị: Avatar/Icon theo đơn vị, Tên hiển thị, Vai trò/Chức vụ, Username.
2. **Cập nhật hàm `handleDirectLogin(username, password)`**:
   - Gọi thẳng `authApi.login({ usernameOrEmail, password })`.
   - Lưu thông tin vào store `setAuth(res.data)`.
   - Tự động chuyển trang: Công dân ➔ `/`, Cán bộ/Admin ➔ `/admin/dashboard`.
3. **Kiểm thử**:
   - Build frontend `npm run build` không lỗi.
   - Thử click trực tiếp vào từng tab vai trò.

---

## 4. File Thay Đổi Dự Kiến
- `frontend/src/pages/LoginPage.tsx`

---

## 5. Tiêu Chí Nghiệm Thu (Definition of Done)
- [ ] Giao diện `LoginPage.tsx` hiển thị đầy đủ 18 tài khoản, sắp xếp khoa học, có filter tab dễ tìm.
- [ ] Bấm vào bất kỳ tài khoản nào sẽ tự động đăng nhập ngay lập tức.
- [ ] `npm run build` thành công, không phát sinh lỗi TypeScript.
- [ ] Cập nhật `docs/PROJECT_PLAN.md` và git commit/push sau khi hoàn thành.
