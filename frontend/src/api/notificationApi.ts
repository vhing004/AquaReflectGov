import axiosClient from './axiosClient';
import type { ApiResponse } from '../types';
import type { NotificationListResponse } from '../types/notification';

export const notificationApi = {
  /**
   * Lấy danh sách thông báo của cán bộ kèm số lượng chưa đọc
   */
  getNotifications: async (params?: { unreadOnly?: boolean; pageIndex?: number; pageSize?: number }): Promise<ApiResponse<NotificationListResponse>> => {
    const response = await axiosClient.get<ApiResponse<NotificationListResponse>>('/notifications', { params });
    return response.data;
  },

  /**
   * Đánh dấu 1 thông báo cụ thể là đã đọc
   */
  markAsRead: async (id: string): Promise<ApiResponse<boolean>> => {
    const response = await axiosClient.put<ApiResponse<boolean>>(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Đánh dấu toàn bộ thông báo của cán bộ là đã đọc
   */
  markAllAsRead: async (): Promise<ApiResponse<number>> => {
    const response = await axiosClient.put<ApiResponse<number>>('/notifications/read-all');
    return response.data;
  }
};
