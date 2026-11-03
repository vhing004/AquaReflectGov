import axiosClient from './axiosClient';
import type { ApiResponse, AuthResponse, UserInfo } from '../types';

/**
 * Khuôn mẫu dữ liệu gửi lên khi Đăng nhập
 */
export interface LoginPayload {
  usernameOrEmail: string; // Tên đăng nhập hoặc địa chỉ email
  password: string;        // Mật khẩu người dùng
}

/**
 * Khuôn mẫu dữ liệu gửi lên khi Đăng ký tài khoản công dân mới
 */
export interface RegisterPayload {
  username: string;         // Tên tài khoản mong muốn
  fullName: string;         // Họ và tên đầy đủ
  email: string;            // Email nhận thông báo biên nhận
  phoneNumber?: string;     // Số điện thoại liên hệ (tùy chọn)
  password: string;         // Mật khẩu đăng nhập
  confirmPassword: string;  // Nhập lại mật khẩu để xác nhận trùng khớp
}

/**
 * Tập hợp các hàm gọi API Xác thực & Tài khoản (Gốc URL: /api/v1/auth)
 */
export const authApi = {
  /**
   * Đăng nhập hệ thống (Dành cho cả Cán bộ và Công dân)
   * Địa chỉ gọi: POST /api/v1/auth/login
   * @param payload Thông tin gồm usernameOrEmail và password
   * @returns Token truy cập (JWT), Refresh Token và thông tin cơ bản của User
   */
  login: async (payload: LoginPayload): Promise<ApiResponse<AuthResponse>> => {
    const res = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    return res.data;
  },

  /**
   * Đăng ký tài khoản công dân mới trên Cổng Dịch vụ công
   * Địa chỉ gọi: POST /api/v1/auth/register
   * @param payload Thông tin đăng ký đầy đủ
   * @returns Tự động đăng nhập và trả về Token sau khi đăng ký thành công
   */
  register: async (payload: RegisterPayload): Promise<ApiResponse<AuthResponse>> => {
    const res = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/register', payload);
    return res.data;
  },

  /**
   * Lấy thông tin chi tiết của người dùng đang đăng nhập hiện tại ("Tôi là ai?")
   * Địa chỉ gọi: GET /api/v1/auth/me (Yêu cầu phải có Access Token trong Header)
   * @returns Thông tin User: ID, Họ tên, Quyền hạn (Role), Phòng ban, Email, Số điện thoại
   */
  getCurrentUser: async (): Promise<ApiResponse<UserInfo>> => {
    const res = await axiosClient.get<ApiResponse<UserInfo>>('/auth/me');
    return res.data;
  },

  /**
   * Cấp lại Access Token mới khi thẻ Token cũ đã hết hạn (1440 phút)
   * Địa chỉ gọi: POST /api/v1/auth/refresh-token
   * @param refreshToken Mã làm mới đang lưu trong localStorage
   * @returns Cặp Access Token và Refresh Token mới
   */
  refreshToken: async (refreshToken: string): Promise<ApiResponse<AuthResponse>> => {
    const res = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/refresh-token', { refreshToken });
    return res.data;
  },

  /**
   * Đổi mật khẩu tài khoản
   * Địa chỉ gọi: POST /api/v1/auth/change-password
   * @param currentPassword Mật khẩu hiện tại đang dùng
   * @param newPassword Mật khẩu mới muốn đổi
   * @param confirmNewPassword Xác nhận lại mật khẩu mới
   * @returns true nếu đổi mật khẩu thành công
   */
  changePassword: async (currentPassword: string, newPassword: string, confirmNewPassword: string): Promise<ApiResponse<boolean>> => {
    const res = await axiosClient.post<ApiResponse<boolean>>('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmNewPassword,
    });
    return res.data;
  },
};

