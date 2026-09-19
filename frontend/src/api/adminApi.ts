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
};
