import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { 
  Send, 
  MapPin, 
  Camera, 
  Lock, 
  FileText, 
  CheckCircle2, 
  Download, 
  Printer, 
  Anchor, 
  Droplets, 
  LifeBuoy, 
  Layers, 
  ChevronRight
} from 'lucide-react';

export const SubmitPetitionPage: React.FC = () => {
  const { user } = useAuthStore();
  const [category, setCategory] = useState('iuu');
  const [title, setTitle] = useState('');
  const [locationText, setLocationText] = useState('Khu vực Cửa biển Sa Kỳ, Xã Bình Châu, Huyện Bình Sơn, Tỉnh Quảng Ngãi');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isGettingGps, setIsGettingGps] = useState(false);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  // Tracking query on the right side
  const [trackingCode, setTrackingCode] = useState('#TS-2024-8891');
  const [searchedCode, setSearchedCode] = useState('#TS-2024-8891');

  const handleGetGps = () => {
    setIsGettingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsGettingGps(false);
          const lat = pos.coords.latitude.toFixed(5);
          const lng = pos.coords.longitude.toFixed(5);
          setLocationText(`Tọa độ GPS: ${lat}°N, ${lng}°E (Đã xác thực thực địa)`);
        },
        () => {
          setIsGettingGps(false);
          // Fallback realistic maritime GPS
          setLocationText("15°13'45.2\"N 108°52'10.5\"E (Vùng nước Cửa Sa Kỳ, Quảng Ngãi)");
        },
        { timeout: 5000 }
      );
    } else {
      setIsGettingGps(false);
      setLocationText("15°13'45.2\"N 108°52'10.5\"E (Vùng nước Cửa Sa Kỳ, Quảng Ngãi)");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newCode = `#TS-2026-${randomSuffix}`;
    setSubmittedCode(newCode);
    setSearchedCode(newCode);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. BREADCRUMB & BANNER */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-1.5 font-medium">
          <span className="text-[#006194] font-bold">Cục Thủy Sản</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span>Phản ánh & Kiến nghị số</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-bold">Biểu mẫu số 04B / CVC-BCH</span>
        </div>
        <div className="flex items-center space-x-2 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Hệ thống giám sát 28 tỉnh ven biển trực tuyến 24/7</span>
        </div>
      </div>

      {/* 2. MAIN DUAL PANEL (55% Form Nộp hồ sơ - 45% Tra cứu tiến độ theo thiết kế Stitch) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* === CỘT TRÁI (COL-SPAN-7): BIỂU MẪU NỘP PHẢN ÁNH === */}
        <section className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#006194]">
                Biểu mẫu số 04B / CVC-BCH
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                Tiếp Nhận Phản Ánh, Kiến Nghị Số
              </h2>
            </div>
            <span className="inline-flex items-center space-x-1 text-[11px] font-semibold bg-sky-50 text-[#006194] px-2.5 py-1 rounded-full border border-sky-100">
              <Lock className="w-3 h-3" />
              <span>Bảo mật SSL</span>
            </span>
          </div>

          {submittedCode && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
              <div className="flex items-center space-x-2 font-bold text-sm text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Nộp hồ sơ thành công! Mã biên nhận: {submittedCode}</span>
              </div>
              <p className="text-emerald-700">
                Hồ sơ đã được gửi đến Chi cục Thủy sản tiếp nhận. Thông tin đã được chuyển sang khung tra cứu bên phải để theo dõi tiến độ.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Chuyên mục phản ánh (Radio Card Grid) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-800">
                  Chuyên mục phản ánh <span className="text-rose-500">*</span>
                </label>
                <span className="text-slate-400">Chọn đúng để rút ngắn thời gian xử lý SLA</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  onClick={() => setCategory('iuu')}
                  className={`cursor-pointer p-3.5 rounded-2xl border transition-all flex items-start space-x-3 ${
                    category === 'iuu'
                      ? 'border-[#006194] bg-sky-50/60 ring-1 ring-[#006194]'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="cat"
                    checked={category === 'iuu'}
                    onChange={() => setCategory('iuu')}
                    className="mt-1 accent-[#006194]"
                  />
                  <div>
                    <div className="flex items-center space-x-1.5 font-bold text-xs text-slate-900">
                      <Anchor className="w-3.5 h-3.5 text-[#006194]" />
                      <span>Khai thác & Tàu cá (IUU)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">VMS, ranh giới biển, cảnh báo vi phạm</p>
                  </div>
                </label>

                <label
                  onClick={() => setCategory('environment')}
                  className={`cursor-pointer p-3.5 rounded-2xl border transition-all flex items-start space-x-3 ${
                    category === 'environment'
                      ? 'border-[#006194] bg-sky-50/60 ring-1 ring-[#006194]'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="cat"
                    checked={category === 'environment'}
                    onChange={() => setCategory('environment')}
                    className="mt-1 accent-[#006194]"
                  />
                  <div>
                    <div className="flex items-center space-x-1.5 font-bold text-xs text-slate-900">
                      <Droplets className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Môi trường & Vùng nuôi</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Ô nhiễm vịnh đầm, dịch bệnh tôm cá</p>
                  </div>
                </label>

                <label
                  onClick={() => setCategory('port')}
                  className={`cursor-pointer p-3.5 rounded-2xl border transition-all flex items-start space-x-3 ${
                    category === 'port'
                      ? 'border-[#006194] bg-sky-50/60 ring-1 ring-[#006194]'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="cat"
                    checked={category === 'port'}
                    onChange={() => setCategory('port')}
                    className="mt-1 accent-[#006194]"
                  />
                  <div>
                    <div className="flex items-center space-x-1.5 font-bold text-xs text-slate-900">
                      <Layers className="w-3.5 h-3.5 text-amber-600" />
                      <span>Hành chính & Cảng cá</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Cấp phép bến bãi, luồng lạch, chứng chỉ</p>
                  </div>
                </label>

                <label
                  onClick={() => setCategory('rescue')}
                  className={`cursor-pointer p-3.5 rounded-2xl border transition-all flex items-start space-x-3 ${
                    category === 'rescue'
                      ? 'border-[#006194] bg-sky-50/60 ring-1 ring-[#006194]'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="cat"
                    checked={category === 'rescue'}
                    onChange={() => setCategory('rescue')}
                    className="mt-1 accent-[#006194]"
                  />
                  <div>
                    <div className="flex items-center space-x-1.5 font-bold text-xs text-slate-900">
                      <LifeBuoy className="w-3.5 h-3.5 text-rose-600" />
                      <span>Cứu hộ cứu nạn biển</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Hỏng máy, trôi dạt, tai nạn hải trình</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Tiêu đề */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Tiêu đề phản ánh / Yêu cầu giải quyết <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Đề nghị khơi thông luồng ra vào cảng cá Tịnh Kỳ sau bão số 4..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006194] bg-slate-50/50 focus:bg-white transition-all shadow-inner"
              />
            </div>

            {/* Địa điểm & Ghim GPS (Tính năng đặc thù theo Stitch) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Địa điểm xảy ra sự việc & Tọa độ hải trình <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGetGps}
                  disabled={isGettingGps}
                  className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#006194] bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg transition-colors border border-sky-200"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#006194]" />
                  <span>{isGettingGps ? 'Đang đọc tọa độ...' : 'Lấy GPS thiết bị / VMS'}</span>
                </button>
              </div>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006194] bg-slate-50/50 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Nội dung chi tiết */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-800">
                  Nội dung chi tiết kiến nghị <span className="text-rose-500">*</span>
                </label>
                <span className="text-slate-400">Tối đa 2.000 ký tự</span>
              </div>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả cụ thể thời gian, vị trí, diễn biến sự việc, mức độ ảnh hưởng đến tàu thuyền hoặc đời sống ngư trường và đề xuất biện pháp khắc phục..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006194] bg-slate-50/50 focus:bg-white transition-all shadow-inner resize-none"
              ></textarea>
            </div>

            {/* Khối upload bằng chứng hiện trường */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800">
                Minh chứng hiện trường (Hình ảnh, Video, Nhật ký biển, Biên lai)
              </label>
              <div className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-2xl p-6 text-center bg-slate-50 hover:bg-sky-50/30 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-sky-100 text-[#006194] flex items-center justify-center mx-auto mb-2">
                  <Camera className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Chụp ảnh tại tàu hoặc chọn tệp từ thiết bị
                </p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                  Hỗ trợ JPG, PNG, MP4, PDF (Tối đa 5 tệp, không quá 25MB). Hệ thống sẽ tự động trích xuất dấu vết EXIF/GPS.
                </p>
                <div className="flex items-center justify-center gap-2 mt-3 text-[10px] font-semibold text-slate-600">
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200">
                    Bản đồ luong-lach-saky.jpg (3.2 MB)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200">
                    Nhat-ky-mac-can.pdf (1.1 MB)
                  </span>
                </div>
              </div>
            </div>

            {/* Thông tin người gửi & Bảo mật */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-[#006194] text-white flex items-center justify-center font-bold text-xs">
                  {user ? user.fullName.charAt(0) : 'H'}
                </div>
                <div>
                  <p className="font-bold text-slate-900">
                    {user ? user.fullName : 'Nguyễn Văn Hải (Thuyền trưởng)'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {user ? user.email : 'CCCD: 0510******88 • Tàu: QNg-90822-TS'}
                  </p>
                </div>
              </div>

              <label className="inline-flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded accent-[#006194]"
                />
                <span className="text-slate-600 font-medium">Bảo mật danh tính với bên ngoài</span>
              </label>
            </div>

            {/* Nút tác vụ */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="submit"
                className="w-full sm:flex-1 py-3 px-6 rounded-xl bg-[#006194] hover:bg-[#0284c7] text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
              >
                <Send className="w-4 h-4" />
                <span>Nộp Hồ Sơ Phản Ánh Kiến Nghị</span>
              </button>
              <button
                type="button"
                onClick={() => alert('Đã lưu bản nháp vào bộ nhớ tạm trình duyệt!')}
                className="w-full sm:w-auto py-3 px-5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors"
              >
                Lưu nháp
              </button>
            </div>
          </form>
        </section>

        {/* === CỘT PHẢI (COL-SPAN-5): KHUNG TRA CỨU TIẾN ĐỘ THỜI GIAN THỰC === */}
        <section className="lg:col-span-5 space-y-6">
          {/* Hộp tra cứu nhanh */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#006194]">
              Tra cứu tiến độ giải quyết hồ sơ
            </span>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="Nhập mã #TS-..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006194] uppercase bg-slate-50"
              />
              <button
                onClick={() => setSearchedCode(trackingCode)}
                className="px-4 py-2 rounded-xl bg-[#006194] hover:bg-[#0284c7] text-white text-xs font-bold transition-colors"
              >
                Tra cứu
              </button>
            </div>
          </div>

          {/* Card hiển thị tiến độ chi tiết (Theo đúng Stitch Screen c8dba0d3df824111b06c6535a9e641ea) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-extrabold text-sm text-[#006194]">{searchedCode}</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Đã có quyết định
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Tiếp nhận: 14/10/2024 • Kênh: Cổng DVC Trực tuyến
                </p>
              </div>
              <button
                onClick={() => window.print()}
                title="In phiếu kết quả"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>

            {/* Tóm tắt vấn đề */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Vấn đề phản ánh</span>
              <h4 className="text-xs font-bold text-slate-900 leading-snug">
                Kiến nghị nạo vét luồng lạch tại Cửa biển Sa Kỳ đảm bảo an toàn tàu trên 700CV ra vào cập cảng
              </h4>
              <p className="text-[11px] text-slate-600">
                Cơ quan thụ lý: <strong className="text-[#006194]">Ban Quản lý Cảng cá & Chi cục Thủy sản Quảng Ngãi</strong>
              </p>
            </div>

            {/* Dòng thời gian 4 bước giải quyết */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Quy trình giải quyết 4 bước
              </span>

              <div className="relative pl-6 space-y-5">
                {/* Đường nối dọc */}
                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-emerald-400"></div>

                {/* Bước 1 */}
                <div className="relative flex items-start space-x-3 text-xs">
                  <div className="absolute -left-6 mt-0.5 w-5 h-5 rounded-full bg-[#006194] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                    ✓
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">1. Đã tiếp nhận & Vào sổ bộ</span>
                      <span className="text-[10px] text-slate-400">14/10 - 08:30</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Bộ phận 1 cửa thẩm định tính hợp lệ hồ sơ số.
                    </p>
                  </div>
                </div>

                {/* Bước 2 */}
                <div className="relative flex items-start space-x-3 text-xs">
                  <div className="absolute -left-6 mt-0.5 w-5 h-5 rounded-full bg-[#006194] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                    ✓
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">2. Thẩm tra thực địa</span>
                      <span className="text-[10px] text-slate-400">16/10 - 14:15</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Đo đạc trắc địa độ sâu luồng Sa Kỳ, phát hiện bồi lắng cát 1.4m cản trở tàu bè.
                    </p>
                  </div>
                </div>

                {/* Bước 3 */}
                <div className="relative flex items-start space-x-3 text-xs">
                  <div className="absolute -left-6 mt-0.5 w-5 h-5 rounded-full bg-[#006194] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                    ✓
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">3. Họp phối hợp liên ngành</span>
                      <span className="text-[10px] text-slate-400">18/10 - 09:00</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Chi cục Thủy sản cùng BQL Cảng cá lập phương án nạo vét cấp bách.
                    </p>
                  </div>
                </div>

                {/* Bước 4 */}
                <div className="relative flex items-start space-x-3 text-xs">
                  <div className="absolute -left-6 mt-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                    ✓
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-emerald-800">4. Ban hành quyết định xử lý</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">20/10 - 16:30</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Ban hành Quyết định số 482/QĐ-SNN phê duyệt kinh phí nạo vét luồng khẩn cấp.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Văn bản đính kèm giải quyết */}
            <div className="pt-2 border-t border-slate-100">
              <a
                href="#download"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Tải về văn bản quyết định giải quyết có đóng dấu số của Cục Thủy Sản.');
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors text-xs text-[#006194]"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-[#006194]" />
                  <span className="font-bold">Quyet_dinh_482_QD_SNN_ThongLuong.pdf</span>
                </div>
                <Download className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
