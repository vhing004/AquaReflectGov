import axiosClient from './axiosClient';
import type { CreateUserRequest, UpdateUserRequest } from '../types';

// Tham so loc danh sach nguoi dung
interface GetUsersParams {
  keyword?: string;
  role?: number;
  departmentId?: string;
  isActive?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

// Tham so loc danh sach ho so cua can bo
interface GetUserPetitionsParams {
  filterType?: 'resolved' | 'active' | 'all';
  pageNumber?: number;
  pageSize?: number;
}

export const usersApi = {
  // Lay danh sach nguoi dung (co phan trang va loc)
  getUsers: (params: GetUsersParams) =>
    axiosClient.get('/users', { params }),

  // Lay danh sach ho so cua mot can bo thu ly
  getUserPetitions: (id: string, params: GetUserPetitionsParams) =>
    axiosClient.get(`/users/${id}/petitions`, { params }),

  // Tao moi nguoi dung
  createUser: (data: CreateUserRequest) =>
    axiosClient.post('/users', data),

  // Cap nhat thong tin nguoi dung
  updateUser: (id: string, data: UpdateUserRequest) =>
    axiosClient.put(`/users/${id}`, data),

  // Khoa / Mo khoa tai khoan
  toggleActive: (id: string) =>
    axiosClient.post(`/users/${id}/toggle-active`),
};

