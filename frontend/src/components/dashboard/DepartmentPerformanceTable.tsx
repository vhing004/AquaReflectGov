import React from 'react';
import { Building2, AlertTriangle } from 'lucide-react';
import type { DepartmentPerformance } from '../../types/dashboard';

interface DepartmentPerformanceTableProps {
  data: DepartmentPerformance[];
  onSelectDepartment?: (deptId: string) => void;
}

export const DepartmentPerformanceTable: React.FC<DepartmentPerformanceTableProps> = ({
  data,
  onSelectDepartment,
}) => {
  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#006194] flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
              Đánh Giá Năng Lực Xử Lý Theo Phòng Ban (SLA Performance)
            </h3>
            <p className="text-[11px] text-slate-500">
              Xếp hạng hiệu quả tiếp nhận, thẩm tra thực địa và cam kết hạn định dịch vụ công
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Đơn vị chuyên môn</th>
              <th className="py-3 px-4 text-center">Tổng giao</th>
              <th className="py-3 px-4 text-center">Đang xử lý</th>
              <th className="py-3 px-4 text-center">Đã giải quyết</th>
              <th className="py-3 px-4 text-center">Quá hạn SLA</th>
              <th className="py-3 px-4">Tỷ lệ đúng hạn (%)</th>
              <th className="py-3 px-4 text-right">TB giải quyết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length > 0 ? (
              data.map((dept) => (
                <tr 
                  key={dept.departmentId}
                  onClick={() => onSelectDepartment?.(dept.departmentId)}
                  className="hover:bg-sky-50/40 transition-colors cursor-pointer group"
                >
                  {/* Department Name & Code */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {dept.departmentCode}
                      </span>
                      <p className="font-bold text-slate-900 group-hover:text-[#006194] transition-colors text-xs">
                        {dept.departmentName}
                      </p>
                    </div>
                  </td>

                  {/* Total Assigned */}
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                    {dept.totalAssigned}
                  </td>

                  {/* In Progress */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                      {dept.inProgressCount}
                    </span>
                  </td>

                  {/* Resolved */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {dept.resolvedCount}
                    </span>
                  </td>

                  {/* Overdue */}
                  <td className="py-3.5 px-4 text-center">
                    {dept.overdueCount > 0 ? (
                      <span className="inline-flex items-center space-x-1 font-mono font-extrabold text-red-700 bg-red-100 px-2 py-0.5 rounded animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                        <span>{dept.overdueCount}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono">0</span>
                    )}
                  </td>

                  {/* On-Time Rate with Progress Bar */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1 max-w-[140px]">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className={dept.onTimeRate >= 90 ? 'text-emerald-700' : dept.onTimeRate >= 75 ? 'text-amber-700' : 'text-rose-700'}>
                          {dept.onTimeRate}%
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {dept.onTimeResolvedCount}/{dept.resolvedCount}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            dept.onTimeRate >= 90 ? 'bg-emerald-500' : dept.onTimeRate >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(dept.onTimeRate, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Average Hours */}
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-700">
                    {dept.averageResolutionHours > 0 ? `${dept.averageResolutionHours}h` : '—'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  Chưa có dữ liệu phân công phòng ban.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
