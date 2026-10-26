# Kế Hoạch & Tiến Độ Phát Triển: Hệ Thống Phản Ánh Kiến Nghị Thủy Sản (AquaReflect)

> **Dự án**: AquaReflect - Nền tảng số đa kênh tiếp nhận, điều phối và xử lý phản ánh kiến nghị ngành Thủy sản (Dịch bệnh thủy sản, ô nhiễm nguồn nước ao nuôi, vi phạm khai thác hải sản IUU, giống/thức ăn kém chất lượng, thủ tục hành chính nghề cá).
> **Kiến trúc**: .NET 9 Web API (Clean Architecture) + React 19 + TypeScript + Tailwind CSS v4 + PostgreSQL/PostGIS.
> **Cập nhật lần cuối**: 23/10/2026

---

## 📊 Bảng Tổng Hợp Tiến Độ Các Tasks

| Sprint             | Task           | Nội dung                                                                                   | Commit                 | Trạng thái    |
| ------------------ | -------------- | ------------------------------------------------------------------------------------------- | ---------------------- | --------------- |
| **Sprint 1** | Task 1.1       | Khởi tạo Backend .NET 9 Clean Architecture (Domain, Application, Infrastructure, Api)     | `Init`               | ✅ Hoàn thành |
| **Sprint 1** | Task 1.2       | Thiết kế Schema EF Core + PostGIS Point Geometry SRID 4326                                | `Init`               | ✅ Hoàn thành |
| **Sprint 1** | Task 1.3       | Data Seeding (Roles, Departments, Categories, Admin Units, PasswordHasher HMACSHA512)       | `Init`               | ✅ Hoàn thành |
| **Sprint 1** | Task 1.4       | Xác thực & Phân quyền JWT + Refresh Token (SuperAdmin, Dispatcher, Specialist, Citizen) | `Init`               | ✅ Hoàn thành |
| **Sprint 1** | Task 1.5       | Khởi tạo Frontend React 19 + TypeScript + Tailwind CSS v4 (Stitch Design System)          | `Init`               | ✅ Hoàn thành |
| **Sprint 2** | Task 2.1       | API & UI Tiếp nhận phản ánh + Upload đa phương tiện + GPS VMS                       | `a624f1e`            | ✅ Hoàn thành |
| **Sprint 2** | Task 2.2       | API & UI Tra cứu tiến độ công khai + Mã hồ sơ & SĐT + Che mờ bảo mật            | `94dd457`            | ✅ Hoàn thành |
| **Sprint 2** | Task 2.3       | UI Form Gửi phản ánh Mobile-first Wizard 4 bước + QR Biên nhận động                | `de08ce7`            | ✅ Hoàn thành |
| **Sprint 2** | Task 2.4       | UI Trang Tra cứu nâng cao & 4-phase Stepper Timeline                                      | `62557aa`            | ✅ Hoàn thành |
| **Sprint 2** | Task 2.5       | API & UI Đánh giá hài lòng (Feedback 5 sao)                                            | `a107dd4`            | ✅ Hoàn thành |
| **Sprint 3** | Task 3.1       | API Quản lý & Lọc hồ sơ nâng cao cho cán bộ + UI Danh sách                         | `9982f02`            | ✅ Hoàn thành |
| **Sprint 3** | Task 3.2       | Quy trình luân chuyển trạng thái (State Machine) & Audit Trail                         | `47fa9b4`            | ✅ Hoàn thành |
| **Sprint 3** | Task 3.3       | UI Portal Cán bộ: Chuyển đổi Danh sách & Bảng Kanban thông minh                     | `27b6ae8`            | ✅ Hoàn thành |
| **Sprint 3** | Task 3.4       | UI Chi tiết Hồ sơ Chuyên sâu & Cập nhật Kết quả Thụ lý                           | `efe06bf`            | ✅ Hoàn thành |
| **Sprint 3** | Task 3.5       | Hệ thống Thông báo Thời gian thực & Email (SignalR)                                   | `fb20c2d`            | ✅ Hoàn thành |
| **Sprint 4** | Task 4.1 - 4.4 | Bản đồ số GIS, Dashboard Giám sát & Báo cáo thống kê                              | Thiết kế kiến trúc | ⏳ Sắp tới    |
| **Sprint 5** | Task 5.1       | Chống spam (Turnstile/reCAPTCHA), Rate Limiting, khử độc dữ liệu chống XSS              | `890a2da`            | ✅ Hoàn thành |
| **Sprint 5** | Task 5.2       | Unit Test & Integration Test (xUnit, Moq, FluentAssertions)                               | `275c0dd`            | ✅ Hoàn thành |
| **Sprint 5** | Task 5.3       | Container hóa Docker & Docker Compose (PostGIS, .NET API, React Nginx)                    | `bfd74ad`            | ✅ Hoàn thành |
| **Sprint 5** | Task 5.4       | Tài liệu hoàn thiện hướng dẫn cài đặt & vận hành (`SETUP.md`)                             | `755123a`            | ✅ Hoàn thành |
| **Sprint 5** | Task 5.6       | Thiết kế & Xuất 13 Sơ đồ Tuần tự (Sequence Diagrams) bằng PlantUML                       | `PLAN-20261009`      | ✅ Hoàn thành |
| **Sprint 5** | Task 5.7       | Tự động chọn danh mục khi điều hướng từ Trang chủ / Tab Danh mục đến Tab Phản ánh        | `PLAN-20261009`      | ✅ Hoàn thành |
| **Sprint 5** | Task 5.8       | Bộ chọn Địa bàn & Tọa độ Thông minh (Smart Location Selector 3 chế độ)                   | `PLAN-20261009`      | ✅ Hoàn thành |
| **Báo cáo**  | Task Internship| Biên soạn Báo cáo thực tập - Chương 2: Nội dung thực tập (`INTERNSHIP_REPORT_CH2.md`)    | `PLAN-20261003`      | ✅ Hoàn thành |
| **Bảo mật**  | TASK-AUTH-REFLECTGOV | Chuẩn hóa RBAC 2 tầng (IsUnitLead, createOnBehalf, chống xung đột lợi ích, phân vùng Specialist 404) | `a4993d3` | ✅ Hoàn thành |
| **Quy trình**| TASK-UNIT-TEAM-WORKFLOW | Mô hình Đơn vị - Thành viên, Nghiệm thu nội bộ & Ban hành kết luận (5 Đơn vị, 15 Cán bộ) | `PLAN-20261024` | ✅ Hoàn thành |
| **Sửa lỗi**  | TASK-FIX-INSPECTION-NOTE-ERROR | Khắc phục lỗi thiếu boundary `multipart/form-data` khi cán bộ thụ lý tạo biên bản thực địa | `PLAN-20261026` | ✅ Hoàn thành |

---

## 🎯 Chi Tiết Các Giai Đoạn

### Giai Đoạn 1: Khởi Tạo Nền Tảng, Kiến Trúc & CSDL (Sprint 1) - [100% Hoàn Thành]

- [X] **Task 1.1**: Khởi tạo Backend .NET Web API Clean Architecture, Serilog, Swagger, Global Exception Middleware.
- [X] **Task 1.2**: Schema EF Core + PostGIS SRID 4326, Spatial Index GiST.
- [X] **Task 1.3**: Dữ liệu khởi tạo (Data Seeding), Categories, Departments, AdministrativeUnits.
- [X] **Task 1.4**: Authentication & Authorization (JWT & Refresh Token).
- [X] **Task 1.5**: Frontend React 19 + TypeScript + Tailwind CSS v4, Zustand store, Axios interceptor.

---

### Giai Đoạn 2: Phân Hệ Tiếp Nhận & Tra Cứu Phía Người Dân (Sprint 2) - [100% Hoàn Thành]

- [X] **Task 2.1**: API & UI Tiếp nhận phản ánh (`POST /api/v1/petitions` multipart/form-data, lưu trữ `wwwroot/uploads/petitions/yyyyMM/`, sinh mã `TS-yyyyMM-XXXXX`, tính hạn SLA `DueDate`). Commit `a624f1e`.
- [X] **Task 2.2**: API & UI Tra cứu tiến độ công khai (`GET /api/v1/petitions/track/{code}`, `GET /api/v1/petitions/by-phone`, Data Masking tên và SĐT bảo mật, timeline 4 bước). Commit `94dd457`.
- [X] **Task 2.3**: UI Form Gửi phản ánh Mobile-first Wizard 4 bước, lưu nháp `localStorage`, QR biên nhận động `qrcode`, in phiếu hẹn. Commit `de08ce7`.
- [X] **Task 2.4**: UI Trang Tra cứu nâng cao, bộ lọc SĐT, stepper timeline tương tác, lightbox xem ảnh/video hiện trường. Commit `62557aa`.
- [X] **Task 2.5**: API & UI Đánh giá hài lòng (`POST /api/v1/petitions/{code}/feedback`, 5 sao, chặn trùng lặp, chỉ cho phép khi đã hoàn tất). Commit `a107dd4`.

---

### Giai Đoạn 3: Phân Hệ Quản Lý, Điều Phối & Xử Lý Cho Cán Bộ (Sprint 3) - [100% Hoàn Thành]

- [X] **Task 3.1: API Quản lý & Lọc Hồ sơ Nâng cao (Cán bộ)** *(Commit `9982f02`)*
  - Backend: `GetAdminPetitionListQuery`, lọc từ khóa toàn văn, trạng thái, mức ưu tiên, phòng ban, danh mục, quá hạn SLA, phân trang `PaginatedResult`. Phân quyền Dispatcher xem tất cả, Specialist xem theo phòng ban.
  - Frontend: `adminApi.ts`, `AdminPetitionsPage.tsx` (/admin/petitions), toolbar đa tiêu chí, data table, SLA alert indicators, Quick View modal.
- [X] **Task 3.2: Quy trình Luân chuyển Trạng thái (Workflow State Machine) & Audit Trail** *(Commit `47fa9b4`)*
  - Backend: `IPetitionWorkflowService` & `PetitionWorkflowService` quản lý ma trận chuyển tiếp nghiêm ngặt theo vai trò.
  - `TransitionPetitionStatusCommand` chuyển trạng thái nguyên tử, tự động ghi audit trail vào `PetitionHistory`.
  - `GetAllowedTransitionsQuery` trả về các bước chuyển tiếp hợp lệ tiếp theo.
  - Frontend: `TransitionStatusModal.tsx` tương tác luân chuyển trạng thái, chọn phòng ban/chuyên viên, nhập kết luận và số quyết định.
- [X] **Task 3.3: UI Portal Cán bộ: Danh sách & Bảng Kanban** *(Commit `27b6ae8`)*
  - `KanbanCard.tsx`: SLA urgency color ring (xanh -> vàng ≤48h -> đỏ ≤24h -> đỏ nhấp nháy pulse khi quá hạn), badge "QUÁ HẠN SLA", priority badge, nút luân chuyển trạng thái nhanh.
  - `KanbanBoard.tsx`: Bảng điều phối 4 cột (*Mới tiếp nhận* -> *Đã phân công* -> *Đang xử lý* -> *Đã giải quyết*). Smart sort (quá hạn lên đầu -> khẩn cấp -> cũ nhất), mobile scroll-snap.
  - `AdminPetitionsPage.tsx`: Toggle linh hoạt giữa chế độ **Danh sách | Kanban**.
- [X] **Task 3.4: UI Chi tiết Hồ sơ Chuyên sâu & Cập nhật Kết quả Thụ lý** *(Commit `efe06bf`)*
  - Backend: `GetAdminPetitionDetailQuery` + Handler (full dossier: attachments, timeline, resolution, comments, citizen identity, SLA metrics).
  - Backend: `UpdatePetitionResolutionCommand` (ban hành văn bản kết luận chính thức + upload PDF/file con dấu).
  - Backend: `AddPetitionCommentCommand` (ghi chú nghiệp vụ nội bộ giữa các cán bộ).
  - Backend: 3 endpoints mới trong `AdminController` — `GET /petitions/{id}`, `POST /petitions/{id}/resolution`, `POST /petitions/{id}/comments`.
  - Frontend: `AdminPetitionDetailPage.tsx` bố cục 2 cột chuyên nghiệp (header control bar, cột chính, sidebar SLA/Audit).
  - Frontend: `ResolutionModal.tsx` (ban hành kết luận + upload file), `MediaLightbox.tsx` (xem ảnh/video fullscreen), `MiniMapViewer.tsx` (bản đồ OSM + link Google Maps).
  - Frontend: Điều hướng tích hợp từ danh sách (table + Kanban card) sang trang chi tiết.
- [X] **Task 3.5: Hệ thống Thông báo Thời gian thực & Email (SignalR + Background Notification)** *(Hoàn thành)*
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

- [X] **Task 4.1: API Bản đồ không gian GIS** *(Hoàn thành)*
  - `GeoJsonDtos.cs`: Chuẩn GeoJSON RFC 7946 (`FeatureCollection`, `Feature`, `Geometry`, `Properties`).
  - `GetPetitionsGeoJsonQuery` + Handler: Lọc Bounding Box (`minLat, maxLat, minLng, maxLng`), chuyên mục, trạng thái, quá hạn SLA; xuất GeoJSON RFC 7946.
  - `GetPetitionsByRadiusQuery` + Handler: Tìm kiếm điểm nóng xung quanh vị trí tâm (`centerLat, centerLng`) theo bán kính `radiusKm`, tính khoảng cách cầu Haversine (km & mét).
  - `GetHeatmapDataQuery` + Handler: Tính toán trọng số nhiệt (weight 0.1 - 1.0) dựa trên độ ưu tiên vi phạm (`Urgent`, `High`, `Normal`) và nhóm nguy cơ (IUU, ô nhiễm, dịch bệnh); cung cấp mảng `rawArray: [[lat, lng, weight]]` tối ưu cho Leaflet.heat.
  - `GetSpatialSummaryQuery` + Handler: Thống kê mật độ phản ánh theo địa bàn huyện/thị xã và phân bố tỷ trọng chuyên mục.
  - `GisController`: Cung cấp 4 endpoints chuẩn RESTful (`/api/v1/gis/petitions-geojson`, `/api/v1/gis/petitions-radius`, `/api/v1/gis/heatmap`, `/api/v1/gis/spatial-summary`).
- [X] **Task 4.2: Tích hợp Bản đồ GIS phía Frontend** *(Hoàn thành)*
  - Thư viện: Cài đặt và tích hợp `leaflet`, `@types/leaflet`, `leaflet.heat` tối ưu 100% cho React 19 bằng React `useRef` + `useEffect`.
  - `gisApi.ts` & `gis.ts`: Client gọi API GeoJSON, bán kính Haversine, heatmap và thống kê không gian theo địa bàn.
  - `GisLeafletMap.tsx`: Component bản đồ cốt lõi đa tầng (Multi-layer):
    - Đổi lớp nền (Base Map Switcher): OpenStreetMap Đường phố, Esri World Imagery Vệ tinh độ nét cao, CartoDB Positron Tối giản.
    - Custom Marker Pin SVG phân loại màu trực quan theo chuyên mục: Đỏ (IUU/VMS), Xanh (Ô nhiễm nước), Cam (Dịch bệnh), Tím (Bảo vệ nguồn lợi).
    - Hiệu ứng Pulse Animation sóng lan tỏa cho hồ sơ Khẩn cấp hoặc Quá hạn SLA.
    - Leaflet Popup tương tác: Mã hồ sơ, Tiêu đề, Chuyên mục, Trạng thái, Địa chỉ, Nút chuyển hướng chi tiết `/admin/petitions/{id}`.
    - Lớp bản đồ nhiệt Heatmap (Leaflet.heat) với dải màu $0.2 \rightarrow 1.0$ (Xanh $\rightarrow$ Vàng $\rightarrow$ Đỏ).
    - Vòng tròn bán kính không gian `L.circle` trực quan khi quét lân cận.
  - `GisFilterPanel.tsx`: Thanh điều khiển chuyển lớp nền, bật/tắt Heatmap, kích hoạt Quét bán kính, lọc trạng thái, ưu tiên và quá hạn SLA.
  - `GisRadiusTool.tsx`: Bảng công cụ quét cự ly 5km - 50km, danh sách hồ sơ lọt vào bán kính kèm khoảng cách Haversine và zoom nhanh.
  - `GisSummarySidebar.tsx`: Thống kê mật độ theo huyện/thị xã Cà Mau, phân bổ tỷ trọng chuyên mục, nhấp huyện tự động bay (Fly to) tới vị trí.
  - `AdminGisMapPage.tsx`: Trang Trung tâm Chỉ huy & Giám sát GIS chuyên dụng cho Cán bộ (`/admin/gis-map`).
  - `MapPage.tsx`: Nâng cấp trang Bản đồ Cảnh báo cộng đồng thời gian thực cho người dân và ngư dân (`/map`).
  - Đăng ký route được bảo vệ `/admin/gis-map` và cập nhật menu Navbar cho cán bộ.
- [X] **Task 4.3: Dashboard thống kê & phân tích KPI (SLA, xu hướng, hài lòng)** *(Commit `5d94e69`)*
  - Backend:
    - DTOs `DashboardKpiDto`: Mô hình hóa đầy đủ `KpiOverviewDto` (tổng tiếp nhận, tỷ lệ giải quyết, đúng hạn SLA, thời gian xử lý TB, điểm CSAT), `DepartmentPerformanceDto` (đúng hạn/quá hạn/tỷ lệ theo phòng ban), `CategoryDistributionDto`, `MonthlyTrendDto` (tiếp nhận vs giải quyết), `RecentFeedbackDto`.
    - `GetDashboardKpiQuery` + Handler: Tổng hợp dữ liệu đa chiều, tính toán tỷ lệ SLA chính xác, phân tích xu hướng theo mốc thời gian linh hoạt (7, 30, 90 ngày hoặc tùy chọn).
    - `DashboardController`: Endpoint RESTful `GET /api/v1/dashboard/kpi` phân quyền cán bộ, hỗ trợ lọc theo chu kỳ ngày và phòng ban.
  - Frontend:
    - Tích hợp `recharts` hiển thị biểu đồ phân tích chuyên sâu.
    - `dashboardApi.ts` & models: Khai báo API client và kiểu dữ liệu KPI.
    - Hệ thống component Dashboard module hóa:
      - `KpiMetricCards.tsx`: 5 thẻ chỉ số then chốt với gradient màu cao cấp, icon ngữ cảnh, tỷ lệ phần trăm SLA.
      - `DepartmentKpiTable.tsx`: Bảng giám sát hiệu suất các đơn vị trực thuộc, thanh tiến độ đúng hạn SLA trực quan, cảnh báo quá hạn.
      - `MonthlyTrendChart.tsx`: Biểu đồ miền (Area Chart) kết hợp đường so sánh tiếp nhận vs giải quyết.
      - `CategoryPieChart.tsx`: Biểu đồ tròn/donut cơ cấu phản ánh (IUU, ô nhiễm môi trường, dịch bệnh thủy sản...).
      - `CitizenFeedbackSection.tsx`: Danh sách đánh giá mức độ hài lòng kèm sao CSAT và ý kiến người dân.
    - `DashboardPage.tsx`: Giao diện Trung tâm Giám sát Điều hành tổng thể, bộ lọc thời gian và đơn vị tức thì.
- [X] **Task 4.4: Module xuất báo cáo định dạng Excel (ClosedXML) và PDF (QuestPDF)** *(Commit `d85173b`)*
  - Backend:
    - Thư viện: Tích hợp `ClosedXML` (0.105.1) và `QuestPDF` (2026.9.0) trên tầng `AquaReflect.Infrastructure`.
    - `ExportPetitionsToExcelQuery` + Handler:
      - Xuất sổ bộ phản ánh kiến nghị ra file `.xlsx` chuẩn biểu mẫu hành chính.
      - 2 Sheet chuyên biệt: Sheet "Danh sách Phản ánh" (đầy đủ mã đơn, tiêu đề, công dân, địa chỉ, chuyên mục, phòng ban, độ ưu tiên, hạn SLA, trạng thái) và Sheet "Thống kê Tổng hợp".
      - Định dạng Header màu xanh thương hiệu Chính quyền số (#004B87), viền ô mảnh, tự động căn chỉnh độ rộng cột (`AdjustToContents`), áp dụng mã màu trạng thái trực quan.
    - `ExportKpiReportToPdfQuery` + Handler:
      - Xuất Báo cáo KPI Điều hành Thủy sản định dạng PDF chuẩn văn bản nhà nước (Khổ A4 dọc, lề 2cm).
      - Tiêu đề cơ quan chủ quản (Sở Nông nghiệp và PTNT tỉnh Cà Mau, Chi cục Thủy sản).
      - Bảng số liệu tổng hợp KPI, bảng hiệu suất xử lý theo từng phòng ban, cơ cấu chuyên mục và trích xuất ý kiến đánh giá của người dân.
      - Cấu hình font QuestPDF `UseSystemFonts = true`, `ThrowOnMissingFontFamilies = false` giải quyết triệt để lỗi font tiếng Việt Unicode.
    - `ReportsController`: Cung cấp 2 endpoints an toàn theo vai trò (`GET /api/v1/reports/petitions/excel`, `GET /api/v1/reports/kpi/pdf`).
    - Cấu hình MediatR đăng ký assembly Infrastructure handlers tại `Program.cs`.
  - Frontend:
    - `reportsApi.ts`: Module xử lý tải luồng nhị phân Blob (`responseType: 'blob'`), tự động tạo thẻ download ảo và giải phóng ObjectURL.
    - `DashboardPage.tsx`: Bổ sung 2 nút tác vụ "Xuất Excel" (emerald) và "Xuất PDF KPI" (rose) trên thanh công cụ Header với trạng thái loading phản hồi người dùng.
    - Kiểm thử tự động và thực tế: File Excel (9.2 KB) và PDF (66.6 KB) kết xuất thành công, dữ liệu chuẩn xác 100%.

---

### Giai Đoạn 5: Bảo Mật, Tối Ưu Hiệu Năng & Đóng Gói Triển Khai (Sprint 5)

- [X] **Task 5.1: Chống Spam (Turnstile/reCAPTCHA), Rate Limiting, khử độc dữ liệu chống XSS** *(Commit `890a2da`)*
  - Backend:
    - **Rate Limiting (`RateLimiterExtensions.cs`)**: Cấu hình bộ kiểm soát tần suất truy cập ASP.NET Core 9 với 4 chính sách phân tầng theo Client IP (`auth-policy`: 10 req/phút, `petition-submit-policy`: 5 req/phút, `feedback-policy`: 10 req/phút, `global-ip-policy`: 120 req/phút). Phản hồi chuẩn HTTP 429 kèm thông báo tiếng Việt.
    - **Cloudflare Turnstile & Honeypot (`ITurnstileService` & `TurnstileService`)**: Xác minh chống bot càn quét tự động qua API Cloudflare, hỗ trợ bẫy Honeypot ẩn và chế độ Development Bypass kiểm thử địa phương.
    - **Khử độc Dữ liệu Anti-XSS (`InputSanitizer.cs`)**: Tích hợp `HtmlSanitizer` tước bỏ triệt để thẻ `<script>`, `<iframe>`, `javascript:`, event handlers (`onload`, `onerror`), làm sạch mọi dữ liệu đầu vào người dùng trước khi lưu trữ PostgreSQL.
    - **Security Headers (`SecurityHeadersMiddleware.cs`)**: Thiết lập các HTTP Headers an ninh (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy`).
    - Đăng ký middleware và gán attribute `[EnableRateLimiting]` vào `AuthController` và `PetitionsController`.
  - Frontend:
    - **`TurnstileWidget.tsx`**: Component xác minh an toàn Cloudflare Turnstile với chế độ Bypass tự động cho môi trường Dev.
    - **`SubmitPetitionPage.tsx`**: Nhúng widget Turnstile và bẫy Honeypot ẩn vào quy trình gửi phản ánh.
    - **`axiosClient.ts`**: Bắt lỗi HTTP 429 và thông báo Toast hướng dẫn người dùng "Thao tác quá nhanh, vui lòng chờ 1 phút".
  - Kiểm thử thực tế: Rate Limiting chặn thành công request thứ 11 với mã HTTP 429; Anti-XSS tước bỏ hoàn toàn mã độc script/iframe trong tiêu đề và nội dung; Honeypot từ chối lập tức request bot.
- [X] **Task 5.2: Unit Test & Integration Test (xUnit, Moq, FluentAssertions)** *(Hoàn thành)*
  - Backend Unit Tests (`AquaReflect.UnitTests`):
    - `InputSanitizerTests.cs`: Kiểm thử làm sạch HTML độc hại (thẻ `<script>`, `<iframe>`, `javascript:`, event handlers `onload`/`onerror`).
    - `PetitionWorkflowServiceTests.cs`: Kiểm thử ma trận luân chuyển trạng thái (State Machine) theo vai trò (Citizen, Dispatcher, Specialist) và kiểm tra audit trail.
    - `CreatePetitionCommandValidatorTests.cs`: Kiểm thử validation rules đầu vào (tiêu đề, nội dung, SĐT công dân, tọa độ GPS, danh mục).
    - `CreatePetitionCommandHandlerTests.cs`: Kiểm thử logic tạo phản ánh mới với Mock DbContext, Mapper, Event Dispatcher.
  - Backend Integration Tests (`AquaReflect.IntegrationTests`):
    - `CustomWebApplicationFactory`: Khởi tạo môi trường kiểm thử isolated với EF Core InMemory Database và seed data.
    - `AuthControllerTests`: Kiểm thử luồng đăng nhập `POST /api/v1/auth/login` cấp JWT token thành công cho tài khoản cán bộ.
    - `PetitionsControllerTests`: Kiểm thử công khai `GET /api/v1/categories` trả về danh mục.
    - `GisControllerTests`: Kiểm thử endpoints GIS `GET /api/v1/gis/petitions-geojson` và `GET /api/v1/gis/heatmap`.
  - Kết quả: 21/21 test cases (17 Unit Tests + 4 Integration Tests) đạt PASS 100%.
- [X] **Task 5.3: Container hóa Docker & Docker Compose** *(Commit `bfd74ad`)*
  - [`backend/Dockerfile`](backend/Dockerfile): Multi-stage build .NET 9 (`mcr.microsoft.com/dotnet/sdk:9.0` → `mcr.microsoft.com/dotnet/aspnet:9.0`), expose port 8080, mount Volume `wwwroot/uploads`.
  - [`frontend/Dockerfile`](frontend/Dockerfile): Multi-stage build React 19 SPA (`node:22-alpine` → `nginx:alpine`).
  - [`frontend/nginx.conf`](frontend/nginx.conf): Cấu hình Reverse Proxy `/api/`, `/uploads/`, `/hubs/` (SignalR WebSocket), Gzip, SPA fallback `try_files`.
  - [`docker-compose.yml`](docker-compose.yml): Điều phối 3 dịch vụ (`db` PostGIS 16, `backend` .NET 9, `frontend` Nginx), Healthcheck cho Database (`pg_isready`), Volumes bền vững (`postgres_data`, `backend_uploads`), Bridge Network `aquareflect_net`.
  - [`.env.example`](.env.example): Mẫu biến môi trường (POSTGRES_PASSWORD, JWT_SECRET_KEY, TURNSTILE keys, FRONTEND_ORIGIN).
  - Hướng dẫn sử dụng: `cp .env.example .env` → `docker compose up -d --build`.
- [X] **Task 5.4: Tài liệu Hướng dẫn Cài đặt & Vận hành (`SETUP.md`)** *(Hoàn thành)*
  - [`SETUP.md`](SETUP.md): Tài liệu hướng dẫn cài đặt & vận hành hệ thống AquaReflect toàn diện:
    - **Yêu cầu hệ thống**: Phần cứng, .NET 9 SDK, Node.js 22 LTS, PostgreSQL 16 + PostGIS 3.4 / Docker Desktop.
    - **Khởi chạy Nhanh Docker Compose**: `cp .env.example .env` → `docker compose up -d --build`.
    - **Môi trường Local Dev**: Chạy độc lập Backend API, Frontend React SPA, PostgreSQL local.
    - **Bảng Biến môi trường**: Chi tiết các cấu hình kết nối CSDL, JWT Secret Key, Rate Limiting, Turnstile Cloudflare.
    - **Thao tác CSDL**: EF Core Migrations, Lệnh Backup (`pg_dump`) & Phục hồi (`pg_restore`) dữ liệu PostGIS.
    - **Bộ Kiểm thử**: Hướng dẫn chạy 21 test cases (Unit & Integration Tests) với `dotnet test`.
    - **Production & Monitoring**: Hướng dẫn SSL/TLS, Nginx reverse proxy, xem logs realtime.
    - **Troubleshooting**: Khắc phục sự cố Docker Virtualization, CORS, Rate Limit 429, SignalR WebSockets.
- [X] **Task 5.5: Rà soát Phân quyền & Cải thiện Quy trình Xử lý Phản ánh** *(Hoàn thành)*
  - **Backend**: Siết chặt phân quyền trong `UpdatePetitionResolutionCommandHandler` (chỉ Specialist thụ lý hồ sơ thuộc phòng ban hoặc SuperAdmin mới được ban hành kết luận giải quyết; chặn vai trò Dispatcher).
  - **Frontend**:
    - `TransitionStatusModal.tsx`: Tích hợp **Workflow Stepper 6 bước** trực quan thanh tiến độ, **Role Context Badge** hiển thị vai trò người thao tác, và **Lời nhắc nghiệp vụ** hướng dẫn chi tiết theo từng bước chuyển trạng thái.
    - `AdminPetitionDetailPage.tsx`: Tích hợp thanh tiến độ **Workflow Stepper**, phân quyền nút "Ban hành kết luận" hiển thị linh hoạt theo đúng vai trò cán bộ (Specialist/SuperAdmin) kèm tooltip giải thích.
- [X] **Task 5.6: Thiết kế & Xuất 13 Sơ đồ Tuần tự (Sequence Diagrams) bằng PlantUML** *(Hoàn thành)*
  - Thiết kế và render 100% (13/13) Sơ đồ tuần tự bằng mã nguồn PlantUML với ngôn ngữ tiếng Việt thân thiện, rõ ràng, dễ hiểu cho người dùng.
  - Lưu ảnh PNG sơ đồ tại thư mục chuyên biệt: [`docs/diagrams/sequence_diagrams/`](docs/diagrams/sequence_diagrams/).
- [X] **Task 5.7: Tự động Chọn Danh Mục Khi Điều Hướng Đến Tab Phản Ánh** *(Hoàn thành)*
  - Frontend (`SubmitPetitionPage.tsx`): Import `useSearchParams`, tự động đọc tham số URL `category` / `categoryCode` / `categoryId`.
  - Tải Master Data Categories và tự động tìm danh mục tương ứng để chọn làm giá trị ban đầu cho `categoryId` khi người dùng click "Phản ánh ngay" từ bất kỳ item danh mục nào ở Trang chủ (`HomePage.tsx`), Tab Danh mục (`CategoriesPage.tsx`), hoặc Trang Chi tiết Danh mục (`CategoryDetailPage.tsx`).
  - Đảm bảo fallback danh mục mặc định (`VI_PHAM_IUU`) nếu truy cập trực tiếp `/submit` không có tham số URL.
- [X] **Task 5.8: Bộ Chọn Địa Bàn & Tọa Độ Thông Minh (Smart Location Selector)** *(Hoàn thành)*
  - Master Data (`maritimeData.ts`): Xây dựng danh sách Master Data cho các **Cảng cá & Khu neo đậu tránh trú bão lớn toàn quốc** (Sa Kỳ, Thọ Quang, Sông Đốc, Hòn Rớ, Cửa Đại, An Thới, Cát Lở, Quy Nhơn...), các **Vùng biển nghề cá** và **Ngư trường trọng điểm** (Hoàng Sa, Trường Sa, Vịnh Bắc Bộ, Ninh Thuận - Bình Thuận, Côn Đảo, Tây Nam...).
  - Frontend (`SubmitPetitionPage.tsx`): Phát triển UI Radio Selector 3 chế độ (`LAND_COASTAL` - Đất liền/Ven bờ, `FISHING_PORT` - Cảng cá/Khu neo đậu, `OFFSHORE_SEA` - Trên biển/Ngư trường).
  - Tự động điền Tỉnh/Huyện/Xã và tọa độ GPS khi chọn Cảng cá; tự động ghép chuỗi địa điểm chuẩn nghiệp vụ (`computeFormattedLocation()`).

---

### TASK-AUTH-REFLECTGOV: Chuẩn Hóa & Hoàn Thiện Phân Quyền RBAC 2 Tầng *(23/10/2026 – Commit `a4993d3`)*

Theo đặc tả [`docs/PHAN_QUYEN_AQUAREFLECTGOV.md`](docs/PHAN_QUYEN_AQUAREFLECTGOV.md):

- [X] **Giai đoạn 1 – Domain & DB**:
  - Thêm trường `IsUnitLead` (bool) vào `User.cs` để phân biệt Trưởng đơn vị chuyên môn.
  - Thêm enum `ReceptionSource` (Online=0, Phone=1, InPerson=2, Document=3) và trường `ReceptionSource`, `CreatedOnBehalfByUserId` vào `Petition.cs`.
  - EF Core Migration `AddUnitLeadAndOnBehalfFields` tạo cột mới trong PostgreSQL.
  - Cập nhật Data Seeding: Tách `kiemngu` → `specialistLead` (`IsUnitLead=true`) và `kiemngu_cb` (thành viên bình thường).

- [X] **Giai đoạn 2 – Backend Application Services**:
  - `PetitionWorkflowService`: Thêm phân nhánh Trưởng đơn vị (Assigned→Assigned phân công, Assigned→Submitted trả về Dispatcher), chống xung đột lợi ích.
  - `ICurrentUserService` & `CurrentUserService`: Bổ sung property `IsUnitLead` từ JWT claim.
  - JWT Claim `is_unit_lead` được ghi vào token tại `JwtTokenGenerator`.
  - `AuthResponseDto` & `LoginCommand`: Trả `isUnitLead` trong phản hồi đăng nhập.
  - `GetAllowedTransitionsQuery`: Truyền `IsUnitLead` để trả đúng danh sách hành động.
  - `TransitionPetitionStatusCommandHandler`: Kiểm tra quyền theo `IsUnitLead`, `AssignedUserId`, phạm vi phòng ban.
  - `AdminPetitionDetailDto` & Handler: Thêm `IsConflictOfInterest`, `ReceptionSource`, `CreatedOnBehalfBy*`.
  - `CreatePetitionOnBehalfCommand` & Handler: Luồng tiếp nhận hộ (Dispatcher/SuperAdmin), bắt buộc chọn `ReceptionSource ≠ Online`, ghi `CreatedOnBehalfByUserId`.

- [X] **Giai đoạn 3 – API & Bảo Mật Controller**:
  - `PetitionsController`: Chặn token nội bộ gọi các endpoint công dân (CreatePetition, SubmitAdditionalInfo, WithdrawPetition, SubmitFeedback, RequestReopen) → HTTP 403.
  - `AdminController`: Thêm `POST /api/v1/admin/petitions/on-behalf` (chỉ Dispatcher/SuperAdmin) + `CreateOnBehalfRequest`.
  - `GetAdminPetitionDetailQueryHandler`: Specialist truy cập đơn ngoài phòng ban → HTTP 404 (chống dò mã).

- [X] **Giai đoạn 4 – Frontend RBAC**:
  - `types/index.ts`: Thêm `isUnitLead` vào `UserInfo`, `isConflictOfInterest`/`receptionSource`/`createdOnBehalfBy*` vào `AdminPetitionDetail`, `isUnitLead` vào `DepartmentOfficer`.
  - `AdminPetitionDetailPage.tsx`: Kiểm tra `isConflictOfInterest` trước mọi quyền hành động; hiển thị badge cảnh báo xung đột lợi ích; phân nhánh `isUnitLead` cho nút phân công cán bộ và trả đơn.
  - `AdminPetitionsPage.tsx`: Nút "Tiếp nhận hộ" (PhoneCall icon) hiển thị cho Dispatcher/SuperAdmin.
  - `CreateOnBehalfModal.tsx`: Form nhập hộ phản ánh (nguồn tiếp nhận, thông tin công dân, tệp đính kèm), gọi `adminApi.createOnBehalf()`.
  - `adminApi.ts`: Thêm `createOnBehalf(formData)` endpoint.

- [X] **Giai đoạn 5 – Kiểm Thử**:
  - Unit Tests `PetitionWorkflowServiceTests.cs`: **44/44 test cases PASSED**, bao gồm kịch bản IsUnitLead, xung đột lợi ích, phạm vi phòng ban, trả đơn về Dispatcher.
  - Frontend build: `tsc -b && vite build` – ✅ 0 errors.
  - Backend build: `dotnet build` – ✅ 0 errors, 0 failures.

---

### TASK-UNIT-TEAM-WORKFLOW: Mô Hình Đơn Vị - Thành Viên, Nghiệm Thu Nội Bộ & Ban Hành Kết Luận *(24/10/2026 – PLAN-20261024)*

Quy trình quản lý theo mô hình Đơn vị chuyên môn xử lý phản ánh thủy sản, phân cấp 2 tầng và nghiệm thu nội bộ trước khi ban hành:

- [X] **Mô hình 5 Đơn vị & 15 Cán bộ chuyên môn**:
  - 5 Đơn vị thủy sản trực thuộc: Trung tâm Khuyến nông & Dịch vụ nghề cá (`TTKN`), Phòng Nuôi trồng Thủy sản (`PNTTS`), Chi cục Quản lý Môi trường Ao nuôi (`QLMT`), Chi cục Quản lý Chất lượng & Thú y Thủy sản (`QLCL`), Chi cục Thủy sản & Kiểm ngư (`HTCC`).
  - Mỗi đơn vị gồm 3 cán bộ (1 Trưởng đơn vị `IsUnitLead = true` + 2 Cán bộ thành viên `IsUnitLead = false`), tổng cộng 15 cán bộ với mật khẩu chuẩn `Canbo@123`.

- [X] **Máy trạng thái & Database**:
  - Thêm trạng thái `PendingApproval = 11` (Chờ duyệt nghiệm thu) vào `PetitionStatus.cs`.
  - Bổ sung các trường lưu vết nghiệm thu trong `Petition.cs`: `InspectionReport`, `InspectionReportSubmittedAt`, `InspectionReportSubmittedByUserId`, `InspectionReportApprovedAt`, `InspectionReportApprovedByUserId`, `InspectionRejectionReason`.
  - Migration EF Core: `AddInspectionReportAndPendingApprovalStatus` đã được áp dụng vào PostgreSQL.

- [X] **Quy trình Phân công 2 Tầng & Nghiệm thu Nội bộ**:
  - **Tầng 1**: Điều phối viên (Dispatcher) tiếp nhận và chuyển giao đơn về Đơn vị xử lý (`DepartmentId`).
  - **Tầng 2**: Trưởng đơn vị (`IsUnitLead`) nhận thông báo SignalR, phân công Thành viên trực tiếp thụ lý (`AssignMemberCommand`).
  - **Trao đổi nội bộ**: Kênh thảo luận thời gian thực (`InternalThreadPanel`) dựa trên SignalR cho các cán bộ trong đơn vị.
  - **Nghiệm thu thực địa**: Cán bộ hoàn tất thẩm tra thực tế, lập văn bản Báo cáo nghiệm thu nộp lên Trưởng đơn vị (`Investigating = 3` → `PendingApproval = 11`).
  - **Thẩm định & Ban hành kết luận**: Trưởng đơn vị đọc báo cáo và thẩm định:
    - Nếu Đạt: Phê chuẩn báo cáo nghiệm thu và ban hành kết luận chính thức (`PendingApproval = 11` → `Resolved = 4`).
    - Nếu Chưa đạt: Yêu cầu thẩm tra lại kèm lý do chỉ đạo (`PendingApproval = 11` → `Investigating = 3`).
  - **Strict RBAC**: Chuyên viên thường không được phép tự duyệt hồ sơ của mình thành `Resolved`; chỉ Trưởng đơn vị hoặc SuperAdmin mới có quyền phê duyệt nghiệm thu và ban hành kết luận.

- [X] **Giao diện Người dùng (Frontend)**:
  - `AdminPetitionDetailPage.tsx`:
    - Thêm badge và Stepper step cho trạng thái `11 - Chờ duyệt nghiệm thu`.
    - Banner cảnh báo khi hồ sơ ở trạng thái `11` kèm nút thẩm định nhanh.
    - Khối "Báo Cáo Nghiệm Thu Thực Địa Đơn Vị" (D1) hiển thị nội dung báo cáo, cán bộ nộp, trạng thái phê chuẩn và ý kiến chỉ đạo.
    - Tích hợp 2 tabs: Kênh Trao Đổi Nội Bộ Đơn Vị (`InternalThreadPanel`) và Sổ Tay Nghiệp Vụ & Biên Bản Thực Địa.
    - Nút hành động Top Bar: "Phân công cán bộ", "Nộp báo cáo nghiệm thu", "Thẩm định & Duyệt nghiệm thu".
  - `UnitDashboardPage.tsx` (`/admin/unit-dashboard`):
    - Trung tâm điều phối đơn vị dành riêng cho Trưởng đơn vị: Thống kê số lượng theo trạng thái, bảng tải công việc của thành viên trong đội ngũ, danh sách hồ sơ chờ phân công và chờ duyệt nghiệm thu.
  - `Navbar.tsx` & `App.tsx`:
    - Tích hợp điều hướng `/admin/unit-dashboard` trên Desktop Navbar, Sub-nav bar, User Dropdown và Mobile Drawer cho Trưởng đơn vị và SuperAdmin.

- [X] **Kiểm thử Toàn diện**:
  - Backend Unit Tests: **50/50 test cases PASSED** (thêm `AssignMemberCommandHandlerTests` và `PetitionWorkflowServiceTests` cho trạng thái 11).
  - Frontend Production Build: `tsc -b && vite build` – **✅ Thành công 100% (0 errors)**.

---

### TASK-PERMISSION-AND-WORKFLOW-REFINEMENT: Tinh Chỉnh Phân Quyền, Kênh Trao Đổi Nghiệp Vụ & Hiển Thị Hồ Sơ Công Dân *(25/10/2026 – PLAN-20261025)*

- [X] **1. Kênh trao đổi nghiệp vụ nội bộ phân cấp**:
  - Phân tách rõ ràng giữa:
    - **Kênh Nội Bộ Đơn Vị**: Nơi Trưởng đơn vị và Cán bộ chuyên viên trong đơn vị phụ trách trao đổi nghiệp vụ theo từng hồ sơ/nhiệm vụ.
    - **Kênh Điều Phối Chung (Cấp Phòng)**: Dành riêng cho Trưởng phòng/Trưởng đơn vị giao tiếp, báo cáo và nhận chỉ đạo từ Cán bộ tiếp nhận (`Dispatcher`) và Quản trị viên (`SuperAdmin`). Chuyên viên thường (`!IsUnitLead`) bị ẩn tab này.
  - Hỗ trợ SignalR thời gian thực, tự động lọc và gắn nhãn kênh tin nhắn.

- [X] **2. Ẩn khối Văn bản kết luận & Quyết định xử lý khi chưa nghiệm thu**:
  - Khối này chỉ hiển thị khi hồ sơ đã hoàn thành nghiệm thu thực địa (`inspectionReportApprovedAt != null` hoặc trạng thái `Resolved = 5`, `Closed = 6`).
  - Nút "Chỉnh sửa văn bản" và "Ban hành kết luận ngay" chỉ hiển thị cho Trưởng đơn vị (`IsUnitLead`) phụ trách và SuperAdmin. Cán bộ không có thẩm quyền bị ẩn hoàn toàn các nút tác vụ.

- [X] **3. Nút Bắt đầu thẩm tra**:
  - Chỉ xuất hiện ở nhân viên xử lý khi Trưởng đơn vị đã điều phối cho nhân viên đó (`petition.assignedUserId != null` và `user.id === petition.assignedUserId`).
  - Trưởng đơn vị và các cán bộ khác không thấy nút này (trừ khi chính Trưởng đơn vị tự phân công cho mình).

- [X] **4. Luân chuyển trạng thái**:
  - Ẩn hoàn toàn tính năng/nút "Luân chuyển trạng thái" đối với toàn bộ cán bộ chuyên môn (`Specialist`).
  - Chỉ cho phép Cán bộ tiếp nhận (`Dispatcher`) và Quản trị viên (`SuperAdmin`) sử dụng tính năng này trên `AdminPetitionDetailPage`, `AdminPetitionsPage`, và `KanbanCard`.

- [X] **5. Tự động hiển thị phản ánh của Công dân đã có tài khoản**:
  - Trang tra cứu tiến độ (`/tra-cuu` - `TrackPetitionPage`) tự động nhận diện công dân đăng nhập, lấy số điện thoại của tài khoản (`user.phoneNumber`) và tải về danh sách phản ánh.
  - Hiển thị banner chào mừng công dân, danh sách hồ sơ với đầy đủ bộ lọc, thẻ trực quan và xem nhanh chi tiết tiến độ 1-chạm.
  - Seed dữ liệu gán sẵn hồ sơ cho tài khoản `ngudan` (`0909888999`).

---

### TASK-FIX-INSPECTION-NOTE-ERROR: Khắc Phục Lỗi Cán Bộ Thụ Lý Tạo Biên Bản Thực Địa *(26/10/2026 – PLAN-20261026)*

- [X] **Nguyên nhân gốc rễ**:
  - `axiosClient.ts` cấu hình mặc định `'Content-Type': 'application/json'`.
  - Trong `adminApi.ts` và `petitionApi.ts`, các phương thức gửi `FormData` (`addInspectionNote`, `createOnBehalf`, `createPetition`, `submitAdditionalInfo`) gán thủ công header `{ headers: { 'Content-Type': 'multipart/form-data' } }`.
  - Việc gán tường minh làm mất chuỗi boundary của multipart/form-data, khiến Kestrel .NET 9 trả về lỗi `400 Bad Request: Failed to read the request form. Missing content-type boundary.`
- [X] **Giải pháp triển khai**:
  - `axiosClient.ts`: Bổ sung request interceptor tự động xóa `Content-Type` khi payload là `FormData` (`delete config.headers['Content-Type']`) để Axios và trình duyệt tự động đính kèm boundary chuẩn xác.
  - `adminApi.ts` & `petitionApi.ts`: Chuẩn hóa các hàm gọi API upload file, loại bỏ các header ghi đè thủ công.
  - `AddInspectionNoteModal.tsx`: Nâng cấp cơ chế trích xuất thông báo lỗi từ cấu trúc `ProblemDetails` (`title`, `errors`, `message`).
- [X] **Kiểm thử**:
  - Backend Unit Tests: 50/50 test cases PASSED.
  - Backend Integration Tests: 6/6 test cases PASSED.
  - Frontend Build: `tsc -b && vite build` – PASSED 100% (0 errors).





