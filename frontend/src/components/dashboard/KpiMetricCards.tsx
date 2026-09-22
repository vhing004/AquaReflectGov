import React from 'react';
import { 
  Inbox, 
  Clock, 
  Star, 
  AlertTriangle, 
  Flame,
  Percent
} from 'lucide-react';
import type { DashboardKpiSummary, SatisfactionStat } from '../../types/dashboard';

interface KpiMetricCardsProps {
  kpi: DashboardKpiSummary;
  satisfaction: SatisfactionStat;
  isLoading?: boolean;
}

export const KpiMetricCards: React.FC<KpiMetricCardsProps> = ({
  kpi,
  satisfaction,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs animate-pulse space-y-3">
            <div className="h-3 w-24 bg-slate-200 rounded"></div>
            <div className="h-8 w-16 bg-slate-200 rounded"></div>
            <div className="h-3 w-36 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* 1. Tổng Tiếp Nhận */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2 relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Tổng Đơn Tiếp Nhận
          </span>
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#006194] flex items-center justify-center">
            <Inbox className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline space-x-2">
          <p className="text-3xl font-extrabold text-[#006194] tracking-tight">
            {kpi.totalPetitions}
          </p>
          <span className="text-xs font-semibold text-slate-500">hồ sơ</span>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
          <span className="text-slate-600 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            <span>Chờ thụ lý: <strong>{kpi.submittedCount}</strong></span>
          </span>
          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
            Đã xong: {kpi.resolvedCount}
          </span>
        </div>
      </div>

      {/* 2. Đang Xử Lý & Khẩn Cấp */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2 relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Đang Thụ Lý & Thẩm Tra
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline space-x-2">
          <p className="text-3xl font-extrabold text-amber-600 tracking-tight">
            {kpi.inProgressCount + kpi.assignedCount}
          </p>
          <span className="text-xs font-semibold text-slate-500">hồ sơ</span>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
          <span className="text-slate-600">
            Khảo sát thực địa: <strong>{kpi.inProgressCount}</strong>
          </span>
          {kpi.urgentPendingCount > 0 ? (
            <span className="inline-flex items-center space-x-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold animate-pulse">
              <Flame className="w-3 h-3 text-rose-600" />
              <span>{kpi.urgentPendingCount} Khẩn cấp</span>
            </span>
          ) : (
            <span className="text-emerald-600 font-semibold">Bình thường</span>
          )}
        </div>
      </div>

      {/* 3. Tỷ Lệ Giải Quyết Đúng Hạn SLA */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2 relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Đúng Hạn Cam Kết (SLA)
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Percent className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline space-x-2">
          <p className="text-3xl font-extrabold text-emerald-600 tracking-tight">
            {kpi.onTimeRate}%
          </p>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
            {kpi.onTimeResolvedCount}/{kpi.resolvedCount}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              kpi.onTimeRate >= 90 ? 'bg-emerald-500' : kpi.onTimeRate >= 75 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${Math.min(kpi.onTimeRate, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] pt-1">
          <span className="text-slate-500">
            TB xử lý: <strong>{kpi.averageResolutionHours}h</strong>
          </span>
          {kpi.overdueCount > 0 ? (
            <span className="inline-flex items-center space-x-1 text-red-700 bg-red-50 px-2 py-0.5 rounded font-extrabold">
              <AlertTriangle className="w-3 h-3 text-red-600" />
              <span>{kpi.overdueCount} Quá hạn</span>
            </span>
          ) : (
            <span className="text-emerald-700 font-bold">0 trễ hạn</span>
          )}
        </div>
      </div>

      {/* 4. Chỉ Số Hài Lòng Công Dân (CSAT) */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2 relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Đánh Giá Hài Lòng (CSAT)
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
        </div>

        <div className="flex items-baseline space-x-2">
          <p className="text-3xl font-extrabold text-amber-500 tracking-tight">
            {satisfaction.averageRating.toFixed(1)}
          </p>
          <div className="flex items-center text-amber-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= Math.round(satisfaction.averageRating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-200 fill-slate-100'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
          <span className="text-slate-600">
            {satisfaction.totalFeedbacks} lượt đánh giá
          </span>
          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">
            {satisfaction.satisfactionRate}% hài lòng
          </span>
        </div>
      </div>
    </div>
  );
};
