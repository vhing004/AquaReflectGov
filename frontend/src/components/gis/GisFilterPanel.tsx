import React from 'react';
import { 
  Layers, 
  Flame, 
  Compass, 
  AlertTriangle, 
  RotateCcw,
  Map as MapIcon,
  Satellite
} from 'lucide-react';
import type { GisFilterParams } from '../../types/gis';

export type BaseMapType = 'streets' | 'satellite' | 'positron';

interface GisFilterPanelProps {
  baseMap: BaseMapType;
  onBaseMapChange: (base: BaseMapType) => void;
  filters: GisFilterParams;
  onFilterChange: (filters: GisFilterParams) => void;
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
  radiusMode: boolean;
  onToggleRadiusMode: () => void;
  onResetFilters: () => void;
  totalPoints: number;
}

export const GisFilterPanel: React.FC<GisFilterPanelProps> = ({
  baseMap,
  onBaseMapChange,
  filters,
  onFilterChange,
  showHeatmap,
  onToggleHeatmap,
  radiusMode,
  onToggleRadiusMode,
  onResetFilters,
  totalPoints,
}) => {
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-lg p-3 sm:p-4 space-y-3 text-xs">
      {/* Top Row: Base Map Switcher & Heatmap / Radius Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        {/* Base Map Selector */}
        <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-xl">
          <button
            onClick={() => onBaseMapChange('streets')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
              baseMap === 'streets'
                ? 'bg-white text-sky-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Bản đồ đường phố OpenStreetMap"
          >
            <MapIcon className="w-3.5 h-3.5 text-sky-600" />
            <span>Đường phố</span>
          </button>
          <button
            onClick={() => onBaseMapChange('satellite')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
              baseMap === 'satellite'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Ảnh vệ tinh Esri World Imagery"
          >
            <Satellite className="w-3.5 h-3.5 text-emerald-600" />
            <span>Vệ tinh</span>
          </button>
          <button
            onClick={() => onBaseMapChange('positron')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
              baseMap === 'positron'
                ? 'bg-white text-indigo-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Bản đồ tối giản CartoDB Positron"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Tối giản</span>
          </button>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center space-x-1.5">
          {/* Heatmap Toggle */}
          <button
            onClick={onToggleHeatmap}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl font-bold transition-all border ${
              showHeatmap
                ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Bật/Tắt lớp bản đồ nhiệt biểu thị mật độ sự cố"
          >
            <Flame className={`w-3.5 h-3.5 ${showHeatmap ? 'text-rose-600 animate-pulse' : 'text-slate-400'}`} />
            <span>Lớp Nhiệt (Heatmap)</span>
          </button>

          {/* Radius Proximity Tool Toggle */}
          <button
            onClick={onToggleRadiusMode}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl font-bold transition-all border ${
              radiusMode
                ? 'bg-sky-50 border-sky-300 text-sky-700 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Bật/Tắt công cụ truy vấn điểm trong bán kính"
          >
            <Compass className={`w-3.5 h-3.5 ${radiusMode ? 'text-sky-600' : 'text-slate-400'}`} />
            <span>Quét Bán Kính</span>
          </button>
        </div>
      </div>

      {/* Filter Options Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Filter */}
        <select
          value={filters.status || ''}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value || undefined })}
          className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Submitted">Mới tiếp nhận</option>
          <option value="Assigned">Đã phân công</option>
          <option value="InProgress">Đang xử lý</option>
          <option value="Resolved">Đã giải quyết</option>
        </select>

        {/* Priority Filter */}
        <select
          value={filters.priorityLevel || ''}
          onChange={(e) => onFilterChange({ ...filters, priorityLevel: e.target.value || undefined })}
          className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
        >
          <option value="">Tất cả mức ưu tiên</option>
          <option value="Urgent">Khẩn cấp</option>
          <option value="High">Ưu tiên cao</option>
          <option value="Normal">Bình thường</option>
        </select>

        {/* Overdue SLA toggle */}
        <button
          onClick={() => onFilterChange({ ...filters, isOverdueOnly: !filters.isOverdueOnly })}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl font-bold transition-all border ${
            filters.isOverdueOnly
              ? 'bg-red-50 border-red-300 text-red-700 shadow-xs'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className={`w-3.5 h-3.5 ${filters.isOverdueOnly ? 'text-red-600' : 'text-slate-400'}`} />
          <span>Chỉ xem Quá hạn SLA</span>
        </button>

        {/* Reset Filters */}
        <button
          onClick={onResetFilters}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold transition-colors ml-auto"
          title="Đặt lại bộ lọc về mặc định"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Đặt lại</span>
        </button>

        {/* Point Count Badge */}
        <div className="bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-xl text-sky-800 font-bold">
          {totalPoints} điểm hiển thị
        </div>
      </div>
    </div>
  );
};
