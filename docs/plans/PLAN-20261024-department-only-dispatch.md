# Kế Hoạch Triển Khai: Chuẩn Hóa Phân Công Tầng 1 — Chỉ Chọn Đơn Vị Xử Lý

> **Task ID**: `TASK-DEPT-ONLY-DISPATCH`  
> **Ngày lập**: 24/10/2026  
> **Trạng thái**: ✅ Đã hoàn thành (Done)  
> **Tham chiếu quy tắc**: `PHAN_QUYEN_AQUAREFLECTGOV.md`, `PLAN-20261024-unit-team-workflow.md`

---

## 1. Mục Tiêu & Yêu Cầu Nghiệp Vụ

### 1.1. Hiện trạng
- Trong `TransitionStatusModal.tsx`, khi cán bộ tiếp nhận / Điều phối viên (Dispatcher) chuyển trạng thái hồ sơ sang **Đã phân công (`Assigned = 2`)**, giao diện vẫn hiển thị cả mục chọn chuyên viên cụ thể và nút "Tự động phân công cán bộ ít tải nhất".
- Điều này không phản ánh đúng thực tế quản lý: Dispatcher ở cấp tổng hợp không thể và không nên can thiệp vào việc bố trí nhân sự nội bộ của từng phòng ban/chi cục.

### 1.2. Yêu cầu mới
- **Khi phân công (Tầng 1 - Dispatcher)**:
  - Chỉ hiển thị lựa chọn **Đơn vị xử lý** (`departmentId`) như: TT Khuyến nông, Chi cục Quản lý Môi trường, Chi cục Thủy sản & Kiểm ngư...
  - **Ẩn hoàn toàn** danh sách chọn chuyên viên cá nhân (`assignedUserId`) đối với Dispatcher.
  - Khi lưu chuyển trạng thái: Hồ sơ chuyển sang `Assigned (2)` với `DepartmentId = <Đơn vị được chọn>` và `AssignedUserId = null`.
  - Hiển thị thông báo nghiệp vụ rõ ràng: *"Hồ sơ sẽ được chuyển đến Trưởng đơn vị để tiến hành phân công cán bộ chuyên môn trực tiếp thụ lý."*
- **Sau khi bàn giao về đơn vị (Tầng 2 - Trưởng đơn vị)**:
  - Trưởng đơn vị (`IsUnitLead = true`) nhận thông báo SignalR và là người duy nhất thực hiện cử nhân viên phụ trách thông qua `AssignMemberModal` hoặc tại `UnitDashboardPage`.

---

## 2. Các Bước Thực Hiện Chi Tiết

### Bước 1: Điều chỉnh Frontend `TransitionStatusModal.tsx`
1. **Lược bỏ chọn nhân viên khi Dispatcher phân công**:
   - Trong khối `selectedStatus === 2`: Chỉ giữ lại dropdown chọn **Phòng ban / Đơn vị chuyên môn** (`departmentId`) và tính năng gợi ý thông minh theo lĩnh vực thủy sản.
   - Ẩn toàn bộ khối `Smart Officer Workload List & Auto-Assign` đối với vai trò `Dispatcher`.
   - Hiển thị Info Card:
     > ℹ️ **Quy trình phân công 2 tầng**: Đơn vị sau khi tiếp nhận sẽ tự điều phối và cử cán bộ chuyên trách kiểm tra thực tế.
2. **Đảm bảo dữ liệu gửi lên**:
   - Khi chuyển sang `Assigned (2)`, `assignedUserId` luôn gửi lên là `null` hoặc chuỗi rỗng.

### Bước 2: Kiểm tra & Siết chặt Backend `TransitionPetitionStatusCommandHandler.cs`
1. Khi `request.ToStatus == PetitionStatus.Assigned`:
   - Nếu caller là `Dispatcher`: Bắt buộc phải có `DepartmentId`, đồng thời luôn đặt `petition.AssignedUserId = null` để đảm bảo quyền phân công thuộc về Trưởng đơn vị.
   - Ghi audit trail rõ ràng: *"Đã tiếp nhận và bàn giao hồ sơ về đơn vị <Tên đơn vị> chờ phân công cán bộ."*

### Bước 3: Cập nhật Hiển thị tại `AdminPetitionDetailPage.tsx` & `KanbanCard.tsx`
- Khi đơn ở trạng thái `2 - Đã phân công` và chưa có `AssignedUserId`:
  - Hiển thị thông tin người phụ trách: *"Chờ Trưởng đơn vị phân công"* (thay vì để trống hoặc hiện dấu hỏi).
  - Trưởng đơn vị khi xem đơn này sẽ thấy nút nổi bật: **"Phân công cán bộ ngay"**.

---

## 3. Danh Sách File Thay Đổi Dự Kiến

| File | Hành động | Nội dung thay đổi |
| :--- | :--- | :--- |
| `frontend/src/components/admin/TransitionStatusModal.tsx` | Chỉnh sửa | Ẩn danh sách chọn chuyên viên cá nhân khi phân công, chỉ giữ chọn đơn vị; thêm info card hướng dẫn quy trình 2 tầng |
| `backend/src/AquaReflect.Application/Features/Petitions/Commands/TransitionStatus/TransitionPetitionStatusCommandHandler.cs` | Chỉnh sửa | Đảm bảo khi Dispatcher giao việc sang Assigned (2) thì `AssignedUserId` luôn là `null` |
| `frontend/src/pages/AdminPetitionDetailPage.tsx` | Chỉnh sửa | Cập nhật text hiển thị chuyên viên phụ trách khi `status === 2` và `assignedUserId == null` thành *"Chờ Trưởng đơn vị phân công"* |

---

## 4. Kịch Bản Kiểm Thử (Definition of Done)

1. **Test Case 1 (Dispatcher phân công đơn mới)**:
   - Đăng nhập `dispatcher` ➔ Mở hồ sơ mới (`Submitted = 1`).
   - Bấm "Luân chuyển trạng thái" ➔ Chọn `2 - Đã phân công`.
   - **Kỳ vọng**: Giao diện chỉ có dropdown chọn Đơn vị (có gợi ý tự động). Không còn danh sách chuyên viên cá nhân.
   - Bấm xác nhận ➔ Đơn chuyển sang `Assigned`, đơn vị được lưu, chuyên viên là `null`.
2. **Test Case 2 (Trưởng đơn vị nhận đơn và phân công)**:
   - Đăng nhập `lead_xxx` của đơn vị vừa được giao.
   - Mở hồ sơ ➔ Thấy thông báo *"Chờ Trưởng đơn vị phân công"* kèm nút **"Phân công cán bộ"**.
   - Bấm phân công cán bộ `member1_xxx` ➔ Đơn được gắn cán bộ thành công.
3. **Test Case 3 (Kiểm thử hồi quy)**:
   - Chạy `dotnet test backend/tests/AquaReflect.UnitTests/` ➔ 50/50 test cases Passed.
   - Chạy `npm run build` ở frontend ➔ 0 lỗi.
