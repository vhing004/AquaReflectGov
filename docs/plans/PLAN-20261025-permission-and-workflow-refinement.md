# Kế Hoạch Triển Khai: Tinh Chỉnh Phân Quyền, Kênh Trao Đổi Nghiệp Vụ & Hiển Thị Hồ Sơ Công Dân

> **Task ID**: `TASK-PERMISSION-AND-WORKFLOW-REFINEMENT`  
> **Ngày lập plan**: 25/10/2026  
> **Trạng thái**: Đã hoàn thành (Done)  

---

## 1. Bối Cảnh & Mục Tiêu

Dựa trên yêu cầu nghiệp vụ thực tế quản lý phản ánh kiến nghị ngành Thủy sản, hệ thống cần chuẩn hóa phân quyền chặt chẽ giữa 3 nhóm đối tượng:
1. **Cán bộ tiếp nhận / Điều phối (`Dispatcher`, `SuperAdmin`)**: Tiếp nhận ban đầu, điều phối về đơn vị, theo dõi tiến độ toàn cục và đóng/luân chuyển hồ sơ.
2. **Trưởng đơn vị (`Specialist` + `IsUnitLead = true`)**: Điều phối công việc cho cán bộ cấp dưới trong đơn vị, duyệt nghiệm thu thực địa, trao đổi điều phối với cán bộ tiếp nhận.
3. **Cán bộ thụ lý / Chuyên viên xử lý (`Specialist` + `IsUnitLead = false`)**: Trực tiếp nhận nhiệm vụ được giao, bấm bắt đầu thẩm tra thực địa, phối hợp nội bộ đơn vị, nộp báo cáo nghiệm thu.
4. **Công dân có tài khoản (`Citizen`)**: Khi truy cập trang tra cứu, hệ thống tự động hiển thị danh sách toàn bộ phản ánh của cá nhân mà không cần tự nhập lại mã tra cứu hay số điện thoại.

---

## 2. Chi Tiết 5 Yêu Cầu & Giải Pháp Kỹ Thuật

### 2.1 Yêu cầu 1: Kênh Trao Đổi Nghiệp Vụ Nội Bộ Phân Cấp (Đơn Vị vs Liên Đơn Vị)
- **Vấn đề**: Hiện tại kênh nội bộ (`InternalThreadPanel`) chỉ có 1 luồng chat chung cho hồ sơ.
- **Giải pháp**:
  - Tách bạch 2 phạm vi trao đổi trên chi tiết hồ sơ:
    1. **Kênh trao đổi Nội bộ Đơn vị**: Dành riêng cho Trưởng đơn vị và các Cán bộ thành viên trong đơn vị phụ trách hồ sơ đó (ví dụ: Đội Kiểm ngư thảo luận nghiệp vụ nội bộ giải quyết vụ việc). Cán bộ đơn vị khác không có quyền truy cập.
    2. **Kênh trao đổi Điều phối / Liên đơn vị**: Dành cho Trưởng phòng/Trưởng đơn vị giao tiếp, báo cáo và phối hợp với Cán bộ Tiếp nhận (`Dispatcher`) và Quản trị viên (`SuperAdmin`). Cán bộ thụ lý thông thường không hiển thị/không can thiệp vào kênh điều phối cấp phòng này.
  - Cập nhật giao diện `InternalThreadPanel` / Tab trao đổi: hỗ trợ tab hoặc phân tách rõ ràng phạm vi "Nội bộ Đơn vị" và "Điều phối Chung", lưu trữ đầy đủ nội dung theo từng hồ sơ/nhiệm vụ.

### 2.2 Yêu cầu 2: Ẩn Khối "Văn Bản Kết Luận & Quyết Định Xử Lý" Khi Chưa Nghiệm Thu
- **Vấn đề**: Hiện tại khối kết luận hiển thị mọi lúc (ngay cả khi hồ sơ mới tiếp nhận hoặc đang thẩm tra) và hiển thị nút "Ban hành kết luận ngay" cho mọi người.
- **Giải pháp**:
  - Khối "Văn Bản Kết Luận & Quyết Định Xử Lý" **CHỈ hiển thị** khi hồ sơ đã hoàn tất bước nghiệm thu thực địa:
    - Điều kiện hiển thị: `petition.inspectionReportApprovedAt != null` HOẶC trạng thái hồ sơ đã chuyển sang `Resolved (5)` / `Closed (6)`.
    - Khi hồ sơ đang ở các bước trước (`Submitted`, `Assigned`, `Investigating`, `PendingApproval`): ẩn hoàn toàn khối này hoặc hiển thị thông báo trạng thái "Hồ sơ đang trong quá trình thụ lý và nghiệm thu thực địa, chưa đủ điều kiện ban hành kết luận".
  - Phân quyền ban hành/chỉnh sửa kết luận: Chỉ Trưởng đơn vị (`isUnitLead`) phụ trách đơn vị đó hoặc `SuperAdmin`. Cán bộ thụ lý thông thường và cán bộ khác đơn vị sẽ bị ẩn hoàn toàn các nút thao tác văn bản kết luận.

### 2.3 Yêu cầu 3: Nút "Bắt Đầu Thẩm Tra" Chỉ Xuất Hiện Ở Nhân Viên Xử Lý Được Giao
- **Vấn đề**: Hiện tại nút "Bắt đầu thẩm tra" (`canBeginInvestigation`) hiển thị cho toàn bộ cán bộ trong phòng ban, kể cả khi Trưởng đơn vị chưa giao cho ai hoặc chính Trưởng đơn vị đang xem.
- **Giải pháp**:
  - Chuẩn hóa điều kiện `canBeginInvestigation`:
    1. Trạng thái hồ sơ phải là `Assigned` (2).
    2. Hồ sơ **đã được Trưởng đơn vị phân công** cho cán bộ cụ thể: `petition.assignedUserId != null`.
    3. Người dùng đăng nhập **chính là Cán bộ được phân công**: `user.id === petition.assignedUserId` (hoặc `SuperAdmin`).
    4. Nếu là Trưởng đơn vị (`user.isUnitLead`) hoặc chuyên viên khác trong đơn vị: **Ẩn nút này** (trừ trường hợp Trưởng đơn vị tự phân công cho chính mình).

### 2.4 Yêu cầu 4: Quyền "Luân Chuyển Trạng Thái" Chỉ Dành Riêng Cho Cán Bộ Tiếp Nhận & Admin
- **Vấn đề**: Nút "Luân chuyển trạng thái" đang xuất hiện ở cả chuyên viên và trưởng đơn vị tại `AdminPetitionsPage.tsx`, `AdminPetitionDetailPage.tsx`, `KanbanCard.tsx`.
- **Giải pháp**:
  - Chức năng "Luân chuyển trạng thái" (`TransitionStatusModal`) là thẩm quyền hành chính chỉ dành riêng cho:
    - `Dispatcher` (Cán bộ Tiếp nhận / Điều phối)
    - `SuperAdmin` (Quản trị viên)
  - Ẩn hoàn toàn nút "Luân chuyển trạng thái" đối với vai trò `Specialist` (bao gồm cả Trưởng đơn vị và Chuyên viên xử lý).
  - Nghiệp vụ của Đơn vị chuyên môn tuân theo quy trình chuẩn:
    - Trưởng đơn vị: dùng nút "Phân công cán bộ", "Duyệt nghiệm thu / Ban hành kết luận".
    - Chuyên viên: dùng nút "Bắt đầu thẩm tra", "Lập biên bản thực địa", "Nộp báo cáo nghiệm thu".

### 2.5 Yêu cầu 5: Tự Động Hiển Thị Danh Sách Phản Ánh Của Công Dân Đã Đăng Nhập Tại Trang Tra Cứu
- **Vấn đề**: Khi công dân có tài khoản (ví dụ `ngudan`) đăng nhập vào trang `/tra-cuu` (`TrackPetitionPage`), trang vẫn để trống ô tìm kiếm và bắt người dùng tự gõ mã hoặc số điện thoại.
- **Giải pháp**:
  - Tại `TrackPetitionPage.tsx`:
    1. Kiểm tra trạng thái đăng nhập từ `useAuthStore`.
    2. Nếu người dùng đã đăng nhập với vai trò `Citizen` (hoặc có thông tin `phoneNumber`):
       - Tự động chuyển sang chế độ danh sách cá nhân và gọi API `getPetitionsByPhone(user.phoneNumber)`.
       - Hiển thị khối giao diện "Phản ánh kiến nghị của tôi" với danh sách thẻ hồ sơ trực quan: Mã biên nhận, Tiêu đề, Ngày gửi, Trạng thái (badge màu chuẩn), Đơn vị xử lý.
       - Khi người dân click vào một hồ sơ trong danh sách, tự động mở chi tiết tiến độ thời gian thực của hồ sơ đó.
    3. Cập nhật seed dữ liệu `ApplicationDbContextSeed.cs`: gán số điện thoại `0909888999` cho một số hồ sơ phản ánh mẫu của tài khoản `ngudan` để khi đăng nhập kiểm thử, công dân thấy ngay danh sách hồ sơ của mình.

---

## 3. Kế Hoạch Triển Khai Chi Tiết

| Bước | Mô tả công việc | File ảnh hưởng |
|---|---|---|
| **Bước 1** | **Cập nhật Backend & Seed dữ liệu**: Gán hồ sơ mẫu cho số điện thoại công dân `0909888999` của `ngudan`. Đảm bảo API `getPetitionsByPhone` và luồng kiểm tra quyền hoạt động chuẩn xác. | `ApplicationDbContextSeed.cs`, `PetitionsController.cs` |
| **Bước 2** | **Chuẩn hóa phân quyền Nút "Bắt đầu thẩm tra" & "Luân chuyển trạng thái"**: Cập nhật logic `canBeginInvestigation` và `canTransition` trên các trang admin. | `AdminPetitionDetailPage.tsx`, `AdminPetitionsPage.tsx`, `KanbanCard.tsx` |
| **Bước 3** | **Ẩn/Hiện Khối "Văn bản kết luận & Quyết định xử lý"**: Chỉ hiển thị khi hồ sơ đã nghiệm thu xong, chỉ hiển thị nút ban hành cho Trưởng đơn vị/Admin. | `AdminPetitionDetailPage.tsx` |
| **Bước 4** | **Phân tách kênh trao đổi nghiệp vụ nội bộ đơn vị và điều phối chung**: Nâng cấp `InternalThreadPanel.tsx` và `AdminPetitionDetailPage.tsx` để hỗ trợ kênh nội bộ đơn vị và kênh điều phối cấp phòng/tiếp nhận. | `InternalThreadPanel.tsx`, `AdminPetitionDetailPage.tsx` |
| **Bước 5** | **Tự động tải & hiển thị danh sách hồ sơ cho công dân đã đăng nhập**: Tích hợp `useAuthStore` vào `TrackPetitionPage.tsx`, hiển thị danh sách phản ánh của tôi. | `TrackPetitionPage.tsx` |
| **Bước 6** | **Kiểm thử & Xác minh**: Chạy `npm run build` trên frontend, `dotnet test` trên backend, xác minh quy trình hoạt động không lỗi. | Frontend & Backend |

---

## 4. Tiêu Chí Hoàn Thành (Definition of Done)

- [ ] Đăng nhập tài khoản chuyên viên được giao việc (`kiemngu_cb`): Thấy nút "Bắt đầu thẩm tra". Cán bộ khác không thấy.
- [ ] Đăng nhập tài khoản trưởng đơn vị (`kiemngu`) hoặc chuyên viên (`kiemngu_cb`): Không thấy nút "Luân chuyển trạng thái" (chỉ tài khoản `admin` và `diepphoi` mới thấy).
- [ ] Khối "Văn bản kết luận & Quyết định xử lý" chỉ xuất hiện khi hồ sơ đã nghiệm thu xong (`inspectionReportApprovedAt != null` hoặc trạng thái `Resolved`).
- [ ] Kênh trao đổi nội bộ hiển thị rõ ràng phạm vi nội bộ đơn vị, lưu trữ đầy đủ nội dung theo hồ sơ.
- [ ] Đăng nhập tài khoản `ngudan`, vào trang `/tra-cuu`: Tự động hiển thị danh sách các hồ sơ phản ánh của công dân.
- [ ] `npm run build` không lỗi TypeScript, `dotnet test` vượt qua 100%.
