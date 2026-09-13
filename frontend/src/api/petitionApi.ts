import axiosClient from './axiosClient';
import type { ApiResponse, CreatePetitionResult } from '../types';

export const petitionApi = {
  createPetition: async (formData: FormData): Promise<ApiResponse<CreatePetitionResult>> => {
    const res = await axiosClient.post<ApiResponse<CreatePetitionResult>>('/petitions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};
