# 📘 Hướng dẫn Cài đặt & Vận hành Hệ thống AquaReflect (SETUP.md)

Chào mừng bạn đến với tài liệu hướng dẫn cài đặt, khởi chạy, quản lý và vận hành hệ thống **AquaReflect** — Nền tảng số phản ánh hiện trường & tiếp nhận ý kiến công dân ngành Thủy sản.

---

## 📐 1. Cấu trúc Hệ thống & Yêu cầu Phần cứng / Phần mềm

### 1.1 Yêu cầu Phần cứng Tối thiểu
- **CPU**: 2 Cores trở lên (khuyên dùng 4 Cores).
- **RAM**: Tối thiểu 4 GB (khuyên dùng 8 GB trở lên nếu chạy toàn bộ bằng Docker).
- **Ổ cứng**: Tối thiểu 10 GB dung lượng đĩa trống.

### 1.2 Yêu cầu Phần mềm (Prerequisites)
Nếu chạy trực tiếp trên máy local (không dùng Docker), bạn cần cài đặt:
- **.NET SDK**: `9.0` trở lên ([Tải tại đây](https://dotnet.microsoft.com/download/dotnet/9.0))
- **Node.js**: `22.x LTS` trở lên & `npm 10.x` ([Tải tại đây](https://nodejs.org/))
- **PostgreSQL**: `16.x` mở rộng extension **PostGIS 3.4** ([Tải PostGIS](https://postgis.net/))

Nếu chạy bằng container (Khuyên dùng):
- **Docker Desktop**: Phiên bản mới nhất trên Windows/macOS/Linux hỗ trợ Docker Compose V2 ([Tải Docker Desktop](https://www.docker.com/products/docker-desktop/)).

---

## ⚡ 2. Khởi chạy Nhanh bằng Docker Compose (Quick Start - Recommended)

Đây là phương pháp nhanh nhất và khuyên dùng để triển khai toàn bộ hệ thống (Database PostGIS, Backend Web API, Frontend React SPA) chỉ với 1 câu lệnh.

### Bước 1: Chuẩn bị biến môi trường
Tạo file `.env` từ file mẫu `.env.example` tại thư mục gốc dự án:
```bash
cp .env.example .env
```
*(Trên Windows PowerShell: `Copy-Item .env.example .env`)*

### Bước 2: Khởi chạy các dịch vụ Docker
```bash
docker compose up -d --build
```

### Bước 3: Kiểm tra các Container đang chạy
```bash
docker compose ps
```
Cả 3 dịch vụ sẽ ở trạng thái **Up (healthy)**:
- `aquareflect_db`: PostgreSQL 16 + PostGIS 3.4 (Cổng `5432`)
- `aquareflect_backend`: ASP.NET Core 9 Web API (Cổng internal `8080`)
- `aquareflect_frontend`: React 19 SPA + Nginx Reverse Proxy (Cổng `80`)

### 🌐 Các đường dẫn truy cập mặc định:
- **Giao diện Web Công dân & Cán bộ (React SPA)**: [http://localhost](http://localhost)
- **Tài liệu kiểm thử API (Swagger UI)**: [http://localhost/swagger](http://localhost/swagger)
- **Tệp tin phương tiện / Ảnh đính kèm**: `http://localhost/uploads/...`
- **SignalR Real-time Hub**: `ws://localhost/hubs/notification`

---

## 💻 3. Hướng dẫn Chạy Môi trường Phát triển Local (Local Development)

Nếu bạn muốn tùy chỉnh code và chạy trực tiếp từng thành phần trên máy tính cá nhân mà không qua Docker:

### 3.1 Khởi chạy Cơ sở dữ liệu PostgreSQL + PostGIS local
Có thể sử dụng Docker để dựng riêng database nhẹ:
```bash
docker run -d --name aquareflect_pg_dev -e POSTGRES_DB=aquareflect_db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgis/postgis:16-3.4-alpine
```

### 3.2 Khởi chạy Backend ASP.NET Core 9 (.NET API)
1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
2. Khôi phục packages:
   ```bash
   dotnet restore
   ```
3. Khởi tạo & Cập nhật Cơ sở dữ liệu EF Core Migrations:
   ```bash
   dotnet ef database update --project src/AquaReflect.Infrastructure --startup-project src/AquaReflect.Api
   ```
4. Chạy Backend Web API:
   ```bash
   dotnet run --project src/AquaReflect.Api
   ```
   *Backend sẽ lắng nghe tại `http://localhost:5000` (hoặc `https://localhost:5001`).*

### 3.3 Khởi chạy Frontend React 19 (Vite)
1. Mở cửa sổ terminal mới và di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```
2. Cài đặt dependencies:
   ```bash
   npm install
   ```
3. Khởi chạy Development Server:
   ```bash
   npm run dev
   ```
   *Frontend sẽ chạy tại `http://localhost:3000`.*

---

## ⚙️ 4. Hướng dẫn Cấu hình Biến Môi Trường (Environment Variables)

Hệ thống quản lý biến môi trường thông qua file `.env` (cho Docker) và `appsettings.json` (cho .NET Backend):

### Các biến môi trường chính trong `.env`:

| Tên biến | Mô tả | Giá trị mặc định mẫu |
| :--- | :--- | :--- |
| `POSTGRES_DB` | Tên CSDL PostgreSQL | `aquareflect_db` |
| `POSTGRES_USER` | Tài khoản quản trị DB | `postgres` |
| `POSTGRES_PASSWORD` | Mật khẩu DB | `AquaReflect@2026!` |
| `POSTGRES_PORT` | Cổng Expose PostGIS DB | `5432` |
| `JWT_SECRET_KEY` | Khóa bí mật ký JWT Token (Tối thiểu 32 ký tự) | `AquaReflectGovSecretKey2026AquacultureSuperSecureKey!` |
| `JWT_ISSUER` | Đơn vị phát hành JWT Token | `AquaReflectGov` |
| `JWT_AUDIENCE` | Đối tượng sử dụng JWT Token | `AquaReflectUsers` |
| `TURNSTILE_SECRET_KEY` | Secret Key xác thực Bot Cloudflare Turnstile | `1x0000000000000000000000000000000AA` *(Test Pass)* |
| `FRONTEND_ORIGIN` | Cấu hình cho phép CORS Origin | `http://localhost` |

---

## 🗄️ 5. Quản lý Cơ sở Dữ liệu & Backup / Restore PostGIS

### 5.1 EF Core Migrations (Thêm thay đổi bảng DB)
Khi bạn thêm Entity mới hoặc sửa đổi thuộc tính trong domain:
```bash
# Tạo Migration mới
dotnet ef migrations add <TenMigration> --project backend/src/AquaReflect.Infrastructure --startup-project backend/src/AquaReflect.Api

# Áp dụng Migration vào DB
dotnet ef database update --project backend/src/AquaReflect.Infrastructure --startup-project backend/src/AquaReflect.Api
```

### 5.2 Sao lưu Cơ sở dữ liệu PostGIS (Backup)
Sử dụng công cụ `pg_dump` từ container Docker DB:
```bash
# Backup dữ liệu ra file SQL
docker exec -t aquareflect_db pg_dump -U postgres -d aquareflect_db > backup_aquareflect_$(date +%Y%m%m).sql

# Backup dạng file Binary nén (.dump)
docker exec -t aquareflect_db pg_dump -U postgres -F c -b -v -f /tmp/aquareflect.dump aquareflect_db
docker cp aquareflect_db:/tmp/aquareflect.dump ./aquareflect_$(date +%Y%m%d).dump
```

### 5.3 Phục hồi Cơ sở dữ liệu PostGIS (Restore)
```bash
# Phục hồi từ file SQL
docker exec -i aquareflect_db psql -U postgres -d aquareflect_db < backup_aquareflect.sql

# Phục hồi từ file Binary (.dump)
docker cp ./aquareflect_backup.dump aquareflect_db:/tmp/aquareflect.dump
docker exec -it aquareflect_db pg_restore -U postgres -d aquareflect_db -v /tmp/aquareflect.dump
```

---

## 🧪 6. Hướng dẫn Kiểm thử (Testing Guide)

Hệ thống AquaReflect đã được tích hợp bộ kiểm thử tự động gồm Unit Tests và Integration Tests.

### Chạy toàn bộ bộ test
```bash
cd backend
dotnet test --logger "console;verbosity=detailed"
```

### Kết quả kiểm thử tiêu chuẩn:
- **Unit Tests (`AquaReflect.UnitTests`)**: 17 Test Cases PASS (Kiểm thử Anti-XSS Sanitizer, Workflow Ma trận trạng thái phản ánh, Validation Rules, Handlers).
- **Integration Tests (`AquaReflect.IntegrationTests`)**: 4 Test Cases PASS (Kiểm thử API Authentication JWT, Danh mục API, GeoJSON / GIS Heatmap Endpoint).

---

## 🛠️ 7. Triển khai Production & Bảo trì (Production & Monitoring)

### 7.1 Lệnh xem Log hệ thống realtime
```bash
# Xem log toàn bộ hệ thống
docker compose logs -f

# Xem log riêng Backend API
docker compose logs -f backend

# Xem log Nginx Frontend
docker compose logs -f frontend
```

### 7.2 Lệnh dừng và khởi động lại
```bash
# Dừng hệ thống (giữ nguyên dữ liệu)
docker compose down

# Dừng và xóa toàn bộ Volumes dữ liệu (CẨN TRỌNG)
docker compose down -v
```

---

## ❓ 8. Xử lý Sự cố Thường gặp (Troubleshooting)

### 🔴 Lỗi 1: `Virtualization support not detected` hoặc Docker không khởi động trên Windows
- **Nguyên nhân**: Tính năng Virtual Machine Platform trong Windows chưa được bật.
- **Khắc phục**: Mở PowerShell dưới quyền Administrator và chạy lệnh:
  ```powershell
  wsl --install --no-distribution
  ```
  Sau đó khởi động lại máy tính (Restart PC).

### 🔴 Lỗi 2: `relation "AdministrativeUnits" does not exist` khi chạy Backend
- **Nguyên nhân**: CSDL PostgreSQL mới tạo chưa được nạp migrations.
- **Khắc phục**: Hệ thống đã hỗ trợ `MigrateAsync()` tự động khi khởi chạy. Nếu cần chạy thủ công, hãy khởi động lại container backend:
  ```bash
  docker compose restart backend
  ```

### 🔴 Lỗi 3: `HTTP 429 Too Many Requests`
- **Nguyên nhân**: Hệ thống đang bật cơ chế Rate Limiting (Tối đa 10 request/phút đối với API tạo phản ánh công dân).
- **Khắc phục**: Vui lòng chờ 1 phút trước khi gửi tiếp request mới hoặc điều chỉnh cấu hình RateLimiter trong `Program.cs`.

---

Nếu có bất kỳ thắc mắc hoặc sự cố phát sinh nào khác trong quá trình vận hành, vui lòng tạo Issue trên Git Repository hoặc liên hệ bộ phận Kỹ thuật AquaReflect.
