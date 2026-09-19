import React from 'react';
import type { AdminPetitionItem } from '../../types';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  User,
  Phone,
  Building2,
  MapPin,
  Layers,
  Eye,
  Star,
  Flame,
  Paperclip,
} from 'lucide-react';

interface KanbanCardProps {
  item: AdminPetitionItem;
  onTransition: (item: AdminPetitionItem) => void;
  onViewDetail: (item: AdminPetitionItem) => void;
}

const getSlaRing = (item: AdminPetitionItem): string => {
  // Completed statuses — no urgency
  if (item.status === 4 || item.status === 5 || item.status === 6) {
    return 'border-emerald-200 bg-white';
  }
  if (item.isOverdue) {
    return 'border-rose-500 bg-rose-50/50 shadow-rose-100';
  }
  if (item.remainingHours !== undefined && item.remainingHours !== null && item.remainingHours <= 24) {
    return 'border-amber-400 bg-amber-50/40 shadow-amber-100';
  }
  if (item.remainingHours !== undefined && item.remainingHours !== null && item.remainingHours <= 48) {
    return 'border-orange-300 bg-orange-50/30';
  }
  return 'border-slate-200 bg-white';
};

const renderSlaChip = (item: AdminPetitionItem) => {
  if (item.status === 4 || item.status === 6) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
        <CheckCircle2 className="w-2.5 h-2.5" />
        Hoàn thành
      </span>
    );
  }
  if (item.isOverdue) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-700 bg-rose-100 border border-rose-300 px-1.5 py-0.5 rounded-full animate-pulse">
        <AlertTriangle className="w-2.5 h-2.5" />
        QUÁ HẠN SLA
      </span>
    );
  }
  if (item.remainingHours !== undefined && item.remainingHours !== null) {
    const hours = Math.round(item.remainingHours);
    if (hours <= 24) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded-full">
          <Clock className="w-2.5 h-2.5" />
          Còn {hours}h nữa
        </span>
      );
    }
    const days = Math.floor(hours / 24);
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded-full">
        <Clock className="w-2.5 h-2.5" />
        Còn {days} ngày
      </span>
    );
  }
  return null;
};

const renderPriorityDot = (priority: number) => {
  switch (priority) {
    case 3:
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-full">
          <Flame className="w-2.5 h-2.5 text-rose-500 animate-pulse" />
          Khẩn cấp
        </span>
      );
    case 2:
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
          <AlertTriangle className="w-2.5 h-2.5 text-amber-500" />
          Ưu tiên cao
        </span>
      );
    default:
      return null;
  }
};

export const KanbanCard: React.FC<KanbanCardProps> = ({ item, onTransition, onViewDetail }) => {
  const slaRing = getSlaRing(item);
  const isCompleted = item.status >= 4;

  return (
    <div
      className={`
        relative rounded-2xl border-2 shadow-xs transition-all duration-200
        hover:shadow-md hover:-translate-y-0.5 cursor-pointer group
        ${slaRing}
        ${item.isOverdue && !isCompleted ? 'shadow-rose-100' : ''}
      `}
      onClick={() => onViewDetail(item)}
    >
      {/* Overdue pulse ring overlay */}
      {item.isOverdue && !isCompleted && (
        <span className="absolute -inset-px rounded-2xl border-2 border-rose-400 animate-ping opacity-20 pointer-events-none" />
      )}

      <div className="p-3.5 space-y-2.5">
        {/* TOP ROW: tracking code + SLA chip */}
        <div className="flex items-start justify-between gap-2">
          <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded tracking-wider shrink-0">
            {item.trackingCode}
          </span>
          <div className="flex flex-wrap items-center gap-1 justify-end">
            {renderSlaChip(item)}
            {renderPriorityDot(item.priorityLevel)}
          </div>
        </div>

        {/* TITLE */}
        <p className="text-xs font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-[#006194] transition-colors">
          {item.title}
        </p>

        {/* CATEGORY + LOCATION */}
        <div className="flex flex-wrap gap-1">
          <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-100">
            {item.categoryName}
          </span>
          {item.addressText && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-500 truncate max-w-[160px]">
              <MapPin className="w-2.5 h-2.5 shrink-0 text-slate-400" />
              <span className="truncate">{item.addressText}</span>
            </span>
          )}
        </div>

        {/* DIVIDER */}
        <div className="border-t border-slate-100" />

        {/* SUBMITTER + DEPARTMENT */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <User className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="font-semibold truncate">
              {item.isAnonymous ? 'Ẩn danh' : item.citizenName || 'Người dân'}
            </span>
            {item.citizenPhone && !item.isAnonymous && (
              <>
                <span className="text-slate-300">·</span>
                <Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                <span className="text-slate-500 font-mono text-[10px]">{item.citizenPhone}</span>
              </>
            )}
          </div>

          {(item.departmentName || item.assignedUserName) && (
            <div className="flex items-center gap-1.5 text-[11px] text-sky-700">
              <Building2 className="w-3 h-3 shrink-0 text-sky-400" />
              <span className="font-semibold truncate">
                {item.departmentName || 'Chưa phân công'}
              </span>
              {item.assignedUserName && (
                <span className="text-sky-500 font-normal text-[10px] truncate">
                  — CV: {item.assignedUserName}
                </span>
              )}
            </div>
          )}

          {!item.departmentName && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 italic">
              <Building2 className="w-3 h-3 shrink-0" />
              <span>Chưa phân công phòng ban</span>
            </div>
          )}
        </div>

        {/* BOTTOM ACTIONS */}
        <div className="flex items-center justify-between pt-0.5">
          {/* Meta info */}
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
            {item.attachmentsCount > 0 && (
              <span className="flex items-center gap-0.5">
                <Paperclip className="w-2.5 h-2.5" />
                {item.attachmentsCount}
              </span>
            )}
            {item.hasFeedback && item.feedbackRating && (
              <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                {item.feedbackRating}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onViewDetail(item)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-sky-700 hover:bg-sky-50 transition-colors"
              title="Xem nhanh chi tiết"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            {item.status !== 6 && (
              <button
                onClick={() => onTransition(item)}
                className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800 transition-colors"
                title="Luân chuyển trạng thái"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
