import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { masterDataApi } from '../api/masterDataApi';
import { petitionApi } from '../api/petitionApi';
import { ResolvedPetitionCard } from '../components/ResolvedPetitionCard';
import {
  Search,
  CheckCircle2,
  Filter,
  ArrowUpDown,
  ChevronRight,
  ShieldCheck,
  FileCheck2,
  ChevronLeft,
  X,
  Star,
  Timer
} from 'lucide-react';

export const PublicResolvedPetitionsPage: React.FC = () => {
  // State tìm kiếm và lọc
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'latest' | 'rating' | 'oldest'>('latest');
  const [page, setPage] = useState(1);
  const pageSize = 9;

  // Lấy danh sách chuyên mục
  const { data: categoriesRes } = useQuery({
    queryKey: ['activeCategories'],
    queryFn: () => masterDataApi.getCategories(),
  });
  const categories = categoriesRes?.data || [];

  // Lấy dữ liệu hồ sơ đã giải quyết từ API
  const { data: resolvedRes, isLoading, isFetching } = useQuery({
    queryKey: ['publicResolvedPetitions', selectedCategory, sortBy, keyword, page, pageSize],
    queryFn: () =>
      petitionApi.getPublicResolvedPetitions(
        selectedCategory,
        sortBy,
        pageSize,
        keyword || undefined,
        page,
        pageSize
      ),
    placeholderData: (previousData) => previousData,
  });

  const petitions = resolvedRes?.data || [];

  // Thống kê nhanh toàn bộ tập dữ liệu đang xem
  const stats = useMemo(() => {
    const total = petitions.length;
    const ratedPetitions = petitions.filter((p) => p.hasFeedback && (p.feedbackRating ?? 0) > 0);
    const avgRating =
      ratedPetitions.length > 0
        ? (
            ratedPetitions.reduce((sum, p) => sum + (p.feedbackRating ?? 0), 0) /
            ratedPetitions.length
          ).toFixed(1)
        : '5.0';
    const aheadOfSlaCount = petitions.filter((p) => p.isAheadOfSla).length;
    const slaRate = total > 0 ? Math.round((aheadOfSlaCount / total) * 100) : 100;

    return { total, avgRating, slaRate, ratedCount: ratedPetitions.length };
  }, [petitions]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(keywordInput.trim());
    setPage(1);
  };

  const handleClearSearch = () => {
    setKeywordInput('');
    setKeyword('');
    setPage(1);
  };

  const handleCategorySelect = (code?: string) => {
    setSelectedCategory(code);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* 1. BREADCRUMBS & BANNER ĐIỀU HÀNH */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center space-x-1.5 font-medium">
            <Link to="/" className="text-[#006194] font-bold hover:underline">
              Cổng DVC Thủy Sản
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-800 font-bold">Hồ Sơ Đã Xử Lý</span>
          </div>

          <div className="flex items-center space-x-2 text-sky-800 bg-sky-50 px-2.5 py-1 rounded-full font-semibold border border-sky-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Cổng công khai minh bạch kết quả giải quyết kiến nghị</span>
          </div>
        </div>
      </div>

      {/* 2. HERO HEADER PHONG CÁCH CHÍNH QUYỀN SỐ */}
      <div className="relative bg-gradient-to-b from-[#003B5C] via-[#004B75] to-[#006194] text-white pt-10 pb-14 overflow-hidden shadow-sm">
        {/* Họa tiết lưới tinh tế */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-sky-200 border border-white/15">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-300" />
              <span>Minh Bạch – Khách Quan – Có Thẩm Quyền Đóng Dấu</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Công Khai Kết Quả Xử Lý Phản Ánh & Kiến Nghị
            </h1>

            <p className="text-sm sm:text-base text-sky-100/90 leading-relaxed font-normal">
              Toàn bộ hồ sơ sau khi thẩm tra, xử lý vi phạm hoặc ban hành kết luận chính thức được công bố công khai. Nhân dân có thể tra cứu chi tiết tiến độ, số hiệu văn bản và gửi đánh giá mức độ hài lòng khi đăng nhập tài khoản công dân.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/15">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
              <div className="flex items-center space-x-2 text-sky-200 text-xs font-medium">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span>Hồ sơ trang hiện tại</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white mt-1">
                {petitions.length} <span className="text-xs font-normal text-sky-200">hồ sơ</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
              <div className="flex items-center space-x-2 text-sky-200 text-xs font-medium">
                <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>CSAT Đánh giá trung bình</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1">
                {stats.avgRating} <span className="text-xs font-normal text-white">/ 5 sao</span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
              <div className="flex items-center space-x-2 text-sky-200 text-xs font-medium">
                <Timer className="w-4 h-4 text-sky-300" />
                <span>Đúng & Trước hạn SLA</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-1">
                {stats.slaRate}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. KHU VỰC TÌM KIẾM & BỘ LỌC */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-4 sm:p-5 space-y-4">
          {/* Hàng 1: Input Tìm Kiếm & Select Sắp Xếp */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="Nhập mã hồ sơ (TS-2026...), tiêu đề kiến nghị, địa phương hoặc số hiệu văn bản..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006194]/30 focus:border-[#006194] focus:bg-white transition-all"
                />
                {keywordInput && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>

            <button
              type="button"
              onClick={handleSearchSubmit}
              className="px-5 py-2.5 rounded-xl bg-[#006194] hover:bg-[#0284c7] text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Tìm kiếm</span>
            </button>

            {/* Dropdown Sắp xếp */}
            <div className="flex items-center space-x-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-3">
              <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
              <label htmlFor="sort-select" className="text-xs font-semibold text-slate-600 shrink-0">
                Sắp xếp:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as any);
                  setPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#006194]/30 cursor-pointer"
              >
                <option value="latest">Mới giải quyết nhất</option>
                <option value="rating">Đánh giá CSAT cao nhất</option>
                <option value="oldest">Cũ nhất</option>
              </select>
            </div>
          </div>

          {/* Hàng 2: Badges Chuyên Mục */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1 text-xs">
              <span className="text-slate-400 font-semibold flex items-center space-x-1 shrink-0 mr-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Chuyên mục:</span>
              </span>

              <button
                type="button"
                onClick={() => handleCategorySelect(undefined)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === undefined
                    ? 'bg-[#006194] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả lĩnh vực
              </button>

              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.code;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.code)}
                    className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#006194] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. DANH SÁCH HỒ SƠ ĐÃ XỬ LÝ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Tiêu đề danh sách & Trạng thái tải */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-6 bg-[#006194] rounded-full"></div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Danh Sách Hồ Sơ Đã Công Khai Kết Quả
            </h2>
            <span className="text-xs text-slate-500 font-medium ml-1">
              (Trang {page})
            </span>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            {isFetching && (
              <span className="inline-flex items-center space-x-1.5 text-[#006194] bg-sky-50 px-2.5 py-1 rounded-full font-semibold border border-sky-200 animate-pulse">
                <span>Đang đồng bộ dữ liệu...</span>
              </span>
            )}
          </div>
        </div>

        {/* Loading skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-pulse"
              >
                <div className="flex justify-between items-center">
                  <div className="h-5 bg-slate-200 rounded w-24"></div>
                  <div className="h-5 bg-slate-200 rounded w-20"></div>
                </div>
                <div className="h-6 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-24 bg-slate-100 rounded-xl"></div>
                <div className="h-8 bg-slate-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : petitions.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-sky-50 text-[#006194] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-800">
                Không tìm thấy hồ sơ phù hợp
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                {keyword || selectedCategory
                  ? 'Không có hồ sơ đã xử lý nào khớp với từ khóa tìm kiếm hoặc chuyên mục đã chọn.'
                  : 'Hiện tại chưa có hồ sơ nào được công khai trong danh mục này.'}
              </p>
            </div>
            {(keyword || selectedCategory) && (
              <button
                type="button"
                onClick={() => {
                  setKeywordInput('');
                  setKeyword('');
                  setSelectedCategory(undefined);
                  setPage(1);
                }}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#006194] text-white text-xs font-bold hover:bg-[#0284c7] transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Đặt lại bộ lọc tìm kiếm</span>
              </button>
            )}
          </div>
        ) : (
          /* Lưới hồ sơ */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {petitions.map((petition) => (
              <ResolvedPetitionCard
                key={petition.id}
                petition={petition}
                variant="standard"
              />
            ))}
          </div>
        )}

        {/* 5. PHÂN TRANG (PAGINATION) */}
        {!isLoading && petitions.length > 0 && (
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 px-6 py-4 shadow-xs">
            <div className="text-xs text-slate-500">
              Trang <span className="font-bold text-slate-800">{page}</span> • Hiển thị{' '}
              <span className="font-bold text-slate-800">{petitions.length}</span> hồ sơ
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center space-x-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trang trước</span>
              </button>

              <div className="px-3 py-2 bg-sky-50 text-[#006194] text-xs font-bold rounded-xl border border-sky-100">
                {page}
              </div>

              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={petitions.length < pageSize}
                className="inline-flex items-center space-x-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <span>Trang tiếp theo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
