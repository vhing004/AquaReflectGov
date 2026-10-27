import type { AxiosProgressEvent } from 'axios';
import axiosClient from './axiosClient';
import type { 
  ApiResponse, 
  CreatePetitionResult, 
  PetitionTrackingDetail, 
  PetitionSummary,
  SubmitFeedbackResult,
  PublicResolvedPetition,
  WithdrawPetitionResult,
  SubmitAdditionalInfoResult,
  PublicComment
} from '../types';

export const petitionApi = {
  createPetition: async (
    formData: FormData, 
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<ApiResponse<CreatePetitionResult>> => {
    const res = await axiosClient.post<ApiResponse<CreatePetitionResult>>('/petitions', formData, {
      onUploadProgress,
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

  addPublicComment: async (
    trackingCode: string,
    content: string
  ): Promise<ApiResponse<PublicComment>> => {
    const res = await axiosClient.post<ApiResponse<PublicComment>>(
      `/petitions/${encodeURIComponent(trackingCode.trim())}/comments`,
      { content: content.trim() }
    );
    return res.data;
  },

  withdrawPetition: async (
    trackingCode: string,
    accessPin?: string,
    reason?: string
  ): Promise<ApiResponse<WithdrawPetitionResult>> => {
    const res = await axiosClient.post<ApiResponse<WithdrawPetitionResult>>(
      `/petitions/${encodeURIComponent(trackingCode.trim())}/withdraw`,
      { accessPin, reason }
    );
    return res.data;
  },

  submitAdditionalInfo: async (
    trackingCode: string,
    formData: FormData
  ): Promise<ApiResponse<SubmitAdditionalInfoResult>> => {
    const res = await axiosClient.post<ApiResponse<SubmitAdditionalInfoResult>>(
      `/petitions/${encodeURIComponent(trackingCode.trim())}/additional-info`,
      formData
    );
    return res.data;
  },

  getPublicResolvedPetitions: async (
    categoryCode?: string,
    sortBy: string = 'latest',
    limit: number = 6,
    keyword?: string,
    page?: number,
    pageSize?: number
  ): Promise<ApiResponse<PublicResolvedPetition[]>> => {
    const res = await axiosClient.get<ApiResponse<PublicResolvedPetition[]>>(
      '/petitions/public-resolved',
      {
        params: {
          ...(categoryCode ? { categoryCode } : {}),
          ...(keyword ? { keyword } : {}),
          ...(page ? { page } : {}),
          ...(pageSize ? { pageSize } : {}),
          sortBy,
          limit,
        },
      }
    );
    return res.data;
  },

  getCsat: async (trackingCode: string): Promise<ApiResponse<import('../types').CsatInfo>> => {
    const res = await axiosClient.get<ApiResponse<import('../types').CsatInfo>>(
      `/petitions/${encodeURIComponent(trackingCode.trim())}/csat`
    );
    return res.data;
  },

  requestReopen: async (
    trackingCode: string,
    reason: string,
    accessPin?: string
  ): Promise<ApiResponse<{ petitionId: string; trackingCode: string; message: string; requestedAt: string }>> => {
    const res = await axiosClient.post<ApiResponse<{ petitionId: string; trackingCode: string; message: string; requestedAt: string }>>(
      `/petitions/${encodeURIComponent(trackingCode.trim())}/reopen`,
      { reason, accessPin }
    );
    return res.data;
  },
};
