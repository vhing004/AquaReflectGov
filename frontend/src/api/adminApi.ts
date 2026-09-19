import axiosClient from './axiosClient';
import type { 
  AdminPetitionFilterParams, 
  AdminPetitionItem, 
  ApiResponse, 
  PaginatedResult 
} from '../types';

export const adminApi = {
  /**
   * Lấy danh sách hồ sơ phản ánh dành cho Cán bộ với phân trang và lọc đa tiêu chí
   */
  getPetitions: async (params?: AdminPetitionFilterParams): Promise<ApiResponse<PaginatedResult<AdminPetitionItem>>> => {
    const cleanParams: Record<string, unknown> = {};

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanParams[key] = value;
        }
      });
    }

    const response = await axiosClient.get<ApiResponse<PaginatedResult<AdminPetitionItem>>>('/admin/petitions', {
      params: cleanParams,
    });
    return response.data;
  },

  /**
   * Lấy danh sách trạng thái tiếp theo hợp lệ mà cán bộ hiện tại có thể chuyển
   */
  getAllowedTransitions: async (petitionId: string): Promise<ApiResponse<import('../types').AllowedTransition[]>> => {
    const response = await axiosClient.get<ApiResponse<import('../types').AllowedTransition[]>>(
      `/admin/petitions/${petitionId}/allowed-transitions`
    );
    return response.data;
  },

  /**
   * Chuyển trạng thái hồ sơ theo State Machine & ghi vết Audit Trail
   */
  transitionStatus: async (
    petitionId: string,
    data: import('../types').TransitionStatusRequest
  ): Promise<ApiResponse<import('../types').TransitionStatusResult>> => {
    const response = await axiosClient.post<ApiResponse<import('../types').TransitionStatusResult>>(
      `/admin/petitions/${petitionId}/transition`,
      data
    );
    return response.data;
  },
};
