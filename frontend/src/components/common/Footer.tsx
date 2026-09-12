import React from 'react';
import { Waves, Phone, Mail, MapPin, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Cột 1: Thông tin thương hiệu */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
                <Waves className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">AquaReflect</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cổng tiếp nhận và xử lý phản ánh kiến nghị chuyên ngành Thủy sản. Kết nối trực tiếp ngư dân, cơ sở nuôi trồng với Chi cục Thủy sản và cơ quan quản lý nhà nước.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 rounded-lg p-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Hệ thống bảo mật danh tính người phản ánh</span>
            </div>
          </div>

          {/* Cột 2: Đường dây nóng khẩn cấp */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Đường Dây Nóng Khẩn Cấp</h4>
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 bg-rose-950/40 border border-rose-800/50 rounded-lg">
                <div className="flex items-center space-x-1.5 text-rose-400 font-semibold mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Báo dịch bệnh thủy sản khẩn</span>
                </div>
                <p className="text-rose-200 font-bold text-sm">1800 6868 (Miễn phí 24/7)</p>
              </div>

              <div className="p-2.5 bg-sky-950/40 border border-sky-800/50 rounded-lg">
                <div className="flex items-center space-x-1.5 text-sky-400 font-semibold mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Tố giác vi phạm khai thác IUU</span>
                </div>
                <p className="text-sky-200 font-bold text-sm">0290 3839999 (Thanh tra kiểm ngư)</p>
              </div>
            </div>
          </div>

          {/* Cột 3: Liên kết nhanh */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Liên Kết Nhanh</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/submit" className="hover:text-sky-400 transition-colors">
                  Gửi phản ánh mới
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-sky-400 transition-colors">
                  Tra cứu tiến độ hồ sơ
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-sky-400 transition-colors">
                  Danh mục phản ánh thủy sản
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-sky-400 transition-colors">
                  Bản đồ nhiệt điểm nóng GIS
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="text-amber-400 hover:text-amber-300 transition-colors">
                  Cổng điều hành nội bộ cho cán bộ
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Cơ quan quản lý */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Cơ Quan Quản Lý</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <span>Chi cục Thủy sản - Sở Nông nghiệp & PTNT</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-sky-500 shrink-0" />
                <span>0290.3835678</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-sky-500 shrink-0" />
                <span>support@aquareflect.gov.vn</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AquaReflect. Hệ thống Phản ánh Kiến nghị Thủy sản - Phát triển trên nền tảng .NET 9 & ReactJS.</p>
        </div>
      </div>
    </footer>
  );
};
