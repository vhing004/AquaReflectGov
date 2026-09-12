import React, { useState } from 'react';
import { 
  Flame, 
  Anchor, 
  Droplets, 
  Navigation,
  Compass
} from 'lucide-react';

export const MapPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'iuu' | 'disease' | 'pollution'>('all');
  const [selectedHotspot, setSelectedHotspot] = useState<number | null>(0);

  const hotspots = [
    {
      id: 0,
      title: 'Tàu cá mất kết nối thiết bị VMS trên 6 giờ',
      type: 'iuu',
      code: 'QNg-90822-TS',
      location: '15°13\'45.2"N 108°52\'10.5"E (Vùng biển Sa Kỳ, Quảng Ngãi)',
      status: 'Khẩn cấp',
      statusColor: 'bg-rose-500 text-white',
      desc: 'Thiết bị giám sát hành trình bị gián đoạn tín hiệu khi đang hoạt động cách đường ranh giới biển 12 hải lý. Đã gửi cảnh báo đến Đồn Biên phòng Sa Kỳ.',
      time: '15 phút trước'
    },
    {
      id: 1,
      title: 'Ổ dịch đốm trắng & hoại tử gan tụy cấp lây lan',
      type: 'disease',
      code: 'DB-2026-08',
      location: '8°58\'12.4"N 105°10\'44.1"E (Huyện Đầm Dơi, Cà Mau)',
      status: 'Đang cách ly',
      statusColor: 'bg-amber-500 text-white',
      desc: 'Phát hiện tôm nuôi chết rải rác trên diện tích 12 hecta. Trạm Khuyến nông đã khoanh vùng khử trùng bằng Chlorine.',
      time: '2 giờ trước'
    },
    {
      id: 2,
      title: 'Xả thải gây đổi màu nước kênh cấp vùng nuôi tôm',
      type: 'pollution',
      code: 'ON-2026-15',
      location: '10°02\'30.0"N 106°35\'18.2"E (Huyện Ba Tri, Bến Tre)',
      status: 'Đã lấy mẫu',
      statusColor: 'bg-cyan-600 text-white',
      desc: 'Nguồn nước có bọt khí đen và mùi hôi nồng nặc. Đoàn thanh tra liên ngành Chi cục Thủy sản đã tiến hành lấy mẫu nước quan trắc.',
      time: '4 giờ trước'
    },
    {
      id: 3,
      title: 'Luồng lạch Cửa biển Sa Kỳ bị bồi lắng cạn 1.4m',
      type: 'pollution',
      code: 'HT-2026-03',
      location: '15°14\'10.0"N 108°51\'40.0"E (Cảng cá Sa Kỳ, Quảng Ngãi)',
      status: 'Chờ nạo vét',
      statusColor: 'bg-purple-600 text-white',
      desc: 'Tàu cá công suất trên 700CV mắc cạn khi cập bến lúc triều rút. Đã có quyết định nạo vét thông luồng khẩn cấp.',
      time: '1 ngày trước'
    }
  ];

  const filteredHotspots = hotspots.filter(
    (h) => activeFilter === 'all' || h.type === activeFilter
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold text-[#006194] uppercase tracking-wider">
            Hệ Thống Thông Tin Địa Lý GIS Thủy Sản
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Bản Đồ Số Điểm Nóng & Cảnh Báo VMS / IUU
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Giám sát trực tuyến dữ liệu không gian thời gian thực trên vùng biển 28 tỉnh thành ven biển Việt Nam.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'all'
                ? 'bg-[#006194] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Tất cả (4)
          </button>
          <button
            onClick={() => setActiveFilter('iuu')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
              activeFilter === 'iuu'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Anchor className="w-3 h-3 text-rose-500" />
            <span>Cảnh báo IUU / VMS</span>
          </button>
          <button
            onClick={() => setActiveFilter('disease')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
              activeFilter === 'disease'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Flame className="w-3 h-3 text-amber-500" />
            <span>Ổ dịch bệnh</span>
          </button>
          <button
            onClick={() => setActiveFilter('pollution')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
              activeFilter === 'pollution'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Droplets className="w-3 h-3 text-cyan-500" />
            <span>Ô nhiễm & Luồng lạch</span>
          </button>
        </div>
      </div>

      {/* Grid: 8 Cols Map Simulator, 4 Cols Active Hotspots List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* === MAP SIMULATION CONTAINER (COL-SPAN-8) === */}
        <div className="lg:col-span-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden relative min-h-[480px] flex flex-col justify-between p-6">
          {/* Radar background grid */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:32px_32px]"></div>
          
          {/* Top floating control bar */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 bg-slate-800/80 backdrop-blur-md p-3 rounded-2xl border border-slate-700 text-white text-xs">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span className="font-mono text-cyan-300">TRẠM QUAN SÁT VỆ TINH VMS-GEO-02</span>
            </div>
            <div className="flex items-center space-x-3 text-[11px] text-slate-300 font-mono">
              <span>LAT: 15.229°N</span>
              <span>LNG: 108.869°E</span>
              <span className="text-emerald-400 font-bold">● VỆ TINH TRỰC TUYẾN</span>
            </div>
          </div>

          {/* Map interactive simulated points */}
          <div className="relative z-10 my-auto py-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="flex flex-wrap items-center justify-center gap-6">
              {filteredHotspots.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedHotspot(index)}
                  className={`relative p-3.5 rounded-2xl transition-all text-left max-w-xs ${
                    selectedHotspot === index
                      ? 'bg-sky-950/90 border-2 border-cyan-400 shadow-lg shadow-cyan-500/30 scale-105'
                      : 'bg-slate-800/80 border border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between space-x-2 mb-1.5">
                    <span className="text-[10px] font-mono text-cyan-300 font-bold">{item.code}</span>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${item.statusColor}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white leading-tight line-clamp-2">{item.title}</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-1 truncate">{item.location}</p>
                </button>
              ))}
            </div>

            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-[11px] text-slate-300 backdrop-blur-xs">
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              <span>Phân hệ tích hợp bản đồ số tương tác Leaflet / PostGIS hoàn thiện ở Giai đoạn 4</span>
            </div>
          </div>

          {/* Bottom map legend */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 bg-slate-800/80 backdrop-blur-md p-3 rounded-2xl border border-slate-700 text-white text-[11px]">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>Tàu cá mất kết nối VMS</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Vùng dịch bệnh thủy sản</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                <span>Ô nhiễm nguồn nước</span>
              </span>
            </div>
            <span className="text-slate-400 font-mono text-[10px]">Cập nhật: 12/09/2026 12:45 UTC+7</span>
          </div>
        </div>

        {/* === HOTSPOT DETAILS PANEL (COL-SPAN-4) === */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-[#006194] uppercase tracking-wider">
                Chi Tiết Cảnh Báo Ngư Trường
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Telemetry
              </span>
            </div>

            {selectedHotspot !== null && filteredHotspots[selectedHotspot] ? (
              <div className="space-y-4 text-xs">
                <div>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${filteredHotspots[selectedHotspot].statusColor}`}>
                    {filteredHotspots[selectedHotspot].status}
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900 mt-2 leading-snug">
                    {filteredHotspots[selectedHotspot].title}
                  </h3>
                  <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                    Mã hồ sơ/Hiệu tàu: {filteredHotspots[selectedHotspot].code}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Tọa độ GPS hải trình</span>
                  <p className="text-slate-800 font-mono text-[11px] font-semibold">
                    {filteredHotspots[selectedHotspot].location}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Tình trạng ghi nhận</span>
                  <p className="text-slate-600 leading-relaxed text-xs">
                    {filteredHotspots[selectedHotspot].desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Thời gian: {filteredHotspots[selectedHotspot].time}</span>
                  <button
                    onClick={() => alert(`Đã phát tín hiệu cảnh báo đến đội tàu lân cận tọa độ ${filteredHotspots[selectedHotspot].code}`)}
                    className="px-3 py-1.5 rounded-xl bg-[#006194] hover:bg-[#0284c7] text-white font-bold text-xs transition-colors"
                  >
                    Phát cảnh báo vùng
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-xs py-8 text-center">
                Chọn một điểm nóng trên bản đồ để xem chi tiết tọa độ và hướng dẫn ứng phó.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
