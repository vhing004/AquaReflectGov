import React from 'react';
import { 
  Building2, 
  ChevronRight, 
  Flame, 
  Droplets, 
  Anchor, 
  MapPin, 
  AlertCircle,
  Clock
} from 'lucide-react';
import type { SpatialSummary, DistrictSummary } from '../../types/gis';

interface GisSummarySidebarProps {
  summary: SpatialSummary | null;
  isLoading: boolean;
  onFlyToDistrict: (district: DistrictSummary) => void;
  selectedPetitionId?: string | null;
}

export const GisSummarySidebar: React.FC<GisSummarySidebarProps> = ({
  summary,
  isLoading,
  onFlyToDistrict,
}) => {
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-lg p-4 space-y-4 text-xs h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center text-[#006194]">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Thống Kê Không Gian</h3>
            <p className="text-[11px] text-slate-500">Mật độ theo địa bàn huyện/thị xã</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-400 space-y-2">
          <div className="w-6 h-6 border-2 border-[#006194] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p>Đang nạp dữ liệu không gian...</p>
        </div>
      ) : summary ? (
        <div className="space-y-4 overflow-y-auto pr-1 custom-scrollbar flex-grow">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-sky-50/80 p-3 rounded-xl border border-sky-100">
              <span className="text-[10px] font-bold text-sky-800 uppercase block">Tổng điểm phản ánh</span>
              <span className="text-xl font-extrabold text-[#006194]">
                {summary.totalPetitionsWithLocation}
              </span>
              <span className="text-[10px] text-sky-600 block mt-0.5">có tọa độ GPS số</span>
            </div>
            <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Địa bàn bao phủ</span>
              <span className="text-xl font-extrabold text-emerald-700">
                {summary.totalDistrictsCovered}
              </span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">huyện / thị xã</span>
            </div>
          </div>

          {/* Category Distribution Bars */}
          <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
            <span className="font-bold text-slate-700 block text-[11px] uppercase">
              Cơ cấu phản ánh theo chuyên mục
            </span>
            <div className="space-y-1.5">
              {summary.categoryDistribution.map((cat) => (
                <div key={cat.categoryId} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-700 font-medium truncate max-w-[170px]" title={cat.categoryName}>
                      {cat.categoryName}
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {cat.count} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        cat.categoryType === 'IuuFishing'
                          ? 'bg-rose-500'
                          : cat.categoryType === 'WaterPollution'
                          ? 'bg-sky-500'
                          : cat.categoryType === 'AquacultureDisease'
                          ? 'bg-amber-500'
                          : 'bg-purple-500'
                      }`}
                      style={{ width: `${Math.max(cat.percentage, 5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* District Breakdown List */}
          <div className="space-y-2">
            <span className="font-bold text-slate-700 block text-[11px] uppercase">
              Phân bố theo huyện (Nhấp để zoom)
            </span>

            <div className="space-y-1.5">
              {summary.districtSummaries.map((dist) => (
                <div
                  key={dist.districtCode + dist.administrativeUnitId}
                  onClick={() => onFlyToDistrict(dist)}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/40 cursor-pointer transition-all space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#006194] group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-slate-800 text-xs">{dist.districtName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="font-mono font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                        {dist.totalCount} điểm
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                  {/* Badges for types in district */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
                    {dist.iuuCount > 0 && (
                      <span className="inline-flex items-center space-x-0.5 bg-rose-50 text-rose-700 px-1.5 py-0.2 rounded font-semibold">
                        <Anchor className="w-2.5 h-2.5" />
                        <span>IUU: {dist.iuuCount}</span>
                      </span>
                    )}
                    {dist.diseaseCount > 0 && (
                      <span className="inline-flex items-center space-x-0.5 bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded font-semibold">
                        <Flame className="w-2.5 h-2.5" />
                        <span>Dịch: {dist.diseaseCount}</span>
                      </span>
                    )}
                    {dist.pollutionCount > 0 && (
                      <span className="inline-flex items-center space-x-0.5 bg-sky-50 text-sky-700 px-1.5 py-0.2 rounded font-semibold">
                        <Droplets className="w-2.5 h-2.5" />
                        <span>Ô nhiễm: {dist.pollutionCount}</span>
                      </span>
                    )}
                    {dist.overdueCount > 0 && (
                      <span className="inline-flex items-center space-x-0.5 bg-red-100 text-red-800 px-1.5 py-0.2 rounded font-extrabold animate-pulse">
                        <Clock className="w-2.5 h-2.5" />
                        <span>Quá hạn: {dist.overdueCount}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-slate-400">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p>Chưa có dữ liệu không gian được ghi nhận.</p>
        </div>
      )}
    </div>
  );
};
