import axiosClient from './axiosClient';
import type { ApiResponse, AuthResponse, UserInfo } from '../types';

export interface LoginPayload {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  confirmPassword: string;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<ApiResponse<AuthResponse>> => {
    const res = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    return res.data;
  },

  register: async (payload: RegisterPayload): Promise<ApiResponse<AuthResponse>> => {
    const res = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/register', payload);
    return res.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<UserInfo>> => {
    const res = await axiosClient.get<ApiResponse<UserInfo>>('/auth/me');
    return res.data;
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse<AuthResponse>> => {
    const res = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/refresh-token', { refreshToken });
    return res.data;
  },

  changePassword: async (currentPassword: string, newPassword: string, confirmNewPassword: string): Promise<ApiResponse<boolean>> => {
    const res = await axiosClient.post<ApiResponse<boolean>>('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmNewPassword,
    });
    return res.data;
  },
};
