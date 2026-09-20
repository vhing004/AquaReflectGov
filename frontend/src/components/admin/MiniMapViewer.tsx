import React, { useState } from 'react';
import { MapPin, Navigation, ExternalLink, Copy, Check, Compass } from 'lucide-react';

interface MiniMapViewerProps {
  latitude?: number;
  longitude?: number;
  addressText: string;
  administrativeUnitName?: string;
}

export const MiniMapViewer: React.FC<MiniMapViewerProps> = ({
  latitude,
  longitude,
  addressText,
  administrativeUnitName,
}) => {
  const [copied, setCopied] = useState(false);

  const hasCoords = typeof latitude === 'number' && typeof longitude === 'number' && !isNaN(latitude) && !isNaN(longitude);

  const formatDMS = (deg: number, isLat: boolean) => {
    const absolute = Math.abs(deg);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = Math.floor((minutesNotTruncated - minutes) * 60);
    const direction = isLat ? (deg >= 0 ? 'N' : 'S') : deg >= 0 ? 'E' : 'W';
    return `${degrees}°${minutes}'${seconds}" ${direction}`;
  };

  const copyCoordinates = () => {
    if (!hasCoords) return;
    const text = `${latitude}, ${longitude}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const googleMapsUrl = hasCoords 
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressText)}`;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 overflow-hidden space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#006194]">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Vị Trí Hiện Trường & Không Gian GIS</h3>
            <p className="text-[11px] text-slate-500">Định vị GPS / VMS tại vùng biển hoặc cơ sở nuôi trồng</p>
          </div>
        </div>

        {hasCoords && (
          <button
            onClick={copyCoordinates}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Sao chép cặp tọa độ"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Chép GPS</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Address and coordinate badges */}
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 space-y-2 text-xs">
        <div className="flex items-start space-x-2">
          <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800">Địa chỉ hiện trường:</span>{' '}
            <span className="text-slate-600">{addressText || 'Chưa có thông tin địa chỉ chi tiết'}</span>
            {administrativeUnitName && (
              <span className="ml-1.5 inline-block bg-sky-100/70 text-sky-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                {administrativeUnitName}
              </span>
            )}
          </div>
        </div>

        {hasCoords ? (
          <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-200/50 text-[11px] text-slate-600">
            <div className="flex items-center space-x-1">
              <span className="font-bold text-slate-700">Thập phân:</span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800 font-semibold">
                {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-bold text-slate-700">Hải sự (DMS):</span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-sky-700 font-semibold">
                {formatDMS(latitude!, true)}, {formatDMS(longitude!, false)}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-amber-600 italic">
            * Hồ sơ không đính kèm tọa độ GPS số. Vui lòng xác minh địa bàn qua mô tả địa chỉ.
          </div>
        )}
      </div>

      {/* Interactive Map view */}
      {hasCoords ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-inner h-60 w-full bg-slate-100">
          <iframe
            title="OpenStreetMap Location"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude! - 0.015}%2C${latitude! - 0.01}%2C${longitude! + 0.015}%2C${latitude! + 0.01}&layer=mapnik&marker=${latitude}%2C${longitude}`}
            className="w-full h-full"
          />
          <div className="absolute bottom-2 right-2 flex items-center space-x-2">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/95 hover:bg-white text-slate-800 shadow-md text-xs font-bold transition-all border border-slate-300 hover:shadow-lg"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              <span>Chỉ đường Google Maps</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center bg-slate-50/50">
          <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Không có tọa độ bản đồ cho hồ sơ này.</p>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1.5 mt-3 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors"
          >
            <span>Tìm kiếm theo địa chỉ trên Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
};
