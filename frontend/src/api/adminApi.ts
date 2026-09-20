import axiosClient from './axiosClient';
import type { 
  AdminPetitionFilterParams, 
  AdminPetitionItem, 
  AdminPetitionDetail,
  PetitionResolution,
  PetitionComment,
  ApiResponse, 
  PaginatedResult,
  AllowedTransition,
  TransitionStatusRequest,
  TransitionStatusResult
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
   * Lấy chi tiết toàn diện hồ sơ nghiệp vụ cán bộ
   */
  getPetitionDetail: async (id: string): Promise<ApiResponse<AdminPetitionDetail>> => {
    const response = await axiosClient.get<ApiResponse<AdminPetitionDetail>>(`/admin/petitions/${id}`);
    return response.data;
  },

  /**
   * Lấy danh sách trạng thái tiếp theo hợp lệ mà cán bộ hiện tại có thể chuyển
   */
  getAllowedTransitions: async (petitionId: string): Promise<ApiResponse<AllowedTransition[]>> => {
    const response = await axiosClient.get<ApiResponse<AllowedTransition[]>>(
      `/admin/petitions/${petitionId}/allowed-transitions`
    );
    return response.data;
  },

  /**
   * Chuyển trạng thái hồ sơ theo State Machine & ghi vết Audit Trail
   */
  transitionStatus: async (
    petitionId: string,
    data: TransitionStatusRequest
  ): Promise<ApiResponse<TransitionStatusResult>> => {
    const response = await axiosClient.post<ApiResponse<TransitionStatusResult>>(
      `/admin/petitions/${petitionId}/transition`,
      data
    );
    return response.data;
  },

  /**
   * Ban hành kết luận giải quyết chính thức kèm tệp văn bản có dấu đỏ
   */
  updateResolution: async (
    petitionId: string,
    formData: FormData
  ): Promise<ApiResponse<PetitionResolution>> => {
    const response = await axiosClient.post<ApiResponse<PetitionResolution>>(
      `/admin/petitions/${petitionId}/resolution`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Thêm ghi chú nghiệp vụ / trao đổi nội bộ giữa các cán bộ
   */
  addComment: async (
    petitionId: string,
    content: string
  ): Promise<ApiResponse<PetitionComment>> => {
    const response = await axiosClient.post<ApiResponse<PetitionComment>>(
      `/admin/petitions/${petitionId}/comments`,
      { content }
    );
    return response.data;
  },
};
