import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  RotateCw, 
  Layers
} from 'lucide-react';

import { gisApi } from '../api/gisApi';
import type { 
  GisFilterParams, 
  GeoJsonFeature, 
  DistrictSummary,
  SpatialRadiusResult
} from '../types/gis';
import { GisLeafletMap } from '../components/gis/GisLeafletMap';
import { GisFilterPanel, type BaseMapType } from '../components/gis/GisFilterPanel';
import { GisRadiusTool } from '../components/gis/GisRadiusTool';
import { GisSummarySidebar } from '../components/gis/GisSummarySidebar';

export const AdminGisMapPage: React.FC = () => {
  // Map control states
  const [baseMap, setBaseMap] = useState<BaseMapType>('streets');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [radiusMode, setRadiusMode] = useState<boolean>(false);
  const [radiusCenter, setRadiusCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(15);
  const [filters, setFilters] = useState<GisFilterParams>({});
  const [flyToLocation, setFlyToLocation] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<GeoJsonFeature | null>(null);

  // 1. Query GeoJSON data
  const { 
    data: geoJsonData, 
    isLoading: isGeoJsonLoading, 
    refetch: refetchGeoJson 
  } = useQuery({
    queryKey: ['gis-geojson', filters],
    queryFn: () => gisApi.getPetitionsGeoJson(filters),
  });

  // 2. Query Heatmap data
  const { data: heatmapRes } = useQuery({
    queryKey: ['gis-heatmap', filters.categoryId, filters.status],
    queryFn: () => gisApi.getHeatmapData(filters.categoryId, filters.status),
    enabled: showHeatmap,
  });

  // 3. Query Spatial Summary data
  const { 
    data: summaryRes, 
    isLoading: isSummaryLoading, 
    refetch: refetchSummary 
  } = useQuery({
    queryKey: ['gis-summary'],
    queryFn: () => gisApi.getSpatialSummary(),
  });

  // 4. Query Radius Proximity data
  const { 
    data: radiusRes, 
    isLoading: isRadiusLoading 
  } = useQuery<SpatialRadiusResult | null>({
    queryKey: ['gis-radius', radiusCenter?.lat, radiusCenter?.lng, radiusKm, filters.categoryId, filters.status],
    queryFn: async () => {
      if (!radiusCenter) return null;
      const res = await gisApi.getPetitionsByRadius(
        radiusCenter.lat,
        radiusCenter.lng,
        radiusKm,
        filters.categoryId,
        filters.status
      );
      return res.data;
    },
    enabled: radiusMode && !!radiusCenter,
  });

  // Handlers
  const handleMapClickForRadius = useCallback((coords: { lat: number; lng: number }) => {
    setRadiusCenter(coords);
  }, []);

  const handleFlyToDistrict = useCallback((dist: DistrictSummary) => {
    if (dist.centerLat && dist.centerLng) {
      setFlyToLocation({
        lat: dist.centerLat,
        lng: dist.centerLng,
        zoom: 12,
      });
    }
  }, []);

  const handleSelectRadiusItem = useCallback((_id: string, lat: number, lng: number) => {
    setFlyToLocation({
      lat,
      lng,
      zoom: 15,
    });
  }, []);

  const handleRefreshAll = () => {
    refetchGeoJson();
    refetchSummary();
  };

  const handleResetFilters = () => {
    setFilters({});
    setRadiusMode(false);
    setRadiusCenter(null);
    setShowHeatmap(false);
  };

  const totalPoints = geoJsonData?.totalCount ?? 0;

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-4">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/petitions"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Quay lại danh sách hồ sơ"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#006194] bg-sky-50 px-2 py-0.5 rounded">
                Trung Tâm Chỉ Huy & Giám Sát GIS
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Bản Đồ Không Gian Phản Ánh Thủy Sản Tỉnh Cà Mau
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefreshAll}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Làm mới dữ liệu không gian"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isGeoJsonLoading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>

          <Link
            to="/admin/petitions"
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#006194] hover:bg-[#0284c7] text-white shadow-xs transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Bảng Điều Phối Kanban</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <GisFilterPanel
        baseMap={baseMap}
        onBaseMapChange={setBaseMap}
        filters={filters}
        onFilterChange={setFilters}
        showHeatmap={showHeatmap}
        onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
        radiusMode={radiusMode}
        onToggleRadiusMode={() => {
          setRadiusMode(!radiusMode);
          if (!radiusMode && !radiusCenter) {
            // Đặt tâm mặc định gần trung tâm Cà Mau nếu chưa có
            setRadiusCenter({ lat: 9.176, lng: 105.150 });
          }
        }}
        onResetFilters={handleResetFilters}
        totalPoints={totalPoints}
      />

      {/* Main Content Layout: 9 Cols Map, 3 Cols Summary Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch min-h-[640px]">
        {/* === MAP CONTAINER (9 COLS) === */}
        <div className="lg:col-span-9 relative h-[640px] rounded-3xl overflow-hidden shadow-md border border-slate-200">
          <GisLeafletMap
            geoJsonData={geoJsonData ?? null}
            heatmapPoints={heatmapRes?.data?.rawArray ?? null}
            showHeatmap={showHeatmap}
            baseMap={baseMap}
            radiusMode={radiusMode}
            radiusCenter={radiusCenter}
            radiusKm={radiusKm}
            onMapClickForRadius={handleMapClickForRadius}
            onSelectFeature={setSelectedFeature}
            flyToLocation={flyToLocation}
          />

          {/* Floating Radius Tool Widget */}
          {radiusMode && (
            <div className="absolute top-4 left-4 z-1000">
              <GisRadiusTool
                centerCoords={radiusCenter}
                radiusKm={radiusKm}
                onRadiusChange={setRadiusKm}
                radiusData={radiusRes ?? null}
                isLoading={isRadiusLoading}
                onClose={() => setRadiusMode(false)}
                onSelectPetition={handleSelectRadiusItem}
              />
            </div>
          )}

          {/* Map Color Legend (Góc dưới bên trái) */}
          <div className="absolute bottom-6 left-4 z-1000 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200/90 shadow-md text-xs space-y-1.5 hidden sm:block">
            <span className="font-bold text-slate-800 text-[11px] uppercase block border-b border-slate-100 pb-1">
              Chú giải chuyên mục
            </span>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="text-slate-700">Vi phạm IUU / VMS</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                <span className="text-slate-700">Ô nhiễm nước</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                </span>
                <span className="text-red-700 font-bold">Quá hạn SLA / Khẩn</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-slate-700">Dịch bệnh thủy sản</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <span className="text-slate-700">Bảo vệ nguồn lợi</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                <span className="text-slate-700">Khác</span>
              </span>
            </div>
          </div>
        </div>

        {/* === SUMMARY SIDEBAR (3 COLS) === */}
        <div className="lg:col-span-3 h-[640px]">
          <GisSummarySidebar
            summary={summaryRes?.data ?? null}
            isLoading={isSummaryLoading}
            onFlyToDistrict={handleFlyToDistrict}
            selectedPetitionId={selectedFeature?.properties?.id}
          />
        </div>
      </div>
    </div>
  );
};
