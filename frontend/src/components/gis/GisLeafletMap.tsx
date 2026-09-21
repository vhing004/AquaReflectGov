import React, { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import 'leaflet.heat';
import type { GeoJsonFeatureCollection, GeoJsonFeature } from '../../types/gis';
import type { BaseMapType } from './GisFilterPanel';

interface GisLeafletMapProps {
  geoJsonData: GeoJsonFeatureCollection | null;
  heatmapPoints: [number, number, number][] | null;
  showHeatmap: boolean;
  baseMap: BaseMapType;
  radiusMode: boolean;
  radiusCenter: { lat: number; lng: number } | null;
  radiusKm: number;
  onMapClickForRadius?: (coords: { lat: number; lng: number }) => void;
  onSelectFeature?: (feature: GeoJsonFeature) => void;
  flyToLocation?: { lat: number; lng: number; zoom?: number } | null;
}

// Cấu hình các lớp bản đồ nền TileLayer
const TILE_LAYERS: Record<BaseMapType, { url: string; attribution: string; maxZoom: number }> = {
  streets: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
  },
  positron: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
  },
};

// Hàm xác định màu sắc và biểu tượng theo loại chuyên mục
const getCategoryStyling = (type?: string) => {
  switch (type) {
    case 'IuuFishing':
      return {
        color: '#ef4444', // Đỏ rực
        bgBadge: '#fef2f2',
        borderBadge: '#fecaca',
        textBadge: '#b91c1c',
        label: 'Vi phạm IUU / VMS',
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>`,
      };
    case 'WaterPollution':
      return {
        color: '#0284c7', // Xanh dương
        bgBadge: '#f0f9ff',
        borderBadge: '#bae6fd',
        textBadge: '#0369a1',
        label: 'Ô nhiễm nguồn nước',
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2.69 5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
      };
    case 'AquacultureDisease':
      return {
        color: '#f59e0b', // Cam
        bgBadge: '#fffbeb',
        borderBadge: '#fde68a',
        textBadge: '#b45309',
        label: 'Dịch bệnh thủy sản',
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
      };
    case 'DestructiveFishing':
      return {
        color: '#8b5cf6', // Tím
        bgBadge: '#f5f3ff',
        borderBadge: '#ddd6fe',
        textBadge: '#6d28d9',
        label: 'Bảo vệ nguồn lợi',
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      };
    default:
      return {
        color: '#64748b', // Xám Slate
        bgBadge: '#f8fafc',
        borderBadge: '#e2e8f0',
        textBadge: '#475569',
        label: 'Phản ánh khác',
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
      };
  }
};

export const GisLeafletMap: React.FC<GisLeafletMapProps> = ({
  geoJsonData,
  heatmapPoints,
  showHeatmap,
  baseMap,
  radiusMode,
  radiusCenter,
  radiusKm,
  onMapClickForRadius,
  onSelectFeature,
  flyToLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const heatmapLayerRef = useRef<any | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const radiusCenterMarkerRef = useRef<L.Marker | null>(null);

  // 1. Khởi tạo bản đồ lần đầu (Cà Mau Center: 9.176, 105.150)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [9.176, 105.150], // Tọa độ trung tâm tỉnh Cà Mau
      zoom: 10,
      zoomControl: false,
    });

    // Zoom control ở góc dưới bên phải
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Scale control
    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

    // Nạp TileLayer ban đầu
    const initialConfig = TILE_LAYERS[baseMap];
    const tileLayer = L.tileLayer(initialConfig.url, {
      attribution: initialConfig.attribution,
      maxZoom: initialConfig.maxZoom,
    }).addTo(map);

    currentTileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Chuyển đổi lớp bản đồ nền (Base Map Switcher)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const config = TILE_LAYERS[baseMap];
    const newTileLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
    }).addTo(map);

    currentTileLayerRef.current = newTileLayer;
  }, [baseMap]);

  // 3. Xử lý click trên bản đồ khi bật chế độ quét bán kính
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (radiusMode && onMapClickForRadius) {
        onMapClickForRadius({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    };

    map.on('click', handleMapClick);

    // Thay đổi con trỏ chuột khi ở chế độ quét bán kính
    if (radiusMode) {
      map.getContainer().style.cursor = 'crosshair';
    } else {
      map.getContainer().style.cursor = '';
    }

    return () => {
      map.off('click', handleMapClick);
    };
  }, [radiusMode, onMapClickForRadius]);

  // 4. Vẽ vòng tròn bán kính không gian khi có tâm và cự ly
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Xóa circle và marker cũ
    if (radiusCircleRef.current) {
      map.removeLayer(radiusCircleRef.current);
      radiusCircleRef.current = null;
    }
    if (radiusCenterMarkerRef.current) {
      map.removeLayer(radiusCenterMarkerRef.current);
      radiusCenterMarkerRef.current = null;
    }

    if (radiusMode && radiusCenter) {
      // Vẽ vòng tròn bán kính (radiusKm đổi sang mét: radiusKm * 1000)
      const circle = L.circle([radiusCenter.lat, radiusCenter.lng], {
        radius: radiusKm * 1000,
        color: '#0284c7',
        fillColor: '#38bdf8',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '6, 6',
      }).addTo(map);

      // Marker tâm quét bán kính
      const centerIcon = L.divIcon({
        className: 'radius-center-icon',
        html: `
          <div style="
            width: 24px;
            height: 24px;
            background: #006194;
            border: 3px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 4px 10px rgba(0, 97, 148, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 6px; height: 6px; background: #ffffff; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([radiusCenter.lat, radiusCenter.lng], {
        icon: centerIcon,
      }).addTo(map);

      radiusCircleRef.current = circle;
      radiusCenterMarkerRef.current = marker;

      // Fit bounds to show entire circle nicely
      map.fitBounds(circle.getBounds(), { padding: [30, 30], maxZoom: 14 });
    }
  }, [radiusMode, radiusCenter, radiusKm]);

  // 5. Nạp các điểm phản ánh GeoJSON với Custom Markers & Popups
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Xóa GeoJSON layer cũ nếu có
    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
      geoJsonLayerRef.current = null;
    }

    if (!geoJsonData || !geoJsonData.features || geoJsonData.features.length === 0) return;

    const layer = L.geoJSON(geoJsonData as any, {
      pointToLayer: (feature, latlng) => {
        const props = feature.properties;
        const style = getCategoryStyling(props.categoryType);
        const isUrgent = props.priorityLevel === 'Urgent' || props.isOverdue;

        const pulseClass = isUrgent ? 'gis-pulse-urgent' : '';

        // Tạo custom HTML Marker Pin với màu chuyên mục và icon SVG
        const customIcon = L.divIcon({
          className: 'gis-custom-pin',
          html: `
            <div style="position: relative; width: 34px; height: 42px;">
              <div class="${pulseClass}" style="
                width: 32px;
                height: 32px;
                background: ${style.color};
                border: 2.5px solid #ffffff;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                box-shadow: 0 6px 12px rgba(0,0,0,0.25);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ffffff;
                cursor: pointer;
              ">
                <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
                  ${style.iconSvg}
                </div>
              </div>
            </div>
          `,
          iconSize: [34, 42],
          iconAnchor: [16, 40],
          popupAnchor: [0, -36],
        });

        return L.marker(latlng, { icon: customIcon });
      },
      onEachFeature: (feature: any, marker: L.Marker) => {
        const props = feature.properties;
        const style = getCategoryStyling(props.categoryType);

        // Tạo HTML Popup hiển thị đầy đủ thông tin chuẩn Chính quyền số
        const popupContent = `
          <div style="width: 280px; font-family: inherit; font-size: 12px; color: #1e293b;">
            <!-- Popup Header -->
            <div style="background: #f8fafc; padding: 12px 14px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
              <span style="font-family: monospace; font-weight: 700; color: #006194; font-size: 11px;">
                ${props.trackingCode}
              </span>
              <span style="
                font-size: 10px;
                font-weight: 700;
                padding: 2px 6px;
                border-radius: 6px;
                background: ${style.bgBadge};
                color: ${style.textBadge};
                border: 1px solid ${style.borderBadge};
              ">
                ${props.priorityName || 'Bình thường'}
              </span>
            </div>

            <!-- Popup Body -->
            <div style="padding: 14px; space-y: 8px;">
              <h4 style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0; line-height: 1.35;">
                ${props.title}
              </h4>

              <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">
                <strong style="color: #475569;">Lĩnh vực:</strong> ${props.categoryName || 'Chung'}
              </div>

              <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
                <strong style="color: #475569;">Địa chỉ:</strong> ${props.addressText || 'Đang cập nhật'}
              </div>

              <!-- Status Badge & Overdue Warning -->
              <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px solid #f1f5f9;">
                <span style="font-weight: 600; color: #334155; font-size: 11px;">
                  Trạng thái: <b>${props.statusName || 'Tiếp nhận'}</b>
                </span>
                ${props.isOverdue ? `
                  <span style="font-size: 10px; font-weight: 800; color: #dc2626; background: #fee2e2; padding: 2px 6px; border-radius: 4px;">
                    QUÁ HẠN SLA
                  </span>
                ` : ''}
              </div>

              <!-- View Details Action Button -->
              <div style="margin-top: 10px; text-align: right;">
                <a 
                  href="/admin/petitions/${props.id}" 
                  style="
                    display: inline-block;
                    padding: 6px 12px;
                    border-radius: 8px;
                    background: #006194;
                    color: #ffffff;
                    text-decoration: none;
                    font-weight: 700;
                    font-size: 11px;
                    transition: background 0.2s;
                  "
                  onmouseover="this.style.background='#0284c7'"
                  onmouseout="this.style.background='#006194'"
                >
                  Xem hồ sơ chi tiết &rarr;
                </a>
              </div>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 300 });

        marker.on('click', () => {
          onSelectFeature?.(feature);
        });
      },
    }).addTo(map);

    geoJsonLayerRef.current = layer;
  }, [geoJsonData, onSelectFeature]);

  // 6. Lớp Bản đồ nhiệt (Heatmap Layer Toggle)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (heatmapLayerRef.current) {
      map.removeLayer(heatmapLayerRef.current);
      heatmapLayerRef.current = null;
    }

    if (showHeatmap && heatmapPoints && heatmapPoints.length > 0) {
      const heat = (L as any).heatLayer(heatmapPoints, {
        radius: 25,
        blur: 18,
        maxZoom: 14,
        max: 1.0,
        gradient: {
          0.2: '#0284c7', // Xanh nước biển
          0.4: '#06b6d4', // Cyan
          0.6: '#eab308', // Vàng cảnh báo
          0.8: '#f97316', // Cam
          1.0: '#ef4444', // Đỏ nguy hiểm bùng phát
        },
      }).addTo(map);

      heatmapLayerRef.current = heat;
    }
  }, [showHeatmap, heatmapPoints]);

  // 7. Hỗ trợ bay tới tọa độ (Fly To Location)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !flyToLocation) return;

    map.flyTo([flyToLocation.lat, flyToLocation.lng], flyToLocation.zoom || 13, {
      duration: 1.2,
    });
  }, [flyToLocation]);

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-3xl overflow-hidden shadow-xl border border-slate-200">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
