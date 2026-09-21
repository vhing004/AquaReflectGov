import React from 'react';
import { Compass, MapPin, X, Navigation, AlertCircle } from 'lucide-react';
import type { SpatialRadiusResult } from '../../types/gis';

interface GisRadiusToolProps {
  centerCoords: { lat: number; lng: number } | null;
  radiusKm: number;
  onRadiusChange: (radius: number) => void;
  radiusData: SpatialRadiusResult | null;
  isLoading: boolean;
  onClose: () => void;
  onSelectPetition?: (id: string, lat: number, lng: number) => void;
}

export const GisRadiusTool: React.FC<GisRadiusToolProps> = ({
  centerCoords,
  radiusKm,
  onRadiusChange,
  radiusData,
  isLoading,
  onClose,
  onSelectPetition,
}) => {
  const presetRadii = [5, 10, 20, 35, 50];

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-sky-200 shadow-xl p-4 space-y-3.5 text-xs max-w-sm w-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center text-[#006194]">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Quét Bán Kính Không Gian</h4>
            <p className="text-[11px] text-slate-500">Tìm kiếm sự cố lân cận theo cự ly</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          title="Đóng công cụ bán kính"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Center Location Status */}
      {centerCoords ? (
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Tọa độ tâm quét</span>
              <p className="font-mono text-[11px] font-semibold text-slate-800">
                {centerCoords.lat.toFixed(5)}, {centerCoords.lng.toFixed(5)}
              </p>
            </div>
          </div>
          <span className="text-[10px] text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded font-bold">
            Đã neo tâm
          </span>
        </div>
      ) : (
        <div className="bg-amber-50 p-3 rounded-xl border border-amber-200/80 flex items-start space-x-2 text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            Nhấp chuột vào bất kỳ vị trí nào trên bản đồ để đặt tâm quét bán kính (hoặc chọn cơ sở nuôi trồng/vùng biển).
          </p>
        </div>
      )}

      {/* Radius Selector */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-700">Cự ly quét:</span>
          <span className="font-mono font-extrabold text-[#006194] bg-sky-50 px-2 py-0.5 rounded border border-sky-200 text-xs">
            {radiusKm} km
          </span>
        </div>

        {/* Preset buttons */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {presetRadii.map((r) => (
            <button
              key={r}
              onClick={() => onRadiusChange(r)}
              className={`py-1 rounded-lg font-bold text-center transition-all ${
                radiusKm === r
                  ? 'bg-[#006194] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {r}km
            </button>
          ))}
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800">Kết quả lân cận:</span>
          <span className="text-[11px] font-semibold text-slate-500">
            {isLoading ? 'Đang quét...' : `${radiusData?.totalCount ?? 0} phản ánh`}
          </span>
        </div>

        {isLoading ? (
          <div className="py-4 text-center text-slate-400">
            <div className="w-5 h-5 border-2 border-[#006194] border-t-transparent rounded-full animate-spin mx-auto mb-1.5"></div>
            <span>Đang tính toán cự ly hình cầu Haversine...</span>
          </div>
        ) : radiusData && radiusData.items.length > 0 ? (
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {radiusData.items.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectPetition?.(item.id, item.latitude, item.longitude)}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/50 cursor-pointer transition-all space-y-1 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#006194] text-[11px]">{item.trackingCode}</span>
                  <span className="font-mono font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded text-[10px]">
                    {item.distanceKm < 1 ? `${item.distanceMeters}m` : `${item.distanceKm.toFixed(1)}km`}
                  </span>
                </div>
                <p className="font-semibold text-slate-800 line-clamp-1 text-xs">{item.title}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                  <span className="truncate max-w-[170px]">{item.categoryName}</span>
                  <span className="font-medium text-slate-600">{item.statusName}</span>
                </div>
              </div>
            ))}
          </div>
        ) : centerCoords ? (
          <div className="py-4 text-center text-slate-400">
            <Navigation className="w-6 h-6 text-slate-300 mx-auto mb-1" />
            <p className="text-[11px]">Không có phản ánh nào trong phạm vi {radiusKm}km.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
