import React from 'react';
import { Link } from 'react-router-dom';
import type { PublicResolvedPetition } from '../types';
import {
  CheckCircle2,
  Clock,
  Star,
  MapPin,
  FileCheck2,
  ArrowRight,
  Timer,
  Newspaper,
  ShieldCheck,
  Award
} from 'lucide-react';

interface ResolvedPetitionCardProps {
  petition: PublicResolvedPetition;
  variant?: 'featured' | 'standard' | 'horizontal';
}

// Hiển thị sao đánh giá CSAT
const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${
          i <= rating
            ? 'text-amber-400 fill-amber-400'
            : 'text-slate-300'
        }`}
      />
    ))}
  </div>
);

// Lấy màu badge chuyên mục phong cách báo điện tử
const getCategoryBadge = (code: string, name: string) => {
  let colorStyle = 'bg-slate-100 text-slate-800 border-slate-200';
  switch (code) {
    case 'O_NHIEM_NUOC':
      colorStyle = 'bg-cyan-100/80 text-cyan-900 border-cyan-300';
      break;
    case 'DICH_BENH':
      colorStyle = 'bg-rose-100/80 text-rose-900 border-rose-300';
      break;
    case 'VI_PHAM_IUU':
      colorStyle = 'bg-sky-100/90 text-sky-950 border-sky-300';
      break;
    case 'GIONG_THUC_AN':
      colorStyle = 'bg-emerald-100/80 text-emerald-950 border-emerald-300';
      break;
    case 'HA_TANG_CANG_CA':
      colorStyle = 'bg-amber-100/80 text-amber-950 border-amber-300';
      break;
    case 'THU_TUC_HANH_CHINH':
      colorStyle = 'bg-purple-100/80 text-purple-950 border-purple-300';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide border shadow-2xs ${colorStyle}`}>
      {name}
    </span>
  );
};

export const ResolvedPetitionCard: React.FC<ResolvedPetitionCardProps> = ({ 
  petition, 
  variant = 'standard' 
}) => {
  // Tính thời gian xử lý
  const formatProcessingTime = () => {
    const hours = petition.actualProcessingHours ?? 0;
    if (hours < 1) return 'Dưới 1 giờ';
    if (hours < 24) return `${Math.round(hours)} giờ`;
    const days = Math.floor(hours / 24);
    const remainHours = Math.round(hours % 24);
    return remainHours > 0 ? `${days} ngày ${remainHours}h` : `${days} ngày`;
  };

  const formatSlaMargin = () => {
    const margin = petition.slaMarginHours ?? 0;
    const absMargin = Math.abs(margin);
    if (absMargin < 1) return '';
    if (absMargin < 24) {
      return petition.isAheadOfSla
        ? `Sớm ${Math.round(absMargin)}h`
        : `Quá hạn ${Math.round(absMargin)}h`;
    }
    const days = Math.floor(absMargin / 24);
    return petition.isAheadOfSla
      ? `Sớm ${days} ngày`
      : `Quá hạn ${days} ngày`;
  };

  // Ngày giải quyết theo chuẩn phong cách bản tin báo chí
  const resolvedDate = petition.resolvedAt
    ? new Date(petition.resolvedAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'Gần đây';

  // ==========================================
  // VARIANT 1: BẢN TIN TIÊU ĐIỂM (FEATURED EDITORIAL)
  // ==========================================
  if (variant === 'featured') {
    return (
      <article className="group bg-white rounded-3xl border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col lg:flex-row">
        {/* Hình ảnh tiêu điểm (Trái) */}
        <div className="relative lg:w-1/2 min-h-[260px] sm:min-h-[320px] lg:min-h-[380px] bg-slate-900 overflow-hidden shrink-0">
          {petition.thumbnailUrl ? (
            <img
              src={petition.thumbnailUrl}
              alt={petition.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#003755] to-[#006194] text-white p-8 text-center">
              <Newspaper className="w-16 h-16 text-sky-300/60 mb-3" />
              <p className="text-xs font-mono uppercase tracking-widest text-sky-200">Bản Tin Phản Ánh Thủy Sản</p>
              <p className="text-sm font-semibold text-white/90 mt-1 max-w-xs">{petition.title}</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent lg:hidden" />

          {/* Huy hiệu Tiêu điểm Báo chí */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 items-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md animate-pulse">
              <Award className="w-3.5 h-3.5" />
              Tiêu điểm xử lý
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-xs text-white text-[11px] font-bold shadow-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đã kết luận
            </span>
          </div>

          {/* Mã hồ sơ trên ảnh */}
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-white font-mono text-xs font-bold border border-white/20">
              #{petition.trackingCode}
            </span>
          </div>
        </div>

        {/* Nội dung báo chí (Phải) */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Meta bar: Chuyên mục, Ngày ban hành, Cơ quan */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {getCategoryBadge(petition.categoryCode, petition.categoryName)}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Ban hành: <strong className="text-slate-700">{resolvedDate}</strong></span>
              </div>
            </div>

            {/* Headline Tiêu đề Báo chí */}
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-950 leading-snug group-hover:text-[#006194] transition-colors line-clamp-2">
              <Link to={`/track?code=${petition.trackingCode}`}>
                {petition.title}
              </Link>
            </h3>

            {/* Địa bàn xác minh */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <MapPin className="w-4 h-4 text-[#006194] shrink-0" />
              <span className="truncate">{petition.administrativeUnitName || petition.addressText || 'Cà Mau'}</span>
              {petition.departmentName && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-700 font-semibold truncate">{petition.departmentName}</span>
                </>
              )}
            </div>

            {/* Hộp Trích Dẫn Toàn Văn Kết Luận Giải Quyết (Official Statement Box) */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50/90 via-sky-50/50 to-slate-50 border-l-4 border-[#006194] border-t border-r border-b border-sky-100 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-[#006194]" />
                  <span className="text-xs font-black uppercase tracking-wider text-[#006194]">
                    Kết luận & Quyết định xử lý chính thức
                  </span>
                </div>
                {petition.resolutionDocumentNumber && (
                  <span className="px-2 py-0.5 rounded bg-white font-mono text-[11px] font-bold text-sky-800 border border-sky-200">
                    Số {petition.resolutionDocumentNumber}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-normal line-clamp-3 italic">
                "{petition.resolutionSummary || 'Đã tổ chức kiểm tra thực địa, lập biên bản làm việc và xử lý dứt điểm theo quy định pháp luật ngành thủy sản.'}"
              </p>
            </div>

            {/* Chỉ số hoàn thành SLA */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 font-semibold">
                <Timer className="w-3.5 h-3.5 text-emerald-600" />
                <span>Thời gian giải quyết: <strong>{formatProcessingTime()}</strong></span>
              </div>
              {formatSlaMargin() && (
                <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                  petition.isAheadOfSla ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}>
                  {formatSlaMargin()}
                </span>
              )}
            </div>
          </div>

          {/* Footer Card: CSAT & CTA Link */}
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {petition.hasFeedback && petition.feedbackRating ? (
                <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                  <StarRating rating={petition.feedbackRating} />
                  <span className="text-xs font-bold text-amber-900">Người dân đánh giá {petition.feedbackRating}/5 sao</span>
                </div>
              ) : (
                <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                  Hồ sơ công vụ minh bạch
                </span>
              )}
            </div>

            <Link
              to={`/track?code=${petition.trackingCode}`}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#006194] hover:bg-[#0284c7] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all group-hover:translate-x-0.5 whitespace-nowrap shrink-0"
            >
              <span>Xem toàn văn kết luận & biên bản</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // ==========================================
  // VARIANT 2: DANH SÁCH BẢN TIN NGANG (HORIZONTAL EDITORIAL CARD CHO LƯỚI 2x2)
  // ==========================================
  if (variant === 'horizontal') {
    return (
      <article className="group bg-white rounded-2xl border border-slate-200/90 hover:border-sky-300 shadow-2xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col sm:flex-row h-full">
        {/* Hình ảnh bên trái (hoặc trên cùng ở mobile nhỏ) */}
        <div className="relative sm:w-44 md:w-48 lg:w-44 xl:w-48 min-h-[150px] sm:min-h-full bg-slate-900 overflow-hidden shrink-0">
          {petition.thumbnailUrl ? (
            <img
              src={petition.thumbnailUrl}
              alt={petition.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#003755] to-[#006194] text-white p-5 text-center">
              <Newspaper className="w-10 h-10 text-sky-300/70 mb-2" />
              <p className="text-[10px] font-mono uppercase text-sky-200">Hồ Sơ Đã Xử Lý</p>
              <p className="text-xs font-semibold text-white/90 mt-1 line-clamp-2">{petition.title}</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent sm:hidden" />

          {/* Badges trên ảnh */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 items-center">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600/95 backdrop-blur-xs text-white text-[10px] font-bold shadow-xs">
              <CheckCircle2 className="w-3 h-3" />
              Đã kết luận
            </span>
          </div>

          {/* Mã hồ sơ trên ảnh */}
          <div className="absolute bottom-2.5 left-2.5">
            <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-white font-mono text-[10px] font-bold border border-white/20">
              #{petition.trackingCode}
            </span>
          </div>
        </div>

        {/* Nội dung bên phải */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-2.5">
          <div className="space-y-2.5">
            {/* Meta bar: Chuyên mục, Ngày ban hành, Cơ quan */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                {getCategoryBadge(petition.categoryCode, petition.categoryName)}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Ban hành: <strong className="text-slate-700 font-semibold">{resolvedDate}</strong></span>
              </div>
            </div>

            {/* Tiêu đề hồ sơ - Chuẩn font Sans hệ thống */}
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-[#006194] transition-colors line-clamp-2">
              <Link to={`/track?code=${petition.trackingCode}`}>
                {petition.title}
              </Link>
            </h3>

            {/* Địa bàn xác minh & Phòng ban */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#006194] shrink-0" />
              <span className="truncate">{petition.administrativeUnitName || petition.addressText || 'Cà Mau'}</span>
              {petition.departmentName && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-700 font-semibold truncate">{petition.departmentName}</span>
                </>
              )}
            </div>

            {/* Hộp Trích Dẫn Toàn Văn Kết Luận Giải Quyết */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-sky-50/90 to-slate-50 border-l-4 border-[#006194] border-t border-r border-b border-sky-100/70 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-[#006194]" />
                  <span className="text-[11px] font-bold uppercase text-[#006194]">
                    Kết luận xử lý chính thức
                  </span>
                </div>
                {petition.resolutionDocumentNumber && (
                  <span className="px-2 py-0.5 rounded bg-white font-mono text-[10px] font-bold text-sky-800 border border-sky-200">
                    Số {petition.resolutionDocumentNumber}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic line-clamp-2">
                "{petition.resolutionSummary || 'Đã tổ chức kiểm tra thực địa, lập biên bản làm việc và xử lý dứt điểm theo quy định pháp luật ngành thủy sản.'}"
              </p>
            </div>
          </div>

          {/* Footer Card: SLA, Đánh giá CSAT & Nút CTA */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* SLA */}
              <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                <Timer className="w-3.5 h-3.5 text-emerald-600" />
                <span>Xử lý trong <strong className="text-slate-800">{formatProcessingTime()}</strong></span>
              </div>

              {/* SLA Margin */}
              {formatSlaMargin() && (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  petition.isAheadOfSla ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}>
                  {formatSlaMargin()}
                </span>
              )}

              {/* Đánh giá người dân */}
              {petition.hasFeedback && petition.feedbackRating ? (
                <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                  <StarRating rating={petition.feedbackRating} />
                  <span className="text-[11px] font-bold text-amber-900">{petition.feedbackRating}/5 sao</span>
                </div>
              ) : null}
            </div>

            {/* Link Xem chi tiết */}
            <Link
              to={`/track?code=${petition.trackingCode}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#006194] hover:bg-[#0284c7] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all whitespace-nowrap shrink-0 group-hover:translate-x-0.5"
            >
              <span>Xem kết luận & biên bản</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // ==========================================
  // VARIANT 3: THẺ BÁO CHÍ CHUẨN (STANDARD EDITORIAL CARD)
  // ==========================================
  return (
    <article className="group rounded-2xl bg-white border border-slate-200/90 hover:border-sky-300 shadow-2xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      {/* Thumbnail ảnh hiện trường tỉ lệ báo chí */}
      <div className="relative h-44 overflow-hidden bg-slate-900 shrink-0">
        {petition.thumbnailUrl ? (
          <img
            src={petition.thumbnailUrl}
            alt={petition.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-sky-950 text-white p-4 text-center">
            <Newspaper className="w-8 h-8 text-sky-400/60 mb-1.5" />
            <p className="text-[10px] font-mono tracking-wider text-sky-200 uppercase">Hồ sơ công khai</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Badge trạng thái */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-md">
            <CheckCircle2 className="w-3 h-3" />
            {petition.statusName || 'Đã giải quyết'}
          </span>
        </div>

        {/* Badge mã hồ sơ */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white text-[10px] font-mono font-bold border border-white/20">
            #{petition.trackingCode}
          </span>
        </div>

        {/* Ngày giải quyết trên ảnh */}
        <div className="absolute bottom-3 right-3 text-[10px] text-white/90 font-medium">
          {resolvedDate}
        </div>
      </div>

      {/* Nội dung báo chí */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2.5">
          {/* Chuyên mục */}
          <div>
            {getCategoryBadge(petition.categoryCode, petition.categoryName)}
          </div>

          {/* Tiêu đề tin bài */}
          <h4 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-[#006194] transition-colors">
            <Link to={`/track?code=${petition.trackingCode}`}>
              {petition.title}
            </Link>
          </h4>

          {/* Địa bàn */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {petition.administrativeUnitName || petition.addressText || 'Cà Mau'}
            </span>
          </div>

          {/* Hộp tóm tắt kết luận của cơ quan nhà nước */}
          {petition.resolutionSummary && (
            <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-[#006194] uppercase tracking-wider flex items-center gap-1">
                  <FileCheck2 className="w-3 h-3" />
                  Kết luận xử lý
                </span>
                {petition.resolutionDocumentNumber && (
                  <span className="text-[10px] text-sky-700 font-mono font-semibold">
                    Số {petition.resolutionDocumentNumber}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed line-clamp-2 italic">
                "{petition.resolutionSummary}"
              </p>
            </div>
          )}
        </div>

        {/* Footer: Thời gian hoàn tất & Link */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
            <Timer className="w-3 h-3 text-emerald-500" />
            <span>Xử lý trong {formatProcessingTime()}</span>
          </div>

          <Link
            to={`/track?code=${petition.trackingCode}`}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#006194] hover:text-sky-700 group-hover:translate-x-0.5 transition-transform whitespace-nowrap shrink-0"
          >
            <span>Đọc tiếp</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </article>
  );
};
