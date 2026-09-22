import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { dashboardApi } from '../api/dashboardApi';
import { masterDataApi } from '../api/masterDataApi';
import { 
  RotateCw, 
  Calendar, 
  Building2, 
  Layers, 
  Compass
} from 'lucide-react';

import { KpiMetricCards } from '../components/dashboard/KpiMetricCards';
import { TrendAreaChart } from '../components/dashboard/TrendAreaChart';
import { CategoryPieChart } from '../components/dashboard/CategoryPieChart';
import { DepartmentPerformanceTable } from '../components/dashboard/DepartmentPerformanceTable';
import { SatisfactionWidget } from '../components/dashboard/SatisfactionWidget';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [days, setDays] = useState<number>(30);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');

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
    queryKey: ['dashboard-kpi', days, selectedDeptId],
    queryFn: () => dashboardApi.getKpiReport(days, selectedDeptId),
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
                Trung Tâm Chỉ Huy & Giám Sát Điều Hành KPI
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {user?.roleName || 'Điều Phối Viên'}
              </span>
            </div>
            <p className="text-xs text-sky-100 mt-1">
              Hệ thống giám sát chỉ số cam kết SLA và mức độ hài lòng dịch vụ công thủy sản tỉnh Cà Mau
            </p>
          </div>
        </div>

        {/* Quick Navigation Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to="/admin/gis-map"
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 text-white backdrop-blur-xs transition-all border border-white/20 hover:scale-[1.02]"
          >
            <Compass className="w-4 h-4 text-cyan-300" />
            <span>Bản Đồ Số GIS</span>
          </Link>

          <Link
            to="/admin/petitions"
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-[#006194] hover:bg-sky-50 shadow-md transition-all hover:scale-[1.02]"
          >
            <Layers className="w-4 h-4" />
            <span>Bảng Điều Phối Kanban</span>
          </Link>
        </div>
      </div>

      {/* 2. FILTER & TIME RANGE TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        {/* Time Selector */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
          {timeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                days === opt.value
                  ? 'bg-[#006194] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Department Filter & Refresh Button */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="">Tất cả phòng ban ({departments.length})</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Làm mới số liệu thống kê"
          >
            <RotateCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
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
    </div>
  );
};
