import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { masterDataApi } from '../api/masterDataApi';
import { 
  Send, 
  Search, 
  Clock, 
  MapPin, 
  Fish, 
  Droplets, 
  AlertOctagon, 
  Anchor, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  LifeBuoy,
  FileCheck2,
  Radio
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { data: categoriesRes, isLoading: loadingCategories } = useQuery({
    queryKey: ['activeCategories'],
    queryFn: () => masterDataApi.getCategories(),
  });

  const categories = categoriesRes?.data || [];

  const getCategoryIcon = (code: string) => {
    switch (code) {
      case 'O_NHIEM_NUOC':
        return <Droplets className="w-5 h-5 text-cyan-600" />;
      case 'DICH_BENH':
        return <AlertOctagon className="w-5 h-5 text-rose-600" />;
      case 'VI_PHAM_IUU':
        return <Anchor className="w-5 h-5 text-[#006194]" />;
      case 'GIONG_THUC_AN':
        return <Fish className="w-5 h-5 text-emerald-600" />;
      case 'HA_TANG_CANG_CA':
        return <MapPin className="w-5 h-5 text-amber-600" />;
      case 'THU_TUC_HANH_CHINH':
        return <FileText className="w-5 h-5 text-purple-600" />;
      default:
        return <Fish className="w-5 h-5 text-sky-600" />;
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* 1. TOP ANNOUNCEMENT STRIP (Theo mẫu Stitch Design 1) */}
      <section className="bg-gradient-to-r from-sky-100 via-white to-teal-50 border-b border-sky-100 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-800 font-semibold">
              Hệ thống giám sát 28 tỉnh ven biển trực tuyến 24/7
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-slate-500 hidden sm:inline">
              Cấp chứng thư định danh dữ liệu số: Cục Thủy Sản
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Thời gian phản hồi SLA trung bình:</span>
            <span className="bg-[#006194] text-white font-bold px-2 py-0.5 rounded text-[11px]">
              24 giờ làm việc
            </span>
          </div>
        </div>
      </section>

      {/* 2. HERO BANNER (Đậm chất đại dương & Dịch vụ công biển đảo) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-[#003c5c] via-[#006194] to-[#0284c7] text-white p-8 sm:p-12 lg:p-16 shadow-xl border border-sky-700/40">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
          
          <div className="relative max-w-3xl space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-400/20 border border-sky-300/30 text-sky-100 text-xs font-semibold backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-sky-300" />
              <span>Cổng Dịch Vụ Công & Quản Trị Thủy Sản Quốc Gia</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Tiếp Nhận & Xử Lý{' '}
              <span className="text-cyan-300">Phản Ánh Thủy Sản</span> Trực Tuyến
            </h1>

            <p className="text-sm sm:text-base text-sky-100 leading-relaxed max-w-2xl font-normal">
              Bảo vệ quyền lợi ngư dân và vùng nuôi trồng. Gửi thông tin thực địa về ô nhiễm nguồn nước, dịch bệnh tôm cá, vi phạm khai thác hải sản IUU và hạ tầng cảng cá tới Chi cục Thủy sản giải quyết nhanh chóng.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Link
                to="/submit"
                className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-white text-[#006194] hover:bg-sky-50 font-bold text-sm shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Send className="w-4 h-4 text-[#006194]" />
                <span>Nộp Hồ Sơ Phản Ánh Mới</span>
              </Link>

              <Link
                to="/track"
                className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-sky-900/50 hover:bg-sky-900/70 border border-sky-300/30 text-white font-bold text-sm backdrop-blur-xs transition-all hover:scale-[1.02]"
              >
                <Search className="w-4 h-4 text-cyan-300" />
                <span>Tra Cứu Mã Hồ Sơ (#TS-...)</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. REALTIME STATS / KPI CARDS (Theo mẫu Stitch Dashboard) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Tiếp Nhận</span>
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#006194] flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">1,280</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +14.2% so với tháng trước</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đang Thẩm Tra</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-2">48</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Đang đo đạc trắc địa thực tế</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đã Giải Quyết</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-2">1,216</p>
            <p className="text-[11px] text-emerald-700 font-bold mt-1">Tỷ lệ hài lòng 95.0%</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cảnh Báo Nóng</span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Radio className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-2">16</p>
            <p className="text-[11px] text-rose-600 font-medium mt-1">Vùng giám sát trọng điểm IUU</p>
          </div>
        </div>
      </section>

      {/* 4. CHUYÊN MỤC DỊCH VỤ CÔNG THỦY SẢN (Kết nối trực tiếp API Backend .NET 9) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold text-[#006194] uppercase tracking-wider">
              Danh mục chuyên ngành
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Phân Hệ Dịch Vụ Công & Tiếp Nhận Kiến Nghị
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Phân công thụ lý trực tiếp theo chức năng nhiệm vụ của Chi cục Thủy sản và các phòng ban chuyên môn.
            </p>
          </div>
          <Link
            to="/categories"
            className="inline-flex items-center space-x-1 text-xs font-bold text-[#006194] hover:underline"
          >
            <span>Xem tất cả danh mục & SLA</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingCategories ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200 animate-pulse h-40"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="group p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-sky-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {getCategoryIcon(cat.code)}
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-[#006194] border border-sky-200">
                      SLA: {cat.defaultSlaHours}h
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#006194] transition-colors leading-snug">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">#{cat.code}</span>
                  <Link
                    to={`/submit?category=${cat.code}`}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-[#006194] group-hover:translate-x-1 transition-transform"
                  >
                    <span>Phản ánh ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. QUY TRÌNH 4 BƯỚC GIẢI QUYẾT MINH BẠCH (Theo chuẩn Stitch Design 1) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#006194] uppercase tracking-wider">Quy trình công vụ số</span>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Quy Trình 4 Bước Thẩm Tra & Ban Hành Quyết Định
            </h2>
            <p className="text-xs text-slate-500">
              Mọi hồ sơ phản ánh đều được số hóa, gắn dấu vết thời gian và mã định danh tra cứu công khai.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-[#006194] text-white font-bold text-xs flex items-center justify-center">
                01
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Tiếp nhận & Vào sổ bộ</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bộ phận 1 cửa kiểm tra tính hợp lệ, tự động cấp mã tra cứu dạng <strong>#TS-2026-XXXX</strong> và thông báo qua SMS/Zalo.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold text-xs flex items-center justify-center">
                02
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Thẩm tra thực địa & GPS</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Đoàn công tác chuyên môn tiến hành đo độ sâu luồng lạch, lấy mẫu nước xét nghiệm hoặc kiểm tra nhật ký VMS của tàu.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
                03
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Phối hợp liên ngành</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Chi cục Thủy sản phối hợp cùng Ban Quản lý Cảng cá, Thanh tra Sở và Đồn Biên phòng xử lý phương án khắc phục.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                04
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Quyết định & Công khai</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ký số văn bản trả lời, đính kèm kết luận thanh tra và mở cổng cho công dân đánh giá mức độ hài lòng.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION / HOTLINE CỨU HỘ BIỂN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800 shadow-lg">
          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Hỗ trợ khẩn cấp trên biển</span>
            <h3 className="text-xl sm:text-2xl font-bold">
              Phát hiện sự cố tàu cá hỏng máy, trôi dạt hoặc tai nạn ngư trường?
            </h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Liên hệ ngay Trung tâm Phối hợp Tìm kiếm Cứu nạn Hàng hải và Hệ thống Đài Thông tin Duyên hải Việt Nam.
            </p>
          </div>
          <div className="shrink-0 flex items-center space-x-3">
            <a
              href="tel:18001776"
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md transition-all hover:scale-105"
            >
              <LifeBuoy className="w-5 h-5" />
              <span>Gọi SOS: 1800 1776</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
