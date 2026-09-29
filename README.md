# 🌊 AquaReflect — Nền Tảng Số Tiếp Nhận, Điều Phối & Xử Lý Phản Ánh Thủy Sản

![AquaReflect Banner](https://img.shields.io/badge/AquaReflect-Govern-006194?style=for-the-badge&logo=react)
![.NET 9](https://img.shields.io/badge/.NET_9.0-API-512BD4?style=for-the-badge&logo=dotnet)
![React 19](https://img.shields.io/badge/React_19-TypeScript-61DAFB?style=for-the-badge&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-4169E1?style=for-the-badge&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker)

**AquaReflect** là hệ thống thông tin chính quyền số đa kênh phục vụ tiếp nhận, phân loại, điều phối và xử lý phản ánh kiến nghị trong lĩnh vực **Thủy sản & Ngư nghiệp** (dịch bệnh thủy sản, ô nhiễm môi trường nước ao nuôi, vi phạm ranh giới biển/IUU, vật tư thức ăn/con giống kém chất lượng, thủ tục hành chính nghề cá).

---

## 🚀 Công Nghệ Sử Dụng (Tech Stack)

### 🔹 Backend (.NET 9 Web API)
- **Kiến trúc**: Clean Architecture (Domain, Application, Infrastructure, API).
- **Core Framework**: .NET 9, C# 13, MediatR (CQRS Pattern), FluentValidation.
- **Database & GIS**: EF Core 9, PostgreSQL 16 + PostGIS 3.4 (Npgsql.EntityFrameworkCore.PostgreSQL.NetTopologySuite, SRID 4326).
- **Real-time & Email**: ASP.NET Core SignalR WebSockets, MailKit / SmtpClient.
- **Báo cáo & Xuất bản**: ClosedXML (Xuất Sổ bộ Excel), QuestPDF (Xuất Báo cáo KPI PDF).
- **Bảo mật**: ASP.NET Core Rate Limiting, Cloudflare Turnstile Verification, HtmlSanitizer (Anti-XSS), JWT & Refresh Token Auth.

### 🔹 Frontend (React 19 + TypeScript)
- **Framework & Build tool**: React 19, TypeScript 5, Vite, Tailwind CSS v4.
- **State & Data Fetching**: Zustand (Auth store), TanStack React Query v5.
- **Bản đồ GIS**: Leaflet.js, React-Leaflet, Leaflet.heat (Bản đồ nhiệt cảnh báo điểm nóng).
- **Biểu đồ Analytics**: Recharts.
- **UI Components**: Lucide Icons, Modern Glassmorphism & Responsive Layout.

### 🔹 Hạ Tầng & Triển Khai (DevOps)
- **Containerization**: Docker Multi-stage Builds (`backend/Dockerfile`, `frontend/Dockerfile`).
- **Orchestration**: Docker Compose (`docker-compose.yml`) điều phối PostgreSQL PostGIS, .NET API & Nginx Reverse Proxy.

---

## 🎯 Các Tính Năng Nổi Bật

### 👥 Phía Người Dân / Ngư Dân (Public Portal)
1. **Gửi Phản ánh Đa phương tiện Wizard 4 bước**:
   - Định vị GPS tự động hoặc chọn trên bản đồ không gian.
   - Upload nhiều ảnh/video minh chứng hiện trường.
   - Bẫy bot Honeypot & Cloudflare Turnstile bảo vệ.
   - Mã tra cứu độc bản dạng `TS-yyyyMM-XXXXX` & Mã QR Biên nhận động.
2. **Tra cứu Tiến độ Công khai & Che mờ Bảo mật**:
   - Tra cứu qua mã đơn hoặc số điện thoại công dân.
   - Timeline 4 bước minh bạch và thông tin chi tiết từng giai đoạn thụ lý.
3. **Bản đồ Cảnh báo Điểm nóng Cộng đồng (GIS Public Map)**:
   - Theo dõi các vụ việc ô nhiễm, dịch bệnh, vi phạm trên bản đồ tương tác real-time.
4. **Đánh giá Hài lòng (Feedback 5 sao)**:
   - Người dân đánh giá chất lượng phục vụ sau khi nhận kết quả giải quyết chính thức.

---

### 🏛️ Phía Cán Bộ / Quản Trị Viên (Admin Portal `/admin`)
1. **Ma trận Luân chuyển Trạng thái (Workflow State Machine 6 bước)**:
   - Quyền hạn nghiêm ngặt theo vai trò: `SuperAdmin`, `Dispatcher` (Điều phối), `Specialist` (Chuyên viên thụ lý), `Citizen`.
   - Audit Trail tự động ghi lại lịch sử thao tác của từng cán bộ.
2. **Chế độ Xem Linh hoạt: Danh sách & Bảng Kanban Thông minh**:
   - Vòng màu cảnh báo SLA khẩn cấp (Xanh $\rightarrow$ Vàng $\leq 48h$ $\rightarrow$ Đỏ $\leq 24h$ $\rightarrow$ Red Pulse khi quá hạn).
   - Tự động gợi ý phòng ban/cán bộ nhàn rỗi nhất để phân công đơn.
3. **Trung tâm Chỉ huy GIS & Phân tích Bản đồ Nhiệt (GIS Command Center `/admin/gis-map`)**:
   - Multi-layer Base Map (OpenStreetMap, Esri Satellite, CartoDB).
   - Lọc Bounding Box, quét bán kính không gian Haversine (5km - 50km).
   - Leaflet Heatmap trực quan hóa mật độ điểm nóng ô nhiễm / dịch bệnh / IUU.
4. **Dashboard KPI & Giám sát Hiệu suất (Analytics Dashboard `/admin/dashboard`)**:
   - Thống kê tỷ lệ đúng hạn SLA, thời gian xử lý trung bình, điểm CSAT hài lòng.
   - Xuất file **Excel (.xlsx)** sổ bộ phản ánh và file **PDF (.pdf)** báo cáo KPI chuyên nghiệp.
5. **Thông báo Thời gian thực (Real-time SignalR Notifications)**:
   - Chuông thông báo trên Navbar, Toast popover khi có phản ánh mới hoặc thay đổi trạng thái.

---

## ⚡ Hướng Dẫn Chạy Nhanh Trong 5 Phút (Quick Start)

### Cách 1: Chạy bằng Docker Compose (Khuyên dùng)

#### Bước 1: Khởi tạo biến môi trường
```bash
cp .env.example .env
```

#### Bước 2: Khởi chạy toàn bộ hệ thống bằng Docker Compose
```bash
docker compose up -d --build
```

#### Bước 3: Truy cập hệ thống
- 🌐 **Cổng Công dân & Quản trị**: `http://localhost`
- ⚙️ **Backend API Swagger Docs**: `http://localhost:8080/swagger`

---

### Cách 2: Chạy Môi Trường Local Development

#### Yêu cầu hệ thống:
- .NET 9 SDK
- Node.js 22 LTS
- PostgreSQL 16 tích hợp Extension PostGIS 3.4

#### 1. Khởi tạo CSDL PostgreSQL / PostGIS
Tạo Database tên `AquaReflectDb` và kích hoạt extension:
```sql
CREATE DATABASE "AquaReflectDb";
\c "AquaReflectDb";
CREATE EXTENSION IF NOT EXISTS postgis;
```

#### 2. Khởi chạy Backend (.NET API)
```bash
cd backend/src/AquaReflect.Api
dotnet run
```
*Lưu ý: Hệ thống sẽ tự động seed dữ liệu mẫu (Roles, Departments, Categories, Admin Accounts) khi khởi chạy lần đầu.*

#### 3. Khởi chạy Frontend (React Vite)
```bash
cd frontend
npm install
npm run dev
```
Truy cập Frontend tại: `http://localhost:5173`

---

## 🔐 Tài Khoản Cán Bộ Dùng Thử (Seeded Accounts)

| Vai trò | Tên đăng nhập | Mật khẩu | Phạm vi quyền hạn |
|---|---|---|---|
| **SuperAdmin** | `admin` | `Admin@123456` | Toàn quyền quản trị hệ thống, quản lý tài khoản & danh mục |
| **Dispatcher** | `dispatcher` | `Dispatcher@123456` | Tiếp nhận đơn mới, phân công về cơ quan chuyên môn |
| **Specialist** | `specialist1` | `Specialist@123456` | Cán bộ Chi cục Thủy sản: Thụ lý & Ban hành kết luận |
| **Specialist** | `specialist2` | `Specialist@123456` | Cán bộ Chi cục Kiểm ngư: Thụ lý & Ban hành kết luận |

---

## 🧪 Chạy Bộ Kiểm Thử (Unit & Integration Tests)

Hệ thống tích hợp 21 test cases tự động bằng xUnit, Moq, FluentAssertions và InMemory Database:

```bash
# Chạy tất cả Unit Tests & Integration Tests
dotnet test
```

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
AquaReflect/
├── backend/
│   ├── src/
│   │   ├── AquaReflect.Domain/          # Core Domain Entities, Enums, Value Objects
│   │   ├── AquaReflect.Application/     # CQRS Handlers, DTOs, Interfaces, Workflow
│   │   ├── AquaReflect.Infrastructure/  # EF Core, PostGIS, SignalR, Excel/PDF Services
│   │   └── AquaReflect.Api/             # Controllers, Middlewares, Rate Limiting, Hubs
│   ├── tests/
│   │   ├── AquaReflect.UnitTests/       # 17 Unit test cases
│   │   └── AquaReflect.IntegrationTests/# 4 Integration test cases
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/                         # Axios REST API Clients
│   │   ├── components/                  # UI Components (Admin, Citizen, GIS, Modals)
│   │   ├── pages/                       # Route Pages (Dashboard, GIS, Petitions, Detail)
│   │   ├── store/                       # Zustand Stores (Auth, State)
│   │   └── types/                       # TypeScript Interfaces & DTOs
│   ├── Dockerfile
│   └── nginx.conf                       # Nginx Reverse Proxy Config
├── docs/                                # Kế hoạch chi tiết & Tài liệu kiến trúc
├── docker-compose.yml                   # Docker Compose Orchestration
├── PROJECT_PLAN.md                      # Kế hoạch phát triển tổng thể
└── SETUP.md                             # Hướng dẫn Vận hành & Cấu hình Chi tiết
```

---

## 🛡️ Cam Kết Bảo Mật & An Toàn Dữ Liệu
- Hệ thống không lưu trữ hay đẩy các file bí mật (`.env`, JWT secret keys, DB passwords) lên hệ thống quản lý phiên bản Git.
- Mọi dữ liệu đầu vào đều qua bộ lọc `HtmlSanitizer` và `InputSanitizer` chống tấn công XSS/SQL Injection.

---

**© 2026 AquaReflect. Phát triển phục vụ Chuyển đổi số ngành Thủy sản & Chính quyền số.**
