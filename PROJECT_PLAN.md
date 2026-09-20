# Kế Hoạch & Tiến Độ Phát Triển: Hệ Thống Phản Ánh Kiến Nghị Thủy Sản (AquaReflect)

> **Dự án**: AquaReflect - Nền tảng số đa kênh tiếp nhận, điều phối và xử lý phản ánh kiến nghị ngành Thủy sản (Dịch bệnh thủy sản, ô nhiễm nguồn nước ao nuôi, vi phạm khai thác hải sản IUU, giống/thức ăn kém chất lượng, thủ tục hành chính nghề cá).  
> **Kiến trúc**: .NET 9 Web API (Clean Architecture) + React 19 + TypeScript + Tailwind CSS v4 + PostgreSQL/PostGIS.  
> **Cập nhật lần cuối**: 20/09/2026

---

## 📊 Bảng Tổng Hợp Tiến Độ Các Tasks

| Sprint | Task | Nội dung | Commit | Trạng thái |
|---|---|---|---|---|
| **Sprint 1** | Task 1.1 | Khởi tạo Backend .NET 9 Clean Architecture (Domain, Application, Infrastructure, Api) | `Init` | ✅ Hoàn thành |
| **Sprint 1** | Task 1.2 | Thiết kế Schema EF Core + PostGIS Point Geometry SRID 4326 | `Init` | ✅ Hoàn thành |
| **Sprint 1** | Task 1.3 | Data Seeding (Roles, Departments, Categories, Admin Units, PasswordHasher HMACSHA512) | `Init` | ✅ Hoàn thành |
| **Sprint 1** | Task 1.4 | Xác thực & Phân quyền JWT + Refresh Token (SuperAdmin, Dispatcher, Specialist, Citizen) | `Init` | ✅ Hoàn thành |
| **Sprint 1** | Task 1.5 | Khởi tạo Frontend React 19 + TypeScript + Tailwind CSS v4 (Stitch Design System) | `Init` | ✅ Hoàn thành |
| **Sprint 2** | Task 2.1 | API & UI Tiếp nhận phản ánh + Upload đa phương tiện + GPS VMS | `a624f1e` | ✅ Hoàn thành |
| **Sprint 2** | Task 2.2 | API & UI Tra cứu tiến độ công khai + Mã hồ sơ & SĐT + Che mờ bảo mật | `94dd457` | ✅ Hoàn thành |
| **Sprint 2** | Task 2.3 | UI Form Gửi phản ánh Mobile-first Wizard 4 bước + QR Biên nhận động | `de08ce7` | ✅ Hoàn thành |
| **Sprint 2** | Task 2.4 | UI Trang Tra cứu nâng cao & 4-phase Stepper Timeline | `62557aa` | ✅ Hoàn thành |
| **Sprint 2** | Task 2.5 | API & UI Đánh giá hài lòng (Feedback 5 sao) | `a107dd4` | ✅ Hoàn thành |
| **Sprint 3** | Task 3.1 | API Quản lý & Lọc hồ sơ nâng cao cho cán bộ + UI Danh sách | `9982f02` | ✅ Hoàn thành |
| **Sprint 3** | Task 3.2 | Quy trình luân chuyển trạng thái (State Machine) & Audit Trail | `47fa9b4` | ✅ Hoàn thành |
| **Sprint 3** | Task 3.3 | UI Portal Cán bộ: Chuyển đổi Danh sách & Bảng Kanban thông minh | `27b6ae8` | ✅ Hoàn thành |
| **Sprint 3** | Task 3.4 | UI Chi tiết Hồ sơ Chuyên sâu & Cập nhật Kết quả Thụ lý | `efe06bf` | ✅ Hoàn thành |
| **Sprint 3** | Task 3.5 | Hệ thống Thông báo Thời gian thực & Email (SignalR) | `SignalR-Realtime` | ✅ Hoàn thành |
| **Sprint 4** | Task 4.1 - 4.4 | Bản đồ số GIS, Dashboard Giám sát & Báo cáo thống kê | Thiết kế kiến trúc | ⏳ Sắp tới |
| **Sprint 5** | Task 5.1 - 5.4 | Chống spam, Kiểm thử, Container Docker & Triển khai | Thiết kế kiến trúc | ⏳ Sắp tới |

---

## 🎯 Chi Tiết Các Giai Đoạn

### Giai Đoạn 1: Khởi Tạo Nền Tảng, Kiến Trúc & CSDL (Sprint 1) - [100% Hoàn Thành]
- [x] **Task 1.1**: Khởi tạo Backend .NET Web API Clean Architecture, Serilog, Swagger, Global Exception Middleware.
- [x] **Task 1.2**: Schema EF Core + PostGIS SRID 4326, Spatial Index GiST.
- [x] **Task 1.3**: Dữ liệu khởi tạo (Data Seeding), Categories, Departments, AdministrativeUnits.
- [x] **Task 1.4**: Authentication & Authorization (JWT & Refresh Token).
- [x] **Task 1.5**: Frontend React 19 + TypeScript + Tailwind CSS v4, Zustand store, Axios interceptor.

---

### Giai Đoạn 2: Phân Hệ Tiếp Nhận & Tra Cứu Phía Người Dân (Sprint 2) - [100% Hoàn Thành]
- [x] **Task 2.1**: API & UI Tiếp nhận phản ánh (`POST /api/v1/petitions` multipart/form-data, lưu trữ `wwwroot/uploads/petitions/yyyyMM/`, sinh mã `TS-yyyyMM-XXXXX`, tính hạn SLA `DueDate`). Commit `a624f1e`.
- [x] **Task 2.2**: API & UI Tra cứu tiến độ công khai (`GET /api/v1/petitions/track/{code}`, `GET /api/v1/petitions/by-phone`, Data Masking tên và SĐT bảo mật, timeline 4 bước). Commit `94dd457`.
- [x] **Task 2.3**: UI Form Gửi phản ánh Mobile-first Wizard 4 bước, lưu nháp `localStorage`, QR biên nhận động `qrcode`, in phiếu hẹn. Commit `de08ce7`.
- [x] **Task 2.4**: UI Trang Tra cứu nâng cao, bộ lọc SĐT, stepper timeline tương tác, lightbox xem ảnh/video hiện trường. Commit `62557aa`.
- [x] **Task 2.5**: API & UI Đánh giá hài lòng (`POST /api/v1/petitions/{code}/feedback`, 5 sao, chặn trùng lặp, chỉ cho phép khi đã hoàn tất). Commit `a107dd4`.

---

### Giai Đoạn 3: Phân Hệ Quản Lý, Điều Phối & Xử Lý Cho Cán Bộ (Sprint 3) - [100% Hoàn Thành]
- [x] **Task 3.1: API Quản lý & Lọc Hồ sơ Nâng cao (Cán bộ)** *(Commit `9982f02`)*
  - Backend: `GetAdminPetitionListQuery`, lọc từ khóa toàn văn, trạng thái, mức ưu tiên, phòng ban, danh mục, quá hạn SLA, phân trang `PaginatedResult`. Phân quyền Dispatcher xem tất cả, Specialist xem theo phòng ban.
  - Frontend: `adminApi.ts`, `AdminPetitionsPage.tsx` (/admin/petitions), toolbar đa tiêu chí, data table, SLA alert indicators, Quick View modal.
- [x] **Task 3.2: Quy trình Luân chuyển Trạng thái (Workflow State Machine) & Audit Trail** *(Commit `47fa9b4`)*
  - Backend: `IPetitionWorkflowService` & `PetitionWorkflowService` quản lý ma trận chuyển tiếp nghiêm ngặt theo vai trò.
  - `TransitionPetitionStatusCommand` chuyển trạng thái nguyên tử, tự động ghi audit trail vào `PetitionHistory`.
  - `GetAllowedTransitionsQuery` trả về các bước chuyển tiếp hợp lệ tiếp theo.
  - Frontend: `TransitionStatusModal.tsx` tương tác luân chuyển trạng thái, chọn phòng ban/chuyên viên, nhập kết luận và số quyết định.
- [x] **Task 3.3: UI Portal Cán bộ: Danh sách & Bảng Kanban** *(Commit `27b6ae8`)*
  - `KanbanCard.tsx`: SLA urgency color ring (xanh -> vàng ≤48h -> đỏ ≤24h -> đỏ nhấp nháy pulse khi quá hạn), badge "QUÁ HẠN SLA", priority badge, nút luân chuyển trạng thái nhanh.
  - `KanbanBoard.tsx`: Bảng điều phối 4 cột (*Mới tiếp nhận* -> *Đã phân công* -> *Đang xử lý* -> *Đã giải quyết*). Smart sort (quá hạn lên đầu -> khẩn cấp -> cũ nhất), mobile scroll-snap.
  - `AdminPetitionsPage.tsx`: Toggle linh hoạt giữa chế độ **Danh sách | Kanban**.
- [x] **Task 3.4: UI Chi tiết Hồ sơ Chuyên sâu & Cập nhật Kết quả Thụ lý** *(Commit `efe06bf`)*
  - Backend: `GetAdminPetitionDetailQuery` + Handler (full dossier: attachments, timeline, resolution, comments, citizen identity, SLA metrics).
  - Backend: `UpdatePetitionResolutionCommand` (ban hành văn bản kết luận chính thức + upload PDF/file con dấu).
  - Backend: `AddPetitionCommentCommand` (ghi chú nghiệp vụ nội bộ giữa các cán bộ).
  - Backend: 3 endpoints mới trong `AdminController` — `GET /petitions/{id}`, `POST /petitions/{id}/resolution`, `POST /petitions/{id}/comments`.
  - Frontend: `AdminPetitionDetailPage.tsx` bố cục 2 cột chuyên nghiệp (header control bar, cột chính, sidebar SLA/Audit).
  - Frontend: `ResolutionModal.tsx` (ban hành kết luận + upload file), `MediaLightbox.tsx` (xem ảnh/video fullscreen), `MiniMapViewer.tsx` (bản đồ OSM + link Google Maps).
  - Frontend: Điều hướng tích hợp từ danh sách (table + Kanban card) sang trang chi tiết.
- [x] **Task 3.5: Hệ thống Thông báo Thời gian thực & Email (SignalR + Background Notification)** *(Hoàn thành)*
  - Backend:
    - Entity `Notification` trong Domain và Migration PostgreSQL `AddNotificationEntity`.
    - `NotificationHub` (`/hubs/notification`) với phân nhóm `dispatchers`, `dept_{id}`, `user_{id}`, `officers` và cấu hình JWT WebSocket handshake.
    - `INotificationService` & `SignalRNotificationService` phát sự kiện real-time: `ReceiveNotification`, `PetitionCreated`, `PetitionStatusChanged`, `PetitionResolved`, `NewCommentAdded`.
    - `IEmailService` & `EmailService`: Thiết kế mẫu Email HTML chuẩn phong cách Chính quyền số (tiếp nhận đơn kèm mã tra cứu, cập nhật tiến độ, kết quả xử lý chính thức), hỗ trợ SMTP & Logger fallback.
    - Tích hợp thông báo tự động trong các Handlers: `CreatePetition`, `TransitionPetitionStatus`, `UpdatePetitionResolution`, `AddPetitionComment`.
    - `NotificationsController`: API phân trang danh sách thông báo, đếm chưa đọc, đánh dấu đã đọc (`GET /api/v1/notifications`, `PUT /api/v1/notifications/{id}/read`, `PUT /api/v1/notifications/read-all`).
  - Frontend:
    - Cài đặt `@microsoft/signalr` và xây dựng `signalRService.ts` tự động kết nối lại, quản lý callbacks.
    - `notificationApi.ts` giao tiếp API thông báo.
    - `NotificationBell.tsx`: Chuông thông báo trên Navbar, badge số lượng chưa đọc, popover dropdown xem nhanh, nút đánh dấu tất cả đã đọc, điều hướng tới chi tiết hồ sơ.
    - `ToastNotification.tsx`: Container popup thông báo nổi góc màn hình kèm thời gian relative và tự tắt sau 6s.
    - Live Sync: Tự động invalidate cache React Query (`admin-petitions`, `admin-petition-detail`) giúp bảng Kanban và Danh sách tự cập nhật thẻ mới không cần F5.

---

### Giai Đoạn 4: Bản Đồ Số GIS & Dashboard Giám Sát, Báo Cáo (Sprint 4)
- [ ] **Task 4.1**: API Bản đồ không gian GIS (`GET /api/v1/gis/petitions-geojson`, ST_DWithin, heatmap data).
- [ ] **Task 4.2**: Tích hợp Bản đồ GIS phía Frontend (Leaflet / Mapbox GL) phân bố điểm phản ánh, phân loại màu theo chuyên mục.
- [ ] **Task 4.3**: Dashboard thống kê & phân tích KPI (tỷ lệ đúng hạn, biểu đồ xu hướng, chỉ số hài lòng).
- [ ] **Task 4.4**: Module xuất báo cáo định dạng Excel (ClosedXML) và PDF.

---

### Giai Đoạn 5: Bảo Mật, Tối Ưu Hiệu Năng & Đóng Gói Triển Khai (Sprint 5)
- [ ] **Task 5.1**: Chống Spam (Turnstile/reCAPTCHA), Rate Limiting, khử độc dữ liệu chống XSS.
- [ ] **Task 5.2**: Unit Test & Integration Test (xUnit, Moq, FluentAssertions).
- [ ] **Task 5.3**: Container hóa Docker & Docker Compose (PostGIS, .NET API, React Nginx).
- [ ] **Task 5.4**: Tài liệu hoàn thiện hướng dẫn cài đặt & vận hành.
