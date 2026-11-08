import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { dashboardApi } from '../api/dashboardApi';
import { masterDataApi } from '../api/masterDataApi';
import { reportsApi } from '../api/reportsApi';
import {
  RotateCw,
  Calendar,
  Building2,
  Layers,
  Compass,
  FileSpreadsheet,
  FileText,
  MapPin,
  Globe,
  ExternalLink,
  ChevronDown,
  Filter,
  RotateCcw
} from 'lucide-react';
import { POST_MERGER_PROVINCES_34, VIETNAM_REGIONS } from '../data/maritimeData';

import { KpiMetricCards } from '../components/dashboard/KpiMetricCards';
import { TrendAreaChart } from '../components/dashboard/TrendAreaChart';
import { CategoryPieChart } from '../components/dashboard/CategoryPieChart';
import { DepartmentPerformanceTable } from '../components/dashboard/DepartmentPerformanceTable';
import { SatisfactionWidget } from '../components/dashboard/SatisfactionWidget';
import { hasRole, PERMISSIONS } from '../utils/permissions';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [days, setDays] = useState<number>(30);
  const isSpecialist = user?.role === 'Specialist';
  const canViewGis = hasRole(user?.role, PERMISSIONS.GIS_COMMAND_CENTER);
  const canViewAllDepts = hasRole(user?.role, PERMISSIONS.DASHBOARD_FULL);

  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    isSpecialist && user?.departmentId ? user.departmentId : ''
  );
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | undefined>(undefined);
  const [selectedRegionId, setSelectedRegionId] = useState<string>('ALL');
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const effectiveDeptId = isSpecialist ? (user?.departmentId || '') : selectedDeptId;

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      await reportsApi.exportPetitionsExcel(
        effectiveDeptId ? { departmentId: effectiveDeptId } : undefined
      );
    } finally {
      setExportingExcel(false);
    }
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      await reportsApi.exportKpiPdf(days, effectiveDeptId || undefined);
    } finally {
      setExportingPdf(false);
    }
  };

  // 1. Query danh sách phòng ban phục vụ bộ lọc
  const { data: deptsRes } = useQuery({
    queryKey: ['departments'],
    queryFn: () => masterDataApi.getDepartments(),
  });
  const departments = deptsRes?.data || [];

  // 2. Query dữ liệu Dashboard KPI
  const {
    data: reportRes,
    isLoading,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['dashboard-kpi', days, effectiveDeptId],
    queryFn: () => dashboardApi.getKpiReport(days, effectiveDeptId || undefined),
  });

  const report = reportRes?.data;

  const timeOptions = [
    { label: '7 ngày qua', value: 7 },
    { label: '30 ngày qua', value: 30 },
    { label: '90 ngày qua (Quý)', value: 90 },
    { label: 'Năm nay (365 ngày)', value: 365 },
    { label: 'Toàn bộ thời gian', value: 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. EXECUTIVE COMMAND BANNER (Theo Stitch Civic Modern) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#003c5c] via-[#006194] to-[#0284c7] text-white shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xl font-extrabold text-cyan-300 backdrop-blur-xs shrink-0 shadow-inner">
            {user?.fullName.charAt(0) || 'L'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                {isSpecialist
                  ? `Báo Cáo Hiệu Suất Thụ Lý — ${user?.departmentName || 'Phòng Ban'}`
                  : 'Trung Tâm Chỉ Huy & Giám Sát Điều Hành KPI'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {user?.roleName || 'Cán Bộ'}
              </span>
            </div>
            <p className="text-xs text-sky-100 mt-1">
              {isSpecialist
                ? 'Theo dõi chỉ số giải quyết hồ sơ và mức độ hài lòng của công dân đối với phòng ban phụ trách'
                : 'Hệ thống giám sát chỉ số cam kết SLA và mức độ hài lòng dịch vụ công thủy sản trên 34 Tỉnh/Thành phố sau sáp nhập'}
            </p>
          </div>
        </div>

        {/* Quick Navigation Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {canViewGis && (
            <Link
              to="/admin/gis-map"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 text-white backdrop-blur-xs transition-all border border-white/20 hover:scale-[1.02]"
            >
              <Compass className="w-4 h-4 text-cyan-300" />
              <span>Bản Đồ Số GIS</span>
            </Link>
          )}

          <Link
            to="/admin/petitions"
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-[#006194] hover:bg-sky-50 shadow-md transition-all hover:scale-[1.02]"
          >
            <Layers className="w-4 h-4" />
            <span>Hồ Sơ Nghiệp Vụ</span>
          </Link>
        </div>
      </div>

      {/* 2. FILTER & TIME RANGE TOOLBAR */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* TẦNG 1: THỜI GIAN & HÀNH ĐỘNG XUẤT BÁO CÁO */}
        <div className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100">
          {/* Mốc thời gian */}
          <div className="flex items-center flex-wrap gap-1.5">
            <div className="flex items-center space-x-1.5 mr-2 text-slate-400 shrink-0">
              <Calendar className="w-4 h-4 text-[#006194]" />
              <span className="text-xs font-bold text-slate-700">Khung thời gian:</span>
            </div>
            {timeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDays(opt.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  days === opt.value
                    ? 'bg-[#006194] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Các nút hành động xuất báo cáo & làm mới */}
          <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
            <button
              onClick={handleExportExcel}
              disabled={exportingExcel}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all disabled:opacity-60 shadow-xs whitespace-nowrap cursor-pointer"
              title={isSpecialist ? "Xuất danh sách phản ánh phòng ban ra Excel" : "Xuất danh sách phản ánh ra Excel"}
            >
              <FileSpreadsheet className={`w-4 h-4 shrink-0 ${exportingExcel ? 'animate-pulse' : ''}`} />
              <span>{exportingExcel ? 'Đang xuất...' : (isSpecialist ? 'Xuất Excel Phòng Ban' : 'Xuất Excel')}</span>
            </button>

            <button
              onClick={handleExportPdf}
              disabled={exportingPdf}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all disabled:opacity-60 shadow-xs whitespace-nowrap cursor-pointer"
              title={isSpecialist ? "Xuất báo cáo KPI phòng ban ra PDF" : "Xuất báo cáo KPI ra PDF"}
            >
              <FileText className={`w-4 h-4 shrink-0 ${exportingPdf ? 'animate-pulse' : ''}`} />
              <span>{exportingPdf ? 'Đang xuất...' : (isSpecialist ? 'Xuất PDF Phòng Ban' : 'Xuất PDF KPI')}</span>
            </button>

            <button
              onClick={() => refetch()}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Làm mới số liệu thống kê"
            >
              <RotateCw className={`w-4 h-4 shrink-0 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* TẦNG 2: BỘ LỌC ĐỊA BÀN & PHÒNG BAN CHUYÊN SÂU */}
        <div className="px-4 py-3 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5 flex-grow">
            <div className="flex items-center space-x-1.5 text-slate-500 font-bold mr-1 shrink-0">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Phân loại:</span>
            </div>

            {/* Phòng ban */}
            {canViewAllDepts ? (
              <div className="relative flex items-center bg-white rounded-xl border border-slate-200/90 shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="appearance-none bg-transparent pl-8.5 pr-8 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer w-full"
                >
                  <option value="">Tất cả phòng ban ({departments.length})</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200 text-sky-800 text-xs font-bold">
                <Building2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>{user?.departmentName || 'Phòng ban chuyên môn'}</span>
              </div>
            )}

            {/* Vùng miền */}
            <div className="relative flex items-center bg-white rounded-xl border border-slate-200/90 shadow-2xs">
              <Globe className="w-3.5 h-3.5 text-[#006194] absolute left-3 pointer-events-none" />
              <select
                value={selectedRegionId}
                onChange={(e) => {
                  setSelectedRegionId(e.target.value);
                  setSelectedProvinceId(undefined);
                }}
                className="appearance-none bg-transparent pl-8.5 pr-8 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer w-full"
              >
                {VIETNAM_REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
            </div>

            {/* 34 Tỉnh thành */}
            <div className="relative flex items-center bg-white rounded-xl border border-slate-200/90 shadow-2xs max-w-xs">
              <MapPin className="w-3.5 h-3.5 text-rose-500 absolute left-3 pointer-events-none" />
              <select
                value={selectedProvinceId || ''}
                onChange={(e) => setSelectedProvinceId(e.target.value ? Number(e.target.value) : undefined)}
                className="appearance-none bg-transparent pl-8.5 pr-8 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer truncate max-w-[260px]"
              >
                <option value="">Toàn bộ tỉnh/thành (34 tỉnh)</option>
                {['Thành phố Trực thuộc Trung ương', 'Miền Bắc và Trung du, ĐBSH', 'Miền Trung và Tây Nguyên', 'Miền Nam'].map((reg) => {
                  const inGroup = POST_MERGER_PROVINCES_34.filter((p) => {
                    if (selectedRegionId === 'CENTRAL_CITIES' && p.region !== 'Thành phố Trực thuộc Trung ương') return false;
                    if (selectedRegionId === 'NORTH' && p.region !== 'Miền Bắc và Trung du, ĐBSH') return false;
                    if (selectedRegionId === 'CENTRAL' && p.region !== 'Miền Trung và Tây Nguyên') return false;
                    if (selectedRegionId === 'SOUTH' && p.region !== 'Miền Nam') return false;
                    return p.region === reg;
                  });
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
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Nút đặt lại khi có lọc tỉnh/vùng hoặc phòng ban */}
          {(selectedProvinceId !== undefined || selectedRegionId !== 'ALL' || (canViewAllDepts && selectedDeptId !== '')) && (
            <button
              onClick={() => {
                setSelectedRegionId('ALL');
                setSelectedProvinceId(undefined);
                if (canViewAllDepts) setSelectedDeptId('');
              }}
              className="flex items-center space-x-1 text-slate-500 hover:text-rose-600 font-semibold px-2 py-1 rounded-lg hover:bg-slate-200/60 transition-colors shrink-0 cursor-pointer"
              title="Đặt lại toàn bộ bộ lọc địa bàn và phòng ban"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Đặt lại bộ lọc</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. CORE KPI METRIC CARDS */}
      {report && (
        <KpiMetricCards
          kpi={report.kpiSummary}
          satisfaction={report.satisfaction}
          isLoading={isLoading}
        />
      )}

      {/* 4. CHARTS SECTION (8 COLS TREND AREA + 4 COLS CATEGORY PIE) */}
      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8">
            <TrendAreaChart data={report.trendData} days={days} />
          </div>
          <div className="lg:col-span-4">
            <CategoryPieChart data={report.categoryDistribution} />
          </div>
        </div>
      )}

      {/* 5. DEPARTMENT PERFORMANCE SLA TABLE */}
      {report && (
        <DepartmentPerformanceTable
          data={report.departmentPerformance}
          onSelectDepartment={(deptId) => setSelectedDeptId(deptId)}
        />
      )}

      {/* 6. CITIZEN SATISFACTION (CSAT) WIDGET */}
      {report && (
        <SatisfactionWidget data={report.satisfaction} />
      )}

      {/* 7. REGIONAL DISTRIBUTION SUMMARY SECTION (34 TỈNH SAU SÁP NHẬP) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-[#006194] flex items-center justify-center font-bold shadow-2xs">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Phân Bố & Giám Sát Địa Bàn 34 Tỉnh/Thành Phố Sau Sáp Nhập
              </h3>
              <p className="text-xs text-slate-500">
                Khung chỉ huy không gian toàn quốc phục vụ tiếp nhận, thẩm tra & điều phối xử lý sự cố môi trường nước, thủy hải sản
              </p>
            </div>
          </div>

          <Link
            to="/admin/gis-map"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#006194] hover:bg-[#0284c7] text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span>Mở Bản Đồ Chỉ Huy GIS</span>
            <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>

        {/* 4 Cards tóm tắt 4 vùng miền lớn */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Thành phố Trực thuộc TW',
              count: 6,
              badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
              description: 'Hà Nội, TP.HCM, Đà Nẵng, Hải Phòng, Cần Thơ, Huế',
              regionKey: 'CENTRAL_CITIES',
            },
            {
              title: 'Miền Bắc & ĐBSH',
              count: 13,
              badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
              description: 'Quảng Ninh, Ninh Bình, Bắc Ninh, Hưng Yên, Lào Cai, Thái Nguyên...',
              regionKey: 'NORTH',
            },
            {
              title: 'Miền Trung & Tây Nguyên',
              count: 9,
              badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
              description: 'Quảng Ngãi (Trọng điểm), Khánh Hòa, Gia Lai, Lâm Đồng, Đắk Lắk...',
              regionKey: 'CENTRAL',
            },
            {
              title: 'Miền Nam',
              count: 6,
              badgeColor: 'bg-sky-50 text-sky-800 border-sky-200',
              description: 'Cà Mau, An Giang, Đồng Tháp, Vĩnh Long, Đồng Nai, Tây Ninh',
              regionKey: 'SOUTH',
            },
          ].map((item) => (
            <div
              key={item.regionKey}
              onClick={() => {
                setSelectedRegionId(item.regionKey);
                setSelectedProvinceId(undefined);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedRegionId === item.regionKey
                  ? 'border-[#006194] bg-sky-50/50 shadow-sm scale-[1.01]'
                  : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-800">{item.title}</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                  {item.count} ĐVHC
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
              <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-[#006194]">
                <span>{selectedRegionId === item.regionKey ? '✓ Đang lọc vùng này' : 'Bấm để lọc vùng'}</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
