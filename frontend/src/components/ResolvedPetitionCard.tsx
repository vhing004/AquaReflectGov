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
  Building2,
} from 'lucide-react';

interface ResolvedPetitionCardProps {
  petition: PublicResolvedPetition;
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

// Lấy màu badge chuyên mục
const getCategoryColor = (code: string) => {
  switch (code) {
    case 'O_NHIEM_NUOC':
      return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    case 'DICH_BENH':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'VI_PHAM_IUU':
      return 'bg-blue-50 text-[#006194] border-blue-200';
    case 'GIONG_THUC_AN':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'HA_TANG_CANG_CA':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'THU_TUC_HANH_CHINH':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

export const ResolvedPetitionCard: React.FC<ResolvedPetitionCardProps> = ({ petition }) => {
  // Tính thời gian hiển thị
  const formatProcessingTime = () => {
    const hours = petition.actualProcessingHours ?? 0;
    if (hours < 1) return 'Dưới 1 giờ';
    if (hours < 24) return `${Math.round(hours)} giờ`;
    const days = Math.floor(hours / 24);
    const remainHours = Math.round(hours % 24);
    return remainHours > 0 ? `${days} ngày ${remainHours} giờ` : `${days} ngày`;
  };

  const formatSlaMargin = () => {
    const margin = petition.slaMarginHours ?? 0;
    const absMargin = Math.abs(margin);
    if (absMargin < 1) return '';
    if (absMargin < 24) {
      return petition.isAheadOfSla
        ? `Sớm hơn SLA ${Math.round(absMargin)}h`
        : `Quá hạn SLA ${Math.round(absMargin)}h`;
    }
    const days = Math.floor(absMargin / 24);
    return petition.isAheadOfSla
      ? `Sớm hơn SLA ${days} ngày`
      : `Quá hạn SLA ${days} ngày`;
  };

  // Ngày giải quyết
  const resolvedDate = petition.resolvedAt
    ? new Date(petition.resolvedAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : null;

  return (
    <div className="group rounded-2xl bg-white border border-slate-200/80 hover:border-sky-300 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      {/* Thumbnail ảnh hiện trường */}
      {petition.thumbnailUrl && (
        <div className="relative h-36 overflow-hidden">
          <img
            src={petition.thumbnailUrl}
            alt={petition.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {/* Badge trạng thái */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-sm">
              <CheckCircle2 className="w-3 h-3" />
              {petition.statusName}
            </span>
          </div>
          {/* Badge mã hồ sơ */}
          <div className="absolute bottom-3 left-3">
            <span className="px-2 py-0.5 rounded bg-black/50 backdrop-blur-sm text-white text-[10px] font-mono font-bold">
              #{petition.trackingCode}
            </span>
          </div>
        </div>
      )}

      {/* Nội dung */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Header: Chuyên mục + Mã đơn (nếu không có ảnh) */}
        <div className="flex items-center gap-2 flex-wrap mb-2.5">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryColor(
              petition.categoryCode
            )}`}
          >
            {petition.categoryName.length > 25
              ? petition.categoryName.substring(0, 25) + '...'
              : petition.categoryName}
          </span>
          {!petition.thumbnailUrl && (
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-mono font-bold">
              #{petition.trackingCode}
            </span>
          )}
        </div>

        {/* Tiêu đề */}
        <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-[#006194] transition-colors mb-2">
          {petition.title}
        </h4>

        {/* Địa bàn */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-3">
          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate">
            {petition.administrativeUnitName || petition.addressText || 'Không xác định'}
          </span>
        </div>

        {/* Thời gian xử lý thực tế */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1 text-[11px]">
            <Timer className="w-3 h-3 text-emerald-500" />
            <span className="font-semibold text-slate-700">
              Hoàn tất trong {formatProcessingTime()}
            </span>
          </div>
          {formatSlaMargin() && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                petition.isAheadOfSla
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              {formatSlaMargin()}
            </span>
          )}
        </div>

        {/* Kết luận thụ lý */}
        {petition.resolutionSummary && (
          <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100 mb-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <FileCheck2 className="w-3 h-3 text-[#006194]" />
              <span className="text-[10px] font-bold text-[#006194] uppercase tracking-wider">
                Kết luận thụ lý
              </span>
              {petition.resolutionDocumentNumber && (
                <span className="text-[10px] text-sky-500 font-mono">
                  Số {petition.resolutionDocumentNumber}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed line-clamp-2">
              {petition.resolutionSummary}
            </p>
          </div>
        )}

        {/* Đơn vị thụ lý */}
        {petition.departmentName && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-3">
            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{petition.departmentName}</span>
          </div>
        )}

        {/* Spacer để đẩy footer xuống đáy */}
        <div className="flex-1" />

        {/* Footer: Đánh giá CSAT + Ngày + Link chi tiết */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {petition.hasFeedback && petition.feedbackRating ? (
              <div className="flex items-center gap-1.5">
                <StarRating rating={petition.feedbackRating} />
                {petition.feedbackComment && (
                  <span className="text-[10px] text-slate-400 italic truncate max-w-[100px]">
                    "{petition.feedbackComment.length > 20
                      ? petition.feedbackComment.substring(0, 20) + '...'
                      : petition.feedbackComment}"
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Clock className="w-3 h-3" />
                <span>{resolvedDate}</span>
              </div>
            )}
          </div>

          <Link
            to={`/track?code=${petition.trackingCode}`}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#006194] hover:text-sky-700 group-hover:translate-x-0.5 transition-transform"
          >
            <span>Xem chi tiết</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
