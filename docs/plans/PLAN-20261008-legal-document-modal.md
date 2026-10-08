# Kế Hoạch Tích Hợp Popup Xem Văn Bản Pháp Lý Chuẩn Việt Nam (PLAN-20261008-legal-document-modal)

> **Mục tiêu**: Tích hợp Modal Popup tương tác hiển thị toàn văn các Văn bản Quy phạm Pháp luật chính thức (Luật Thủy sản, Luật Bảo vệ Môi trường, Nghị định 26/2019/NĐ-CP, Nghị định 42/2019/NĐ-CP...) định dạng chuẩn văn bản nhà nước Việt Nam trên Trang Chi Tiết Chuyên Ngành.

---

## 📐 1. Yêu Cầu Chi Tiết & Giải Pháp Thiết Kế

### 1.1 Tương Tác Kích Hoạt Popup
- Trong phần **"Căn Cứ Văn Bản Quy Phạm Pháp Luật"** tại `CategoryDetailPage.tsx`:
  - Mỗi thẻ văn bản bổ sung biểu tượng `FileText`, badge mã văn bản và nút hành động **"Xem toàn văn bản quy định"** (kèm hiệu ứng hover/scale).
  - Khi người dùng nhấp vào thẻ văn bản bất kỳ, Modal Popup xem văn bản chính thức sẽ tự động bật mở.

### 1.2 Thiết Kế Modal Văn Bản Pháp Lý Chuẩn Việt Nam
- **Header Modal**:
  - Tiêu đề Modal kèm nút đóng (`X`), nút "In văn bản" (`Printer`) và nút "Tải bản lưu PDF" (`Download`).
- **Nội dung Văn bản (Format chuẩn Thể thức Văn bản Hành chính Nhà nước)**:
  - **Quốc hiệu & Tiêu ngữ**: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM` / `Độc lập - Tự do - Hạnh phúc` (Căn giữa, font in hoa đậm).
  - **Tên Cơ quan Ban hành**: `QUỐC HỘI` / `CHÍNH PHỦ` / `BỘ NÔNG NGHIỆP VÀ PTNT`.
  - **Số hiệu & Ngày ban hành**: Ví dụ `Luật số: 18/2017/QH14`, `Hà Nội, ngày 21 tháng 11 năm 2017`.
  - **Tên loại & Trích yếu nội dung**: Ví dụ `LUẬT THỦY SẢN`, `NGHỊ ĐỊNH QUY ĐỊNH CHI TIẾT MỘT SỐ ĐIỀU VÀ BIỆN PHÁP THI HÀNH LUẬT THỦY SẢN`.
  - **Căn cứ pháp lý**: Các dòng căn cứ Hiến pháp và căn cứ điều khoản thẩm quyền ban hành.
  - **Nội dung Chương & Điều khoản chi tiết**:
    - Trích dẫn các Chương, Điều luật thực tế liên quan đến chuyên ngành thủy sản (Phạm vi điều chỉnh, Quy định vùng nuôi, Kiểm soát dịch bệnh, Chống khai thác IUU, Quản lý cảng cá & Xử phạt vi phạm).
  - **Nơi nhận & Chữ ký thẩm quyền**: `TM. CHÍNH PHỦ - THỦ TƯỚNG` / `CHỦ TỊCH QUỐC HỘI` (Ký tên & Đóng dấu công vụ đỏ).

### 1.3 Cơ Sở Dữ Liệu Văn Bản Pháp Lý Chuẩn
Xây dựng tập dữ liệu văn bản pháp quy thực tế cho các văn bản chính:
1. **Luật Thủy sản 2017** (`Luật số 18/2017/QH14`)
2. **Luật Bảo vệ Môi trường 2020** (`Luật số 72/2020/QH14`)
3. **Nghị định 26/2019/NĐ-CP** (Quy định chi tiết thi hành Luật Thủy sản)
4. **Nghị định 42/2019/NĐ-CP** (Xử phạt vi phạm hành chính trong lĩnh vực Thủy sản - khung phạt IUU lên đến 1 tỷ đồng)
5. **Thông tư 04/2016/TT-BNNPTNT** (Phòng chống dịch bệnh động vật thủy sản)
6. **Quy chuẩn QCVN 38:2011/BTNMT** (Chất lượng nước vùng nuôi trồng thủy sản)

---

## 🛠️ 2. Danh Sách File Cần Tạo & Cập Nhật

1. `src/data/legalDocumentsData.ts` *(Tạo mới)*:
   - Lưu trữ dữ liệu toàn văn và cấu trúc thể thức chuẩn Việt Nam cho các văn bản quy phạm pháp luật thủy sản.
2. `src/components/LegalDocumentModal.tsx` *(Tạo mới)*:
   - Component Modal Popup hiển thị văn bản chuẩn với đầy đủ trích yếu, điều khoản, dấu đỏ công vụ và nút In/Tải PDF.
3. `src/pages/CategoryDetailPage.tsx`:
   - Thêm state `selectedDoc` & `isModalOpen`.
   - Kết nối sự kiện click từ danh sách văn bản sang `LegalDocumentModal`.

---

## 🧪 3. Kế Hoạch Kiểm Thử (Verification Plan)

1. **Kiểm thử Bật/Tắt Modal**:
   - Mở thử bất kỳ trang chi tiết chuyên ngành nào (ví dụ: `/categories/VI_PHAM_IUU` hoặc `/categories/O_NHIEM_NUOC`).
   - Nhấp vào một văn bản pháp lý bất kỳ trong danh sách $\rightarrow$ Modal Popup xuất hiện mượt mà.
   - Nhấp nút "Đóng" hoặc nhấn phím ESC / click ngoài nền mờ $\rightarrow$ Modal đóng lại.

2. **Kiểm thử Định Dạng Văn Bản**:
   - Kiểm tra Quốc hiệu, Tiêu ngữ, Số hiệu, Tên loại văn bản và trích dẫn các Chương/Điều luật thực tế.
   - Kiểm tra định dạng thể thức văn bản hành chính Việt Nam đẹp mắt, chuyên nghiệp.
