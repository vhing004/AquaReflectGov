import axiosClient from './axiosClient';
import type { ApiResponse } from '../types';
import type { DashboardReport } from '../types/dashboard';

export const dashboardApi = {
  /**
   * Lấy báo cáo thống kê KPI tổng thể cho Dashboard
   * @param days Số ngày thống kê (7, 30, 90, 365, hoặc 0 là toàn bộ)
   * @param departmentId ID phòng ban cần lọc (tùy chọn)
   */
  getKpiReport: async (days: number = 30, departmentId?: string): Promise<ApiResponse<DashboardReport>> => {
    const res = await axiosClient.get<ApiResponse<DashboardReport>>('/dashboard/kpi', {
      params: {
        days,
        departmentId: departmentId || undefined,
      },
    });
    return res.data;
  },
};
