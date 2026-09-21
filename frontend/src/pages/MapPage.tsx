import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Flame, 
  Anchor, 
  Droplets, 
  PlusCircle,
  RotateCw,
  Compass,
  MapPin
} from 'lucide-react';

import { gisApi } from '../api/gisApi';
import type { GisFilterParams, GeoJsonFeature } from '../types/gis';
import { GisLeafletMap } from '../components/gis/GisLeafletMap';
import type { BaseMapType } from '../components/gis/GisFilterPanel';

export const MapPage: React.FC = () => {
  const [baseMap, setBaseMap] = useState<BaseMapType>('streets');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [activeType, setActiveType] = useState<string>('all');
  const [flyToLocation, setFlyToLocation] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<GeoJsonFeature | null>(null);

  // Xây dựng params lọc
  const filters: GisFilterParams = {};
  if (activeType !== 'all') {
    // Mapping loại vi phạm
    if (activeType === 'iuu') filters.status = undefined; // Category filter sẽ được áp dụng nếu cần
  }

  // 1. Query GeoJSON data
  const { 
    data: geoJsonData, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['public-gis-geojson', activeType],
    queryFn: () => gisApi.getPetitionsGeoJson(),
  });

  // 2. Query Heatmap data
  const { data: heatmapRes } = useQuery({
    queryKey: ['public-gis-heatmap'],
    queryFn: () => gisApi.getHeatmapData(),
    enabled: showHeatmap,
  });

  // Lọc danh sách điểm hiển thị
  const allFeatures = geoJsonData?.features ?? [];
  const filteredFeatures = allFeatures.filter((f) => {
    if (activeType === 'all') return true;
    if (activeType === 'iuu') return f.properties.categoryType === 'IuuFishing';
    if (activeType === 'disease') return f.properties.categoryType === 'AquacultureDisease';
    if (activeType === 'pollution') return f.properties.categoryType === 'WaterPollution';
    return true;
  });

  const handleSelectHotspot = useCallback((feature: GeoJsonFeature) => {
    setSelectedFeature(feature);
    setFlyToLocation({
      lat: feature.geometry.coordinates[1],
      lng: feature.geometry.coordinates[0],
      zoom: 14,
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-[#006194] uppercase tracking-wider bg-sky-50 px-2 py-0.5 rounded">
              Hệ Thống Thông Tin Địa Lý GIS Thủy Sản
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Bản Đồ Số Cảnh Báo Ngư Trường & Vùng Nuôi Trồng
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Trực quan hóa thời gian thực các sự cố ô nhiễm, ổ dịch bệnh và vi phạm trên vùng biển tỉnh Cà Mau.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Heatmap Toggle */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border ${
              showHeatmap
                ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${showHeatmap ? 'text-rose-600 animate-pulse' : 'text-slate-400'}`} />
            <span>Lớp Nhiệt Mật Độ</span>
          </button>

          {/* Base Map Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setBaseMap('streets')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                baseMap === 'streets' ? 'bg-white text-sky-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              Đường phố
            </button>
            <button
              onClick={() => setBaseMap('satellite')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                baseMap === 'satellite' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              Vệ tinh
            </button>
          </div>

          <Link
            to="/submit"
            className="flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-[#006194] hover:bg-[#0284c7] text-white text-xs font-bold shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Gửi phản ánh mới</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveType('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeType === 'all'
              ? 'bg-[#006194] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Tất cả ({allFeatures.length})
        </button>
        <button
          onClick={() => setActiveType('iuu')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeType === 'iuu'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Anchor className="w-3.5 h-3.5 text-rose-500" />
          <span>Cảnh báo IUU / VMS</span>
        </button>
        <button
          onClick={() => setActiveType('disease')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeType === 'disease'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>Dịch bệnh thủy sản</span>
        </button>
        <button
          onClick={() => setActiveType('pollution')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeType === 'pollution'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Droplets className="w-3.5 h-3.5 text-sky-500" />
          <span>Ô nhiễm nguồn nước</span>
        </button>
      </div>

      {/* Main Grid: 8 Cols Interactive Leaflet Map, 4 Cols Active Hotspots */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* === MAP CONTAINER (8 COLS) === */}
        <div className="lg:col-span-8 relative h-[560px] rounded-3xl overflow-hidden shadow-xl border border-slate-200">
          <GisLeafletMap
            geoJsonData={{ type: 'FeatureCollection', features: filteredFeatures, totalCount: filteredFeatures.length }}
            heatmapPoints={heatmapRes?.data?.rawArray ?? null}
            showHeatmap={showHeatmap}
            baseMap={baseMap}
            radiusMode={false}
            radiusCenter={null}
            radiusKm={10}
            onSelectFeature={setSelectedFeature}
            flyToLocation={flyToLocation}
          />

          {/* Quick Refresh Button on Map */}
          <button
            onClick={() => refetch()}
            className="absolute top-4 right-4 z-1000 p-2 rounded-xl bg-white/90 backdrop-blur-md hover:bg-white text-slate-700 shadow-md border border-slate-200 transition-colors"
            title="Làm mới dữ liệu bản đồ"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* === HOTSPOT DETAILS / LIST PANEL (4 COLS) === */}
        <div className="lg:col-span-4 h-[560px] flex flex-col space-y-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4 flex-grow flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-[#006194] uppercase tracking-wider">
                Điểm Nóng Gần Đây
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {filteredFeatures.length} Điểm ghi nhận
              </span>
            </div>

            {/* List of points */}
            <div className="space-y-2 overflow-y-auto pr-1 flex-grow custom-scrollbar">
              {filteredFeatures.length > 0 ? (
                filteredFeatures.map((feat) => {
                  const isSelected = selectedFeature?.id === feat.id;
                  const p = feat.properties;
                  return (
                    <div
                      key={feat.id}
                      onClick={() => handleSelectHotspot(feat)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                        isSelected
                          ? 'bg-sky-50/80 border-sky-400 shadow-sm ring-1 ring-sky-300'
                          : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[#006194] text-xs">{p.trackingCode}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white text-slate-700 border border-slate-200">
                          {p.statusName || 'Tiếp nhận'}
                        </span>
                      </div>
                      <p className="font-bold text-slate-800 text-xs leading-snug line-clamp-2">{p.title}</p>
                      <div className="flex items-center space-x-1 text-[11px] text-slate-500 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{p.addressText || 'Đang cập nhật'}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Compass className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs">Không có điểm nóng nào trong bộ lọc này.</p>
                </div>
              )}
            </div>

            {/* Quick action footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Hệ tọa độ: WGS84 (EPSG:4326)</span>
              <Link
                to="/track"
                className="text-[#006194] font-bold hover:underline"
              >
                Tra cứu tiến độ &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
