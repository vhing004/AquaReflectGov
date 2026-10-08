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
  BookOpen,
  Send,
} from 'lucide-react';

const CATEGORY_IMAGES: Record<string, string> = {
  O_NHIEM_NUOC: '/images/categories/water_pollution.jpg',
  DICH_BENH: '/images/categories/aquatic_disease.jpg',
  VI_PHAM_IUU: '/images/categories/iuu_fishing.jpg',
  GIONG_THUC_AN: '/images/categories/seed_feed.jpg',
  HA_TANG_CANG_CA: '/images/categories/port_infrastructure.jpg',
  THU_TUC_HANH_CHINH: '/images/categories/admin_procedure.jpg',
  KHAC: '/images/categories/other_fishery.jpg',
};

export const CategoriesPage: React.FC = () => {
  const { data: categoriesRes, isLoading } = useQuery({
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
        return <Fish className="w-5 h-5 text-slate-600" />;
    }
  };

  const getDepartmentName = (code: string) => {
    switch (code) {
      case 'O_NHIEM_NUOC':
        return 'Chi cục Thủy sản & Phòng TN&MT';
      case 'DICH_BENH':
        return 'Trạm Thú y Thủy sản & Khuyến nông';
      case 'VI_PHAM_IUU':
        return 'Thanh tra Kiểm ngư & Đồn Biên phòng';
      case 'GIONG_THUC_AN':
        return 'Phòng Quản lý Giống & Vật tư Thủy sản';
      case 'HA_TANG_CANG_CA':
        return 'Ban Quản lý Cảng cá & Luồng lạch';
      case 'THU_TUC_HANH_CHINH':
        return 'Bộ phận 1 Cửa & Đăng kiểm Tàu cá';
      default:
        return 'Văn phòng Sở Nông nghiệp & PTNT';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Title */}
      <div className="border-b border-slate-200 pb-5">
        <span className="text-xs font-bold text-[#006194] uppercase tracking-wider">
          Chuẩn Hóa Dịch Vụ Công Ngành Thủy Sản Quảng Ngãi
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Tất Cả Danh Mục Chuyên Ngành Phản Ánh & Quy Định SLA
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
          Tra cứu toàn bộ các lĩnh vực tiếp nhận kiến nghị, thời hạn cam kết giải quyết (SLA từ 24h đến 120h), quy trình thụ lý 4 bước và căn cứ văn bản quy phạm pháp luật cho từng chuyên ngành.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 bg-slate-200 animate-pulse rounded-3xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="group rounded-3xl bg-white border border-slate-200/80 hover:border-sky-300 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              <div className="flex flex-col flex-1">
                {/* Banner ảnh minh họa chuyên ngành */}
                <Link to={`/categories/${cat.code}`} className="relative h-44 overflow-hidden block">
                  <img
                    src={CATEGORY_IMAGES[cat.code] || CATEGORY_IMAGES['KHAC']}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                  {/* Icon + SLA Badge */}
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                    <div className="w-9 h-9 rounded-2xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      {getCategoryIcon(cat.code)}
                    </div>
                  </div>
                  <div className="absolute top-3.5 right-3.5">
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[#006194] shadow-sm font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>SLA: {cat.defaultSlaHours}h</span>
                    </span>
                  </div>

                  {/* Tên danh mục trên ảnh */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <h2 className="font-extrabold text-white text-base leading-snug drop-shadow-md group-hover:text-cyan-200 transition-colors">
                      {cat.name}
                    </h2>
                  </div>
                </Link>

                {/* Nội dung bên dưới ảnh - Padding chuẩn p-5 */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {cat.description || 'Tiếp nhận xử lý và thụ lý các phản ánh thuộc lĩnh vực này.'}
                  </p>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-[#006194] shrink-0" />
                    <span className="truncate">Thụ lý: <strong>{getDepartmentName(cat.code)}</strong></span>
                  </div>
                </div>
              </div>

              {/* Nút thao tác dưới cùng */}
              <div className="px-5 pb-5 pt-0">
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/categories/${cat.code}`}
                    className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-[#006194] text-xs font-bold transition-all cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Xem quy trình & văn bản</span>
                  </Link>

                  <Link
                    to={`/submit?category=${cat.code}`}
                    className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#006194] hover:bg-[#0284c7] text-white text-xs font-bold transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Phản ánh ngay</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
