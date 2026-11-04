import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, ExternalLink, Copy, Check, Compass } from 'lucide-react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MiniMapViewerProps {
  latitude?: number;
  longitude?: number;
  addressText: string;
  administrativeUnitName?: string;
}

const SATELLITE_TILE_CONFIG = {
  url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
  attribution: '&copy; Google Maps',
  maxZoom: 20,
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
};

export const MiniMapViewer: React.FC<MiniMapViewerProps> = ({
  latitude,
  longitude,
  addressText,
  administrativeUnitName,
}) => {
  const [copied, setCopied] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const hasCoords = typeof latitude === 'number' && typeof longitude === 'number' && !isNaN(latitude) && !isNaN(longitude);

  // 1. Khởi tạo bản đồ Leaflet cố định ở chế độ Vệ tinh
  useEffect(() => {
    if (!hasCoords || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [latitude!, longitude!],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    // Tải lớp bản đồ nền Vệ tinh Google Hybrid (siêu nét, có nhãn địa danh & sông biển)
    L.tileLayer(SATELLITE_TILE_CONFIG.url, {
      attribution: SATELLITE_TILE_CONFIG.attribution,
      maxZoom: SATELLITE_TILE_CONFIG.maxZoom,
      subdomains: SATELLITE_TILE_CONFIG.subdomains as any,
    }).addTo(map);

    // Marker ghim vị trí hiện trường dạng SVG đỏ viền trắng nổi bật trên nền vệ tinh
    const customPin = L.divIcon({
      className: 'custom-gis-pin',
      html: `
        <div style="position: relative; width: 34px; height: 42px;">
          <div style="
            width: 32px;
            height: 32px;
            background: #ef4444;
            border: 2.5px solid #ffffff;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
          ">
            <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
          </div>
        </div>
      `,
      iconSize: [34, 42],
      iconAnchor: [16, 40],
      popupAnchor: [0, -34],
    });

    const marker = L.marker([latitude!, longitude!], { icon: customPin }).addTo(map);

    marker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; line-height: 1.4; color: #1e293b; min-width: 190px;">
        <div style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">Vị trí hiện trường (Ảnh vệ tinh)</div>
        <div style="color: #64748b; font-size: 11px; margin-bottom: 4px;">${addressText || 'Chưa có thông tin'}</div>
        <div style="font-family: monospace; font-size: 11px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; display: inline-block;">
          ${latitude!.toFixed(6)}, ${longitude!.toFixed(6)}
        </div>
      </div>
    `);

    mapInstanceRef.current = map;

    // Kích hoạt tính toán lại kích thước view của Leaflet sau khi render
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 400);

    let resizeObserver: ResizeObserver | null = null;
    if (mapContainerRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (resizeObserver) resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [hasCoords, latitude, longitude, addressText]);

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
            <p className="text-[11px] text-slate-500">Định vị GPS / VMS ảnh vệ tinh mặt nước và cơ sở nuôi trồng</p>
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

      {/* Địa chỉ và huy hiệu toạ độ */}
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

      {/* Bản đồ Leaflet tương tác chuyên biệt Vệ Tinh */}
      {hasCoords ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-inner h-64 w-full bg-slate-900">
          <div
            ref={mapContainerRef}
            className="w-full h-full z-0"
            style={{ height: '100%', minHeight: '256px', width: '100%' }}
          />

          {/* Huy hiệu hiển thị chế độ ảnh vệ tinh */}
          <div className="absolute top-2 right-2 z-[10] flex items-center space-x-1.5 bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 shadow-lg text-[11px] font-bold text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Ảnh Vệ Tinh Trực Giao</span>
          </div>

          {/* Nút chỉ đường Google Maps */}
          <div className="absolute bottom-2 right-2 z-[10] flex items-center space-x-2">
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
