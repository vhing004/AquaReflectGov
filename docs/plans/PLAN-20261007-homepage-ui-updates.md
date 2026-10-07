# Kế Hoạch Cập Nhật Trang Chủ UI (PLAN-20261007-homepage-ui-updates)

> **Mục tiêu**: Nâng cấp giao diện Trang chủ (HomePage) phân hệ công khai cho người dân & ngư dân, hiển thị gọn gàng 4 danh mục chuyên ngành kèm ảnh minh họa trực quan, hỗ trợ xem nhanh phản ánh đã xử lý theo danh mục, và thêm Section trưng bày các phản ánh đã giải quyết thành công một cách thông minh.

---

## 📐 1. Yêu Cầu Chi Tiết & Giải Pháp Thiết Kế

### 1.1 Hiển thị 4 Danh mục chuyên ngành & Mở rộng linh hoạt
- **Hiện trạng**: Trang chủ đang hiển thị toàn bộ 6+ danh mục dạng grid 3 cột, chiếm nhiều diện tích.
- **Giải pháp**:
  - Mặc định chỉ hiển thị **4 danh mục chính**.
  - Thêm nút toggle **"Xem tất cả danh mục (X)"** / **"Thu gọn"** với hiệu ứng chuyển động mượt mượt (smooth animation).
  - Giữ lại đường dẫn liên kết sang trang `/categories` để tra cứu chi tiết khung thời gian SLA.

### 1.2 Thêm Ảnh đại diện chuyên ngành cho từng Danh mục
- **Giải pháp**:
  - Map bộ sưu tập ảnh chất lượng cao (High Quality Ocean/Fishery images) cho từng mã chuyên ngành:
    - `O_NHIEM_NUOC`: Nguồn nước kênh rạch/ao nuôi thủy sản.
    - `DICH_BENH`: Ao nuôi tôm cá / kiểm tra dịch bệnh.
    - `VI_PHAM_IUU`: Tàu cá đánh bắt xa bờ / lực lượng Kiểm ngư tuần tra.
    - `GIONG_THUC_AN`: Con giống tôm cá / thức ăn chăn nuôi thủy sản.
    - `HA_TANG_CANG_CA`: Cảng cá Sa Kỳ / Sông Đốc, luồng lạch tàu thuyền.
    - `THU_TUC_HANH_CHINH`: Giấy tờ đăng kiểm tàu cá / thủ tục công vụ.
    - `KHAC`: Hoạt động thủy sản tổng hợp.
  - Card danh mục được thiết kế lại với ảnh nền/ảnh header tràn viền (Card Banner Image), lớp phủ gradient mờ giúp text rõ ràng và nổi bật.

### 1.3 Nút "Xem phản ánh đã xử lý" trên từng Item Danh mục
- **Giải pháp**:
  - Mỗi Card danh mục bổ sung nút hành động phụ: **"Xem X phản ánh đã xử lý"** (kèm icon `CheckCircle2` / `Eye`).
  - Khi người dùng nhấp vào:
    - Tự động cuộn mượt (Smooth Scroll) xuống Section **"Hồ sơ Phản ánh Đã Giải quyết & Công khai"**.
    - Tự động active Tab lọc của danh mục tương ứng.

### 1.4 Section "Hồ sơ Phản ánh Đã Giải quyết & Công khai" (Hiển thị Thông minh)
- **Backend API mới**:
  - Xây dựng Query & Endpoint mới `GET /api/v1/petitions/public-resolved` (cho phép lọc theo `categoryCode`, sắp xếp theo mới nhất hoặc điểm đánh giá CSAT 5 sao).
- **Giao diện Frontend mới (HomePage Section)**:
  - **Thanh Filter Tabs**: *Tất cả* | *Ô nhiễm nước* | *Dịch bệnh tôm cá* | *Vi phạm IUU* | *Giống & Thức ăn* | ...
  - **Lựa chọn Sắp xếp**: *Mới giải quyết nhất* | *Đánh giá hài lòng nhất (5 sao)*.
  - **Card Hồ sơ Đã Giải quyết Thông minh**:
    - **Header**: Badge Mã hồ sơ (`#TS-202610-00001`), Badge Chuyên mục, Thời gian xử lý thực tế (ví dụ: *"Hoàn tất trong 18h - Sớm hơn SLA 6h"*).
    - **Body**: Tiêu đề phản ánh, Địa bàn (Xã/Huyện), Thumbnail ảnh hiện trường.
    - **Khối Kết quả thụ lý của Cán bộ**: Hiển thị tóm tắt Văn bản kết luận chính thức kèm dấu tích xác nhận từ Cơ quan thụ lý.
    - **Khối Đánh giá CSAT**: Số sao (1-5 sao) và câu nhận xét trực tiếp của công dân.
    - **Nút tương tác**: Bấm vào Card để mở Modal hoặc chuyển sang trang Tra cứu đầy đủ `/track/{trackingCode}`.

---

## 🛠️ 2. Danh Sách Các File Cần Tạo / Sửa Đổi

### Backend (.NET 9 Web API)
1. `src/AquaReflect.Application/Features/Petitions/Queries/GetPublicResolvedPetitions/GetPublicResolvedPetitionsQuery.cs` *(Tạo mới)*
2. `src/AquaReflect.Application/Features/Petitions/Queries/GetPublicResolvedPetitions/GetPublicResolvedPetitionsQueryHandler.cs` *(Tạo mới)*
3. `src/AquaReflect.Application/Features/Petitions/DTOs/PublicResolvedPetitionDto.cs` *(Tạo mới)*
4. `src/AquaReflect.Api/Controllers/PetitionsController.cs` *(Cập nhật thêm endpoint `GET /api/v1/petitions/public-resolved`)*

### Frontend (React 19 + TypeScript + Tailwind CSS)
1. `src/api/petitionApi.ts` *(Cập nhật hàm `getPublicResolvedPetitions`)*
2. `src/pages/HomePage.tsx` *(Cập nhật UI 4 danh mục, ảnh minh họa, toggle xem thêm, nút lọc & Section hiển thị phản ánh đã xử lý)*
3. `src/components/ResolvedPetitionCard.tsx` *(Tạo mới component card phản ánh đã xử lý thông minh)*

---

## 🧪 3. Kế Hoạch Kiểm Thử (Verification Plan)

1. **Kiểm thử Danh mục**:
   - Mở Trang chủ: Kiểm tra chỉ hiển thị đúng 4 danh mục ban đầu.
   - Bấm "Xem tất cả danh mục": Mở rộng ra toàn bộ 6+ danh mục.
   - Kiểm tra ảnh đại diện chất lượng cao cho từng danh mục hiển thị đẹp mắt.
2. **Kiểm thử Phản ánh Đã Xử lý trên Trang chủ**:
   - Bấm nút "Xem phản ánh đã xử lý" trên card danh mục IUU $\rightarrow$ Màn hình tự động cuộn xuống phần Phản ánh đã giải quyết và kích hoạt tab IUU.
   - Chuyển tab lọc các danh mục khác $\rightarrow$ Danh sách phản ánh đã giải quyết thay đổi tương ứng.
   - Click vào 1 card phản ánh đã giải quyết $\rightarrow$ Hiển thị chi tiết kết quả thụ lý chính thức và đánh giá CSAT 5 sao của người dân.
