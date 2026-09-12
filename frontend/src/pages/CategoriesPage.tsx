import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { masterDataApi } from '../api/masterDataApi';
import { Link } from 'react-router-dom';
import { 
  Fish, 
  Droplets, 
  AlertOctagon, 
  Anchor, 
  MapPin, 
  FileText, 
  ArrowRight, 
  Clock, 
  Building2,
  CheckCircle2
} from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const { data: categoriesRes, isLoading } = useQuery({
    queryKey: ['activeCategories'],
    queryFn: () => masterDataApi.getCategories(),
  });

  const categories = categoriesRes?.data || [];

  const getCategoryTheme = (code: string) => {
    switch (code) {
      case 'O_NHIEM_NUOC':
        return {
          icon: <Droplets className="w-6 h-6 text-cyan-600" />,
          dept: 'Chi cục Thủy sản & Phòng Tài nguyên MT',
          badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-200',
        };
      case 'DICH_BENH':
        return {
          icon: <AlertOctagon className="w-6 h-6 text-rose-600" />,
          dept: 'Trạm Thú y Thủy sản & Khuyến nông',
          badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
        };
      case 'VI_PHAM_IUU':
        return {
          icon: <Anchor className="w-6 h-6 text-[#006194]" />,
          dept: 'Thanh tra Chuyên ngành & Đồn Biên phòng',
          badgeClass: 'bg-sky-50 text-[#006194] border-sky-200',
        };
      case 'GIONG_THUC_AN':
        return {
          icon: <Fish className="w-6 h-6 text-emerald-600" />,
          dept: 'Phòng Quản lý Giống & Vật tư Thủy sản',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
      case 'HA_TANG_CANG_CA':
        return {
          icon: <MapPin className="w-6 h-6 text-amber-600" />,
          dept: 'Ban Quản lý Cảng cá & Luồng lạch',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'THU_TUC_HANH_CHINH':
        return {
          icon: <FileText className="w-6 h-6 text-purple-600" />,
          dept: 'Bộ phận 1 Cửa & Đăng kiểm Tàu cá',
          badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
        };
      default:
        return {
          icon: <Fish className="w-6 h-6 text-slate-600" />,
          dept: 'Văn phòng Sở Nông nghiệp & PTNT',
          badgeClass: 'bg-slate-50 text-slate-800 border-slate-200',
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Title */}
      <div className="border-b border-slate-200 pb-5">
        <span className="text-xs font-bold text-[#006194] uppercase tracking-wider">
          Chuẩn Hóa Dịch Vụ Công Ngành Thủy Sản
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Danh Mục Lĩnh Vực Phản Ánh & Quy Định SLA
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
          Mỗi chuyên mục phản ánh được thiết lập thời hạn cam kết giải quyết (SLA) từ 24h đến 120h làm việc, và tự động điều phối trực tiếp đến phòng ban chuyên môn theo quy định phân cấp quản lý.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-52 bg-slate-200 animate-pulse rounded-3xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const theme = getCategoryTheme(cat.code);
            return (
              <div
                key={cat.id}
                className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-sky-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform">
                      {theme.icon}
                    </div>
                    <span
                      className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold border ${theme.badgeClass}`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Cam kết: {cat.defaultSlaHours}h</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#006194] transition-colors leading-snug">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">Mã số: #{cat.code}</p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {cat.description || 'Tiếp nhận xử lý các kiến nghị thuộc lĩnh vực này.'}
                  </p>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 flex items-center space-x-2">
                    <Building2 className="w-3.5 h-3.5 text-[#006194] shrink-0" />
                    <span className="truncate">Thụ lý: <strong>{theme.dept}</strong></span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đang trực tuyến</span>
                  </span>
                  <Link
                    to={`/submit?category=${cat.code}`}
                    className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-[#006194] hover:bg-[#0284c7] text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <span>Phản ánh ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
