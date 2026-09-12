import axiosClient from './axiosClient';
import type { AdministrativeUnit, ApiResponse, Category, Department } from '../types';

export const masterDataApi = {
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    const res = await axiosClient.get<ApiResponse<Category[]>>('/categories');
    return res.data;
  },

  getAdministrativeUnits: async (parentId?: number, level?: number): Promise<ApiResponse<AdministrativeUnit[]>> => {
    const res = await axiosClient.get<ApiResponse<AdministrativeUnit[]>>('/administrativeunits', {
      params: { parentId, level },
    });
    return res.data;
  },

  getDepartments: async (): Promise<ApiResponse<Department[]>> => {
    const res = await axiosClient.get<ApiResponse<Department[]>>('/departments');
    return res.data;
  },
};
