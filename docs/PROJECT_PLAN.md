# AQUAREFLECT - KẾ HOẠCH DỰ ÁN TỔNG THỂ (PROJECT PLAN)

> Hệ thống Tiếp nhận, Xử lý và Giám sát Phản ánh Kiến nghị Ngành Thủy sản (AquaReflect Gov)

---

## 1. Tổng quan & Mục tiêu Dự án
Hệ thống chính quyền số phục vụ công tác giám sát, tiếp nhận và điều phối giải quyết phản ánh kiến nghị của ngư dân, cơ sở nuôi trồng và chế biến thủy sản:
- Chống khai thác hải sản bất hợp pháp, không báo cáo và không theo quy định (IUU).
- Giám sát ô nhiễm nguồn nước và cảnh báo dịch bệnh thủy sản.
- Trực quan hóa bản đồ số GIS không gian địa lý thời gian thực.
- Đảm bảo tính minh bạch, hỗ trợ đa kênh (Web, Di động, Mã định danh tra cứu duy nhất).

---

## 2. Các Giai đoạn Phát triển (Phases)

### Phase 1: Nền tảng Core, Kiến trúc & Tiếp nhận hồ sơ (Hoàn thành)
- [x] Thiết kế CSDL PostgreSQL với EF Core, hỗ trợ chuẩn Audit Trail và SLA.
- [x] API Tiếp nhận hồ sơ, sinh mã tra cứu duy nhất `TS-yyyyMM-XXXXX`.
- [x] Module tra cứu công khai và đánh giá mức độ hài lòng (CSAT).
- [x] Xác thực phân quyền RBAC đa cấp (Công dân, Chuyên viên, Điều phối viên, Lãnh đạo).

### Phase 2: Dịch vụ Không gian Địa lý GIS & Giám sát Trực quan (Đang hoàn thiện & Tối ưu)
- [x] API truy vấn GeoJSON FeatureCollection theo RFC 7946 và Heatmap mật độ sự cố.
- [x] Bản đồ số tương tác Leaflet với phân tầng lớp bản đồ (Giao thông, Vệ tinh).
- [ ] **Task 20261012-01 (Đang thực hiện):** Khắc phục hiển thị bản đồ, hiển thị toàn bộ điểm nóng và kiến nghị đã giải quyết (Chi tiết: [PLAN-20261012-gis-map-hotspots-resolved.md](file:///d:/AquaReflect/docs/plans/PLAN-20261012-gis-map-hotspots-resolved.md)).

### Phase 3: Tự động hóa Thông minh & Cảnh báo Sớm (Dự kiến)
- [ ] Tự động phân luồng thụ lý theo tọa độ địa bàn và lĩnh vực phụ trách.
- [ ] Tích hợp cảnh báo vượt ranh giới ngư trường biển từ dữ liệu giám sát tàu cá (VMS).
- [ ] Báo cáo thống kê phân tích KPI và phân vùng nguy cơ bùng phát dịch bệnh.

### Phase 4: Hoàn thiện Toàn diện Chu trình Xử lý Phản ánh 5 Bước (Đang chuẩn bị triển khai)
- [ ] Mở rộng State Machine: Hỗ trợ các trạng thái ngoại lệ `NeedInfo`, `Merged`, `Forwarded`, `Withdrawn`.
- [ ] Bảo mật đơn vô danh: Sinh mã PIN bảo mật ngẫu nhiên (băm SHA-256) dùng để tra cứu, bổ sung và đánh giá.
- [ ] Dịch vụ ngày làm việc & Quản trị SLA: Trừ thứ 7, CN và ngày nghỉ lễ Tết; tạm dừng SLA khi ở trạng thái `NeedInfo`.
- [ ] Quy trình kiểm duyệt đóng đơn 2 lớp: Chuyên viên kết luận ➔ Dispatcher kiểm tra duyệt hoặc trả về xử lý lại.
- [ ] Cơ chế đánh giá CSAT & Đề nghị mở lại hồ sơ (ReopenCount = 1) khi CSAT ≤ 2 sao.
- [ ] Các Background Jobs tự động: Tự động đóng đơn quá hạn duyệt, tự động từ chối đơn quá hạn bổ sung, cảnh báo SLA leo thang.
*(Chi tiết kế hoạch: [PLAN-20261017-comprehensive-petition-workflow.md](file:///d:/AquaReflect/docs/plans/PLAN-20261017-comprehensive-petition-workflow.md))*

---

## 3. Nhật ký Task & Kế hoạch Chi tiết

| Mã Task | Tên Task | Ngày bắt đầu | Ngày hoàn thành | Trạng thái | Ghi chú |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `20260921-4.1` | GIS Spatial API GeoJSON | 21/09/2026 | 21/09/2026 | ✅ Hoàn thành | Đạt chuẩn RFC 7946 |
| `20260921-4.2` | Frontend GIS Map Leaflet | 21/09/2026 | 21/09/2026 | ✅ Hoàn thành | Tích hợp lớp nhiệt Heatmap |
| `20261009-02` | Smart Location Selector | 09/10/2026 | 09/10/2026 | ✅ Hoàn thành | Chọn địa bàn 3 vùng |
| `20261012-01` | Sửa hiển thị bản đồ & Điểm nóng GIS | 12/10/2026 | 12/10/2026 | ✅ Hoàn thành | [Chi tiết plan](file:///d:/AquaReflect/docs/plans/PLAN-20261012-gis-map-hotspots-resolved.md) |
| `20261016-01` | Hoàn thiện Báo cáo Thực tập Chương 2 (2.1 - 2.6) | 16/10/2026 | 16/10/2026 | ✅ Hoàn thành | [Chi tiết plan](file:///d:/AquaReflect/docs/plans/PLAN-20261016-report-ch2-sections-24-25-26.md) |
| `20261017-01` | Bổ sung Khung Ảnh Demo & Note Hướng dẫn Chụp (Mục 2.6.1) | 17/10/2026 | 17/10/2026 | ✅ Hoàn thành | [Chi tiết plan](file:///d:/AquaReflect/docs/plans/PLAN-20261017-report-ch2-screenshots-guide.md) |
| `20261017-02` | GPS 1 chạm & Tự động Reverse Geocode điền địa bàn | 17/10/2026 | 17/10/2026 | ✅ Hoàn thành | [Chi tiết plan](file:///d:/AquaReflect/docs/plans/PLAN-20261017-gps-auto-reverse-geocode.md) |
| `20261017-04` | Hoàn thiện Toàn diện Quy trình Xử lý Phản ánh 5 bước | 17/10/2026 | - | 🔄 Đang triển khai | [Chi tiết plan](file:///d:/AquaReflect/docs/plans/PLAN-20261017-comprehensive-petition-workflow.md) |
| `20261018-1.1` | Mở rộng PetitionStatus & Entity Petition | 18/10/2026 | 18/10/2026 | ✅ Hoàn thành | 4 status mới, 12 trường mới, Migration EF Core |
| `20261018-1.2` | Quản trị Cấu hình Hệ thống & Lịch Nghỉ lễ | 18/10/2026 | 18/10/2026 | ✅ Hoàn thành | Entity SystemSetting & HolidayCalendar, Seed VN 2026 |
| `20261018-1.3` | Dịch vụ WorkingDaysService & Tạm dừng SLA | 18/10/2026 | 18/10/2026 | ✅ Hoàn thành | Engine tính ngày làm việc, trừ T7/CN/Lễ, bù giờ SLA |
| `20261018-2.1` | Sinh PIN Vô danh & Băm SHA-256, API Rút đơn | 18/10/2026 | 18/10/2026 | ✅ Hoàn thành | Băm SHA-256 PIN ngẫu nhiên, Endpoint /withdraw |
| `20261018-2.2` | Frontend Modal PIN Bảo Mật (Submit) | 18/10/2026 | 18/10/2026 | ✅ Hoàn thành | AnonymousPinModal, sao chép PIN, luồng nộp đơn vô danh |
| `20261018-2.3` | Frontend Tra cứu Bảo mật & Rút đơn | 18/10/2026 | 18/10/2026 | ✅ Hoàn thành | WithdrawPetitionModal, nút Rút đơn trang /track, cập nhật realtime |
| `20261018-3.1` | API & Giao diện Phân công & Xử lý ngoại lệ | 18/10/2026 | 18/10/2026 | ✅ Hoàn thành | TransitionStatus mở rộng: NeedInfo, Merged, Forwarded, Rejected; Tabs & Banners |
| `20261019-3.2` | Cơ chế tiếp nhận bổ sung hồ sơ từ công dân | 19/10/2026 | 19/10/2026 | ✅ Hoàn thành | API nộp tài liệu bổ sung, unpause SLA, SubmitAdditionalInfoModal, Alert Banner /track |
| `20261019-3.3` | Bảo mật GIS: Lọc trạng thái, Obfuscate tọa độ ~100m, Strip EXIF GPS | 19/10/2026 | 19/10/2026 | ✅ Hoàn thành | Lọc public statuses, SHA256 hash noise, strip ExifGPS endpoint công khai, privacy badge popup |
| `20261019-4.1` | Nghiệp vụ Hiện trường & Yêu cầu bổ sung tại chỗ | 19/10/2026 | 19/10/2026 | ✅ Hoàn thành | Endpoint begin-investigation, AddInspectionNoteModal GPS thực địa, nút Yêu cầu bổ sung NeedInfo |
| `20261019-02` | Bổ sung Mục 2.4 (Thiết kế CSDL) & 2.5 (Thiết kế API) Báo cáo Ch2 | 19/10/2026 | 19/10/2026 | ✅ Hoàn thành | [Chi tiết plan](file:///d:/AquaReflect/docs/plans/PLAN-20261019-report-ch2-sections-24-db-25-api.md) |
| `20261019-03` | Chuẩn hóa 10 Use Case, cập nhật Sơ đồ & Đặc tả vào Báo cáo Ch2 | 19/10/2026 | 19/10/2026 | ✅ Hoàn thành | [Chi tiết plan](file:///d:/AquaReflect/docs/plans/PLAN-20261019-update-usecase-specifications.md) |
| `20261019-04` | Tách UC10 thành UC10 & UC11, chuẩn hóa đặc tả 11 UC (7 mục chuẩn) | 19/10/2026 | 19/10/2026 | ✅ Hoàn thành | [Chi tiết plan](file:///d:/AquaReflect/docs/plans/PLAN-20261019-split-uc10-into-two-usecases.md) |
| `20261020-4.2` | Ban hành kết luận có cấu trúc & Chốt mốc SLA | 20/10/2026 | 20/10/2026 | ✅ Hoàn thành | [Chi tiết plan](file:///d:/AquaReflect/docs/plans/PLAN-20261020-task4.2-structured-resolution-sla.md) |
| `20261020-5.1` | Dispatcher Kiểm duyệt Đóng đơn & Yêu cầu xử lý lại | 20/10/2026 | 20/10/2026 | ✅ Hoàn thành | [Chi tiết plan](file:///d:/AquaReflect/docs/plans/PLAN-20261020-task5.1-dispatcher-review-close-or-rework.md) |

