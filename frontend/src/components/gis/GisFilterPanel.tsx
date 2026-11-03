import React from 'react';
import { 
  Layers, 
  Flame, 
  Compass, 
  AlertTriangle, 
  RotateCcw,
  Satellite,
  MapPin,
  Globe
} from 'lucide-react';
import type { GisFilterParams } from '../../types/gis';
import { 
  POST_MERGER_PROVINCES_34, 
  VIETNAM_REGIONS 
} from '../../data/maritimeData';

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
  selectedProvinceId?: number;
  onSelectProvince?: (provId?: number, centerCoords?: { lat: number; lng: number; zoom: number }) => void;
  selectedRegionId?: string;
  onSelectRegion?: (regionId?: string, centerCoords?: { lat: number; lng: number; zoom: number }) => void;
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
  selectedProvinceId,
  onSelectProvince,
  selectedRegionId = 'ALL',
  onSelectRegion,
}) => {
  // Lọc danh sách tỉnh theo vùng miền đã chọn (nếu có)
  const filteredProvinces = selectedRegionId && selectedRegionId !== 'ALL'
    ? POST_MERGER_PROVINCES_34.filter((p) => {
        if (selectedRegionId === 'CENTRAL_CITIES') return p.region === 'Thành phố Trực thuộc Trung ương';
        if (selectedRegionId === 'NORTH') return p.region === 'Miền Bắc và Trung du, ĐBSH';
        if (selectedRegionId === 'CENTRAL') return p.region === 'Miền Trung và Tây Nguyên';
        if (selectedRegionId === 'SOUTH') return p.region === 'Miền Nam';
        return true;
      })
    : POST_MERGER_PROVINCES_34;

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regId = e.target.value;
    const regObj = VIETNAM_REGIONS.find((r) => r.id === regId);
    if (onSelectRegion) {
      onSelectRegion(regId, regObj?.centerCoords);
    }
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value ? Number(e.target.value) : undefined;
    const provObj = POST_MERGER_PROVINCES_34.find((p) => p.id === val);
    if (onSelectProvince) {
      onSelectProvince(val, provObj?.centerCoords);
    } else {
      onFilterChange({ ...filters, administrativeUnitId: val });
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-lg p-3 sm:p-4 space-y-3 text-xs">
      {/* Top Row: Base Map Switcher & Heatmap / Radius Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        {/* Base Map Selector */}
        <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-xl">
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

      {/* Địa Bàn Hành Chính Sau Sáp Nhập & Vùng Miền (34 Tỉnh/Thành) */}
      <div className="flex flex-wrap items-center gap-2 pt-0.5 border-b border-slate-100 pb-2.5">
        {/* Bộ lọc Vùng Miền */}
        <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl">
          <Globe className="w-3.5 h-3.5 text-[#006194]" />
          <span className="text-[11px] font-bold text-slate-600 shrink-0">Vùng:</span>
          <select
            value={selectedRegionId}
            onChange={handleRegionChange}
            className="bg-transparent text-slate-800 font-bold text-xs focus:outline-none cursor-pointer"
          >
            {VIETNAM_REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Bộ lọc 34 Tỉnh/Thành Phố Sau Sáp Nhập */}
        <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl flex-1 min-w-[240px]">
          <MapPin className="w-3.5 h-3.5 text-rose-500" />
          <span className="text-[11px] font-bold text-slate-600 shrink-0">Tỉnh/TP:</span>
          <select
            value={selectedProvinceId || ''}
            onChange={handleProvinceChange}
            className="bg-transparent text-slate-800 font-bold text-xs focus:outline-none w-full cursor-pointer"
          >
            <option value="">-- Toàn bộ địa bàn (Bay đến tỉnh để lọc) --</option>
            {['Thành phố Trực thuộc Trung ương', 'Miền Bắc và Trung du, ĐBSH', 'Miền Trung và Tây Nguyên', 'Miền Nam'].map((reg) => {
              const inGroup = filteredProvinces.filter((p) => p.region === reg);
              if (inGroup.length === 0) return null;
              return (
                <optgroup key={reg} label={reg} className="font-bold text-slate-900">
                  {inGroup.map((prov) => (
                    <option key={prov.id} value={prov.id} className="font-normal text-slate-700">
                      {prov.name} {prov.note ? `(${prov.note})` : ''}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
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
