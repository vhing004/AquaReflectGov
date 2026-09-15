import axiosClient from './axiosClient';
import type { 
  ApiResponse, 
  CreatePetitionResult, 
  PetitionTrackingDetail, 
  PetitionSummary,
  SubmitFeedbackResult
} from '../types';

export const petitionApi = {
  createPetition: async (formData: FormData): Promise<ApiResponse<CreatePetitionResult>> => {
    const res = await axiosClient.post<ApiResponse<CreatePetitionResult>>('/petitions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  trackPetition: async (trackingCode: string, phone?: string): Promise<ApiResponse<PetitionTrackingDetail>> => {
    const res = await axiosClient.get<ApiResponse<PetitionTrackingDetail>>(
      `/petitions/track/${encodeURIComponent(trackingCode.trim())}`,
      {
        params: phone ? { phone: phone.trim() } : undefined,
      }
    );
    return res.data;
  },

  getPetitionsByPhone: async (phone: string): Promise<ApiResponse<PetitionSummary[]>> => {
    const res = await axiosClient.get<ApiResponse<PetitionSummary[]>>('/petitions/by-phone', {
      params: { phone: phone.trim() },
    });
    return res.data;
  },

  submitFeedback: async (
    trackingCode: string,
    rating: number,
    comment?: string
  ): Promise<ApiResponse<SubmitFeedbackResult>> => {
    const res = await axiosClient.post<ApiResponse<SubmitFeedbackResult>>(
      `/petitions/${encodeURIComponent(trackingCode.trim())}/feedback`,
      { rating, comment }
    );
    return res.data;
  },
};
