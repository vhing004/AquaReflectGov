import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import type { CategoryStatItem } from '../../types/dashboard';

interface CategoryPieChartProps {
  data: CategoryStatItem[];
}

const CATEGORY_COLORS: Record<string, string> = {
  IUUFishing: '#ef4444',          // Đỏ
  IuuFishing: '#ef4444',
  WaterPollution: '#0284c7',      // Xanh dương
  AquaticDisease: '#f59e0b',      // Cam
  AquacultureDisease: '#f59e0b',
  SeedAndFeedQuality: '#10b981',  // Xanh lá
  FisheryInfrastructure: '#8b5cf6', // Tím
  AdministrativeProcedure: '#ec4899', // Hồng
  Other: '#64748b',               // Xám
};

const DEFAULT_COLOR_PALETTE = ['#0284c7', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899', '#64748b'];

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  const chartData = data.map((item, index) => ({
    name: item.categoryName,
    value: item.count,
    percentage: item.percentage,
    type: item.categoryType,
    color: CATEGORY_COLORS[item.categoryType] || DEFAULT_COLOR_PALETTE[index % DEFAULT_COLOR_PALETTE.length],
  }));

  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4 h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
              Cơ Cấu Sự Cố Thủy Sản
            </h3>
            <p className="text-[11px] text-slate-500">Phân bố tỷ trọng theo chuyên mục</p>
          </div>
        </div>
        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl">
          {totalCount} phản ánh
        </span>
      </div>

      {/* Donut Chart */}
      <div className="h-64 w-full relative flex items-center justify-center">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any, item: any) => [
                  `${value} hồ sơ (${item.payload.percentage}%)`,
                  name,
                ]}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '1rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontSize: '11px',
                  padding: '8px 12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-slate-400 text-xs">
            Chưa có dữ liệu chuyên mục
          </div>
        )}

        {/* Center label in Donut hole */}
        {chartData.length > 0 && (
          <div className="absolute pointer-events-none text-center">
            <span className="text-2xl font-black text-slate-800">{totalCount}</span>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Đơn ghi nhận</span>
          </div>
        )}
      </div>

      {/* Custom Clean Legend */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100 max-h-36 overflow-y-auto custom-scrollbar pr-1">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 truncate max-w-[200px]">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
              <span className="text-slate-700 truncate text-[11px]" title={item.name}>{item.name}</span>
            </div>
            <span className="font-mono font-bold text-slate-900 text-[11px]">
              {item.value} ({item.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
