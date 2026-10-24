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
  TransitionStatusResult,
  DepartmentOfficer,
  InspectionNoteResult
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

  /**
   * Lấy danh sách cán bộ/chuyên viên thuộc phòng ban kèm chỉ số tải công việc (Workload Status)
   */
  getDepartmentOfficers: async (departmentId: string): Promise<ApiResponse<DepartmentOfficer[]>> => {
    const response = await axiosClient.get<ApiResponse<DepartmentOfficer[]>>(
      `/admin/departments/${departmentId}/officers`
    );
    return response.data;
  },

  /**
   * [Task 4.1] Bắt đầu thẩm tra thực địa: Chuyển hồ sơ Assigned → Investigating
   */
  beginInvestigation: async (
    petitionId: string,
    note?: string
  ): Promise<ApiResponse<TransitionStatusResult>> => {
    const response = await axiosClient.post<ApiResponse<TransitionStatusResult>>(
      `/admin/petitions/${petitionId}/begin-investigation`,
      { note: note ?? null }
    );
    return response.data;
  },

  /**
   * [Task 4.1] Ghi chú nghiệp vụ hiện trường kèm ảnh biên bản thực địa
   */
  addInspectionNote: async (
    petitionId: string,
    formData: FormData
  ): Promise<ApiResponse<InspectionNoteResult>> => {
    const response = await axiosClient.post<ApiResponse<InspectionNoteResult>>(
      `/admin/petitions/${petitionId}/inspection-notes`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  /**
   * Nhập hộ phản ánh kiến nghị trực tiếp / qua điện thoại / văn bản (createOnBehalf)
   */
  createOnBehalf: async (formData: FormData): Promise<ApiResponse<{ id: string; trackingCode: string; title: string; message: string }>> => {
    const response = await axiosClient.post<ApiResponse<{ id: string; trackingCode: string; title: string; message: string }>>(
      '/admin/petitions/on-behalf',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  /**
   * Trưởng đơn vị phân công thành viên trong đơn vị thụ lý hồ sơ
   */
  assignMember: async (
    petitionId: string,
    data: { assignedUserId: string; note?: string }
  ): Promise<ApiResponse<{
    petitionId: string;
    trackingCode: string;
    departmentId?: string;
    departmentName?: string;
    assignedUserId: string;
    assignedUserName: string;
    message: string;
  }>> => {
    const response = await axiosClient.post(
      `/admin/petitions/${petitionId}/assign-member`,
      data
    );
    return response.data;
  },

  /**
   * Lấy lịch sử trao đổi nội bộ của các cán bộ trong hồ sơ (Internal Thread)
   */
  getInternalThread: async (petitionId: string): Promise<ApiResponse<PetitionComment[]>> => {
    const response = await axiosClient.get<ApiResponse<PetitionComment[]>>(
      `/admin/petitions/${petitionId}/internal-thread`
    );
    return response.data;
  },
};

