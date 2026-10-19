# KẾ HOẠCH CHI TIẾT: HOÀN THIỆN TOÀN DIỆN QUY TRÌNH XỬ LÝ PHẢN ÁNH KIẾN NGHỊ (5 BƯỚC)

- **Mã kế hoạch**: `PLAN-20261017-comprehensive-petition-workflow`
- **Mục tiêu**: Nâng cấp toàn diện chu trình xử lý phản ánh kiến nghị từ 6 trạng thái cơ bản lên quy trình hành chính chuẩn hóa đầy đủ 5 bước, hỗ trợ đầy đủ các nhánh ngoại lệ (`NeedInfo`, `Merged`, `Forwarded`, `Withdrawn`), quản lý SLA theo ngày làm việc, bảo mật PIN vô danh, kiểm duyệt đóng đơn và khiếu nại CSAT.
- **Ngày lập**: 17/10/2026
- **Trạng thái**: Chờ duyệt (Pending Approval)

---

## 1. Tổng quan & Phạm vi công việc

Quy trình nâng cấp đảm bảo tính chặt chẽ về mặt pháp lý hành chính, an toàn dữ liệu cá nhân và trải nghiệm người dùng:
1. **Bước 1 (Submitted)**: Tiếp nhận, mã PIN tra cứu bảo mật (SHA-256) cho đơn vô danh, bảo vệ quyền riêng tư, cho phép rút đơn (`Withdrawn`).
2. **Bước 2 (Assigned / Exceptions)**: Phân công hoặc xử lý ngoại lệ: Yêu cầu bổ sung (`NeedInfo` - tạm dừng SLA), Gộp đơn trùng (`Merged`), Chuyển cơ quan (`Forwarded`), Từ chối (`Rejected`).
3. **Bước 3 (Investigating)**: Khảo sát hiện trường, ghi chú nội bộ, yêu cầu bổ sung từ hiện trường, cảnh báo SLA leo thang.
4. **Bước 4 (Resolved)**: Ban hành kết luận phân loại (Đúng / Đúng một phần / Không đủ căn cứ), đính kèm biên bản, chốt mốc thời gian hoàn thành SLA.
5. **Bước 5 (Closed & CSAT Reopen)**: Kiểm duyệt 2 lớp (Dispatcher duyệt đóng hoặc trả về xử lý lại), tự động đóng sau N ngày làm việc, chấm điểm CSAT, đề nghị mở lại đơn nếu CSAT ≤ 2 (tối đa 1 lần).

---

## 2. Phân chia Task theo từng Phase

```
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Database Model, Enum & Core Working Days Engine               │
│ Task 1.1: Mở rộng Enum PetitionStatus & Entity Petition                │
│ Task 1.2: Bảng SystemSettings & HolidayCalendar (Lịch ngày làm việc)   │
│ Task 1.3: Dịch vụ tính toán SLA theo ngày làm việc & đóng băng SLA     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ Phase 2: Nâng cấp Bước 1 - Tiếp nhận, PIN Vô danh & Rút đơn            │
│ Task 2.1: Sinh PIN ngẫu nhiên & Băm SHA-256 cho đơn vô danh            │
│ Task 2.2: Modal hiển thị PIN 1 lần duy nhất trên Cổng nộp đơn          │
│ Task 2.3: Tra cứu bảo mật bằng PIN & Chức năng Rút đơn (Withdrawn)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ Phase 3: Nâng cấp Bước 2 - Phân công & Xử lý ngoại lệ                  │
│ Task 3.1: API & Modal Dispatcher: NeedInfo, Merged, Forwarded, Reject   │
│ Task 3.2: Cơ chế Tạm dừng SLA & Giới hạn số lần NeedInfo               │
│ Task 3.3: Làm tròn tọa độ cấp xã & Bóc tách EXIF ảnh trên bản đồ công   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ Phase 4: Nâng cấp Bước 3 & 4 - Thẩm tra & Ban hành kết luận             │
│ Task 4.1: Chức năng Khảo sát hiện trường & Yêu cầu bổ sung hiện trường │
│ Task 4.2: Ban hành kết luận có cấu trúc (Đúng/Một phần/Không căn cứ)   │
│ Task 4.3: Chốt mốc SLA ResolvedAt & Bắn SignalR chờ duyệt đóng         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ Phase 5: Nâng cấp Bước 5 - Đóng đơn, CSAT, Reopen & Background Jobs    │
│ Task 5.1: Dispatcher duyệt Đóng đơn hoặc Trả về xử lý lại              │
│ Task 5.2: Đánh giá CSAT & Luồng Đề nghị xem xét lại (ReopenCount = 1)  │
│ Task 5.3: Background Jobs (Auto-reject NeedInfo, Auto-close Resolved)  │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Phase 1: Database Model, Enum & Core Working Days Engine
*Mục tiêu: Đặt nền tảng dữ liệu và dịch vụ tính toán thời gian nghiệp vụ.*

- [x] **Task 1.1: Mở rộng `PetitionStatus` & Thuộc tính `Petition` (Hoàn thành 18/10/2026)**
  - Cập nhật enum `PetitionStatus`:
    `Submitted (1)`, `Assigned (2)`, `Investigating (3)`, `Resolved (4)`, `Rejected (5)`, `Closed (6)`, `NeedInfo (7)`, `Merged (8)`, `Forwarded (9)`, `Withdrawn (10)`.
  - Bổ sung trường trong `Petition.cs`:
    - `AccessPinHash` (string? - băm SHA-256 mã PIN đơn vô danh).
    - `DuplicateOfId` (Guid? - khóa ngoại trỏ tới đơn gốc nếu `Merged`) + navigation `DuplicateOf` & `MergedPetitions`.
    - `ForwardToOrganization` (string?), `ForwardReason` (string?).
    - `WithdrawnReason` (string?), `WithdrawnAt` (DateTime?).
    - `NeedInfoReason` (string?), `NeedInfoDeadline` (DateTime?), `NeedInfoCount` (int).
    - `SlaPausedAt` (DateTime?), `TotalSlaPausedMinutes` (double).
    - `ConclusionType` (enum: Valid, PartiallyValid, InsufficientEvidence).
    - `ReopenCount` (int), `ReopenReason` (string?), `ReopenedAt` (DateTime?).
    - `PublicSummary` (string? - tóm tắt hiển thị công khai).
  - Tạo EF Core Migration `ExtendPetitionStatusAndLifecycle` và cập nhật `ApplicationDbContext`.

- [x] **Task 1.2: Quản trị Cấu hình Hệ thống & Lịch Nghỉ lễ (Hoàn thành 18/10/2026)**
  - Tạo entity `SystemSetting` (`Key`, `Value`, `GroupName`, `Description`).
  - Tạo entity `HolidayCalendar` (`HolidayDate`, `Description`, `Year`, `IsRecurringSolar`) phục vụ trừ ngày nghỉ lễ Tết theo quy định nhà nước.
  - Cấu hình mặc định trong `ApplicationDbContextSeed`:
    - SLA khẩn cấp: 2 ngày làm việc; SLA cao: 5 ngày; SLA bình thường: 10 ngày.
    - Hạn chót bổ sung thông tin: 7 ngày làm việc (`Workflow_NeedInfo_Days = 7`).
    - Thời hạn tự động đóng đơn: 5 ngày làm việc (`Workflow_Auto_Close_Days = 5`).
    - Cửa sổ đánh giá CSAT: 14 ngày (`Workflow_Csat_Window_Days = 14`).
    - Giới hạn số lần yêu cầu bổ sung: `Workflow_Max_NeedInfo_Count = 2`.
    - Số lần tối đa mở lại hồ sơ: `Workflow_Max_Reopen_Count = 1`.
    - Giới hạn rate-limit IP: 10 đơn/ngày (`Security_Daily_Rate_Limit_Per_Ip = 10`).
    - Seed 13 ngày nghỉ lễ Tết năm 2026 của Việt Nam.
  - Tạo EF Core Migration `AddSystemSettingsAndHolidayCalendar` và cập nhật `ApplicationDbContext`.

- [x] **Task 1.3: Dịch vụ `WorkingDaysService` & Logic Tạm dừng SLA (Hoàn thành 18/10/2026)**
  - Viết `IWorkingDaysService` & `WorkingDaysService`:
    - `AddWorkingDaysAsync(DateTime startDate, int workingDays)` (bỏ qua Thứ 7, Chủ Nhật và ngày trong `HolidayCalendar`).
    - `GetWorkingDaysBetweenAsync(DateTime start, DateTime end)`.
    - `IsWorkingDayAsync(DateTime date)`.
    - `CalculateDueDateAsync(DateTime startDate, PriorityLevel priority)` dựa trên cấu hình `SystemSettings`.
    - `CalculateEffectiveDueDate(DateTime originalDueDate, double totalSlaPausedMinutes, DateTime? slaPausedAt)` tính bù thời gian tạm dừng SLA ở `NeedInfo`.
    - `EvaluateSlaStatus(DateTime? dueDate, DateTime? resolvedAt, double totalSlaPausedMinutes, DateTime? slaPausedAt)`.
  - Đăng ký DI trong `AquaReflect.Application/DependencyInjection.cs`.
  - Viết bộ unit test `WorkingDaysServiceTests.cs` (6 test cases vượt qua 100%).

---

### Phase 2: Nâng cấp Bước 1 - Tiếp nhận phản ánh, Mã PIN Vô danh & Rút đơn
*Mục tiêu: Bảo mật danh tính công dân, cấp khóa bảo mật tra cứu và quyền rút đơn.*

- [x] **Task 2.1: Backend xử lý đơn vô danh & Rút đơn (Hoàn thành 18/10/2026)**
  - Tại `CreatePetitionCommandHandler`:
    - Nếu `IsAnonymous == true`: Sinh ngẫu nhiên mã PIN 8 ký tự an toàn (`[A-Z0-9]`) bằng `RandomNumberGenerator.GetString` (CSPRNG).
    - Băm PIN bằng `SHA256.HashData` lưu vào `AccessPinHash`.
    - Trả về mã PIN dạng plain-text duy nhất một lần trong response field `AccessPin` của DTO.
    - Thêm message cảnh báo rõ ràng khi `IsAnonymous == true` để frontend hiển thị modal.
  - Tạo `WithdrawPetitionCommand` + `WithdrawPetitionCommandHandler`:
    - Cho phép rút đơn nếu trạng thái là `Submitted` hoặc `Assigned`.
    - Kiểm tra quyền: Người tạo (nếu định danh) hoặc đúng `AccessPin` băm SHA-256 (nếu vô danh).
    - So sánh PIN bằng `CryptographicOperations.FixedTimeEquals` chống timing attack.
    - Chuyển trạng thái sang `Withdrawn`, ghi log `PetitionHistory`, bắn SignalR.
  - Thêm endpoint `POST /petitions/{trackingCode}/withdraw` vào `PetitionsController`.
  - Thêm `WithdrawPetitionRequest` class và `WithdrawPetitionResultDto`.
  - Build: **0 Error**.

- [x] **Task 2.2: Frontend Modal Thông báo PIN Bảo Mật (Submit) — Hoàn thành 18/10/2026**
  - Tạo `AnonymousPinModal.tsx` với UX bảo mật cao:
    - Hiển thị PIN dạng mask `●●●● - ●●●●`, có nút toggle Eye/EyeOff để xem.
    - 3 nút hành động: **Sao chép PIN**, **Sao chép cả 2 mã** (tracking + PIN), **In phiếu bảo mật** (cửa sổ in trắng).
    - Checkbox bắt buộc xác nhận "đã lưu" trước khi nút đóng được enable.
    - Không có nút X — bắt buộc người dùng tương tác.
    - z-index 60 (nằm trên mọi modal khác).
  - Cập nhật `CreatePetitionResult` type — thêm `accessPin?`, `isAnonymous`, `message`.
  - Thêm `WithdrawPetitionResult` interface vào `types/index.ts`.
  - Thêm `withdrawPetition()` API function vào `petitionApi.ts`.
  - Cập nhật `SubmitPetitionPage` luồng submit: sau submit thành công + `isAnonymous + accessPin` → mở `AnonymousPinModal` trước; sau khi đóng PIN modal mới mở `PetitionReceiptModal`.
  - TypeScript: **0 error**.

- [x] **Task 2.3: Frontend Cổng Tra Cứu Bảo Mật & Rút Đơn — Hoàn thành 18/10/2026**
  - Trang `/track`:
    - Tạo `WithdrawPetitionModal.tsx` với luồng bảo mật phân biệt:
      - Đơn định danh: Xác nhận lý do rút đơn (xác thực qua JWT hiện tại).
      - Đơn vô danh: Bắt buộc nhập mã PIN bảo mật 8 ký tự, có toggle ẩn/hiện PIN.
      - Xử lý lỗi từ backend (sai PIN, đơn quá hạn rút, đơn đã xử lý).
    - Tích hợp nút **"Rút đơn"** (`FileX` icon, màu rose) trên thanh công cụ thao tác nhanh:
      - Chỉ hiển thị khi đơn đang ở trạng thái `Submitted (1)` hoặc `Assigned (2)`.
      - Khi rút đơn thành công: Cập nhật giao diện sang `Đã rút đơn (Status = 6)`, hiển thị banner thành công màu xanh lá, ẩn nút rút đơn.
    - Đã kiểm tra build frontend (Vite & TypeScript strict unused variables): **0 error**.
    - Backend build: **0 error**.

---

### Phase 3: Nâng cấp Bước 2 - Phân công & Xử lý ngoại lệ (NeedInfo, Merged, Forwarded, Rejected)
*Mục tiêu: Đầy đủ các nghiệp vụ điều phối của Dispatcher, bảo vệ quyền riêng tư bản đồ.*

- [x] **Task 3.1: API & Giao diện Phân công & Xử lý ngoại lệ — Hoàn thành 18/10/2026**
  - Mở rộng lệnh điều phối `TransitionPetitionStatusCommand` & API `TransitionStatusRequest` với các Action:
    - `Assign`: Chỉ định Phòng ban, Chuyên viên, tự động tính hạn SLA theo ngày làm việc (`WorkingDaysService`).
    - `NeedInfo`: Nhập lý do yêu cầu bổ sung, hạn ngày làm việc (`NeedInfoDeadline`), kích hoạt tạm dừng SLA (`SlaPausedAt`), giới hạn tối đa 2 lần.
    - `Merge`: Nhập mã hồ sơ gốc `DuplicateOfTrackingCode`, chuyển sang `Merged`, liên kết tới ID hồ sơ gốc.
    - `Forward`: Nhập cơ quan chuyển tiếp ngoài ngành (`ForwardToOrganization`), lý do chuyển, chuyển sang `Forwarded`.
    - `Reject`: Nhập lý do từ chối thụ lý, chuyển sang `Rejected`.
  - Cập nhật ma trận luân chuyển trong `PetitionWorkflowService` và Audit Trail trong `PetitionHistories`.
  - Nâng cấp `TransitionStatusModal.tsx` trên Frontend với form động theo từng trạng thái ngoại lệ.
  - Cập nhật `AdminPetitionsPage.tsx` (Tabs lọc trạng thái: Cần bổ sung, Gộp đơn, Chuyển cơ quan, Đã rút) và `AdminPetitionDetailPage.tsx` (Exception Banners nổi bật).
  - Cả Backend và Frontend build: **0 error**.

- [x] **Task 3.2: Cơ chế Phản hồi Yêu cầu Bổ sung (`NeedInfo`) — Hoàn thành 19/10/2026**
  - Mở rộng `PetitionTrackingDto` và `TrackPetitionByCodeQueryHandler`: Trả về `NeedInfoReason`, `NeedInfoDeadline`, `NeedInfoCount`, `IsSlaPaused`, `DuplicateOfTrackingCode`, `ForwardToOrganization`, `WithdrawnReason`.
  - API `SubmitAdditionalInfoCommand` + Handler (`POST /petitions/{trackingCode}/additional-info`):
    - Người dân nhập nội dung bổ sung, tải lên tối đa 5 tệp (ảnh JPG/PNG/WEBP, video MP4, tài liệu PDF/DOCX).
    - Bảo mật xác thực: Bắt buộc mã PIN 8 ký tự với đơn ẩn danh (băm SHA-256, so sánh timing-safe `FixedTimeEquals`), kiểm tra JWT hoặc số điện thoại người gửi với đơn định danh.
    - Tự động unpause SLA: Tính dồn thời gian tạm dừng (`TotalSlaPausedMinutes += Now - SlaPausedAt`), xóa `SlaPausedAt = null`, chuyển trạng thái về `Assigned` (hoặc `Submitted`).
    - Ghi vết `PetitionHistory` và gửi thông báo real-time SignalR tới cán bộ phụ trách và nhóm Dispatchers.
  - Frontend:
    - Tạo `SubmitAdditionalInfoModal.tsx`: Giao diện nộp bổ sung hồ sơ, kéo thả tệp đính kèm, đếm ký tự, ô nhập mã PIN nếu đơn ẩn danh.
    - Nâng cấp `TrackPetitionPage.tsx`: Alert Banner màu cam/hổ phách nổi bật khi đơn ở trạng thái `NeedInfo (7)`, hiển thị hạn chót và lý do từ cán bộ, nút thao tác nhanh "Bổ sung hồ sơ" và tự động đồng bộ dữ liệu sau khi nộp thành công.
  - Cả Backend và Frontend build: **0 error**, 31/31 unit tests Passed.

- [ ] **Task 3.3: Làm tròn tọa độ & Bóc tách EXIF bảo mật trên Bản đồ công khai**
  - API `GetPublicPetitionsGeoJson`:
    - Chỉ hiển thị các hồ sơ từ `Assigned` trở đi.
    - Tọa độ công khai được làm tròn/nhiễu hóa nhẹ hoặc đưa về tâm địa bàn hành chính (xã/phường) để bảo vệ vị trí chính xác của người báo tin.
    - Bóc tách toàn bộ metadata EXIF nhạy cảm trên ảnh đính kèm trước khi trả về client.
    - Ẩn tên đối tượng bị phản ánh cho đến khi có kết luận chính thức.

---

### Phase 4: Nâng cấp Bước 3 & 4 - Thẩm tra thực địa & Ban hành kết luận
*Mục tiêu: Chuẩn hóa nghiệp vụ cán bộ chuyên viên hiện trường và kết luận pháp lý.*

- [ ] **Task 4.1: Nghiệp vụ Hiện trường & Yêu cầu bổ sung tại chỗ**
  - Nút **"Bắt đầu thẩm tra"** chuyển `Assigned` ➔ `Investigating`.
  - Tích hợp thêm ghi chú nội bộ (Internal comment) gắn ảnh biên bản hiện trường.
  - Cho phép Chuyên viên kích hoạt nhánh `NeedInfo` từ hiện trường nếu thiếu căn cứ xác minh.

- [ ] **Task 4.2: Ban hành kết luận có cấu trúc & Chốt mốc SLA**
  - Modal **"Ban hành kết luận"**:
    - Chọn loại kết luận: `Đúng`, `Đúng một phần`, hoặc `Không đủ căn cứ / Sai sự thật`.
    - Nhập tóm tắt giải quyết (`ResolutionSummary`) và nội dung công khai (`PublicSummary`).
    - Đính kèm file văn bản xử lý, biên bản xử phạt, ảnh hiện trường hoàn trả mặt bằng/nguồn nước.
    - Lưu thời điểm `ResolvedAt`, tính toán trạng thái giải quyết: *Đúng hạn* hay *Quá hạn*.
    - Bắn SignalR thông báo tới Dispatcher có hồ sơ sẵn sàng kiểm duyệt đóng.

---

### Phase 5: Nâng cấp Bước 5 - Đóng đơn, CSAT, Đề nghị mở lại & Background Jobs
*Mục tiêu: Đóng kín vòng lặp kiểm soát chất lượng và tự động hóa vận hành.*

- [ ] **Task 5.1: Dispatcher Kiểm duyệt Đóng đơn & Trả về xử lý lại**
  - Tại trạng thái `Resolved`:
    - Nút **"Phê duyệt & Đóng hồ sơ"** ➔ Chuyển `Closed`.
    - Nút **"Yêu cầu xử lý lại"** ➔ Nhập lý do trả về, chuyển ngược về `Investigating` để chuyên viên khắc phục.

- [ ] **Task 5.2: Đánh giá CSAT & Đề nghị xem xét lại (Reopen)**
  - Cổng tra cứu: Mở form đánh giá CSAT (1-5 sao) trong vòng 14 ngày sau khi `Closed`.
  - Nếu đánh giá CSAT ≤ 2 sao:
    - Hiển thị tùy chọn: *"Đề nghị xem xét lại kết quả giải quyết"* kèm ô nhập lý do.
    - API kiểm tra `ReopenCount == 0`: Nếu thỏa mãn, chuyển đơn về trạng thái chờ Dispatcher xem xét mở lại.
    - Dispatcher chấp thuận: Chuyển về `Assigned`, tăng mức ưu tiên lên một bậc, gán `ReopenCount = 1`.
    - Nếu đã qua lần mở lại thứ 2 mà dân vẫn không đồng ý: Hệ thống hiển thị tài liệu hướng dẫn khiếu nại, tố cáo chính thức theo Luật Khiếu nại.

- [ ] **Task 5.3: Xây dựng các Background Jobs tự động hóa**
  - Sử dụng `IHostedService` (Background Worker) chạy định kỳ:
    - **Job 1 (Auto-reject NeedInfo):** Quét các hồ sơ `NeedInfo` quá hạn `NeedInfoDeadline` mà không có phản hồi ➔ Tự động chuyển `Rejected` kèm lý do hệ thống.
    - **Job 2 (Auto-close Resolved):** Quét các hồ sơ `Resolved` quá 5 ngày làm việc mà Dispatcher chưa thao tác ➔ Tự động đóng `Closed` (ghi log `Auto-closed by system`).
    - **Job 3 (SLA Warning & Escalation):** Quét hồ sơ sắp chạm ngưỡng 80% SLA hoặc quá hạn ➔ Gửi cảnh báo SignalR/Email leo thang tới lãnh đạo/Dispatcher.

---

## 3. Kế hoạch kiểm thử & Tiêu chí nghiệm thu (Definition of Done)

- [ ] Mọi bước chuyển trạng thái tuân thủ nghiêm ngặt State Machine, ghi đầy đủ `PetitionHistory` trong một Transaction duy nhất.
- [ ] Không thể bypass trạng thái qua API (kiểm tra chặt chẽ `FluentValidation` và Domain exception).
- [ ] Đơn vô danh bảo vệ tuyệt đối tính ẩn danh nhưng vẫn cho phép tương tác nếu có mã PIN.
- [ ] Toàn bộ API có unit test kiểm thử các trường hợp biên: ngày nghỉ lễ, hết hạn bổ sung, quá hạn SLA, CSAT quá 14 ngày.
- [ ] Cập nhật đồng bộ tài liệu `PROJECT_PLAN.md`, `USER_GUIDE.md` và `docs/DECISIONS.md`.

---
*Ghi chú: Bản kế hoạch này cần được người dùng phê duyệt trước khi tiến hành viết code Phase 1.*
