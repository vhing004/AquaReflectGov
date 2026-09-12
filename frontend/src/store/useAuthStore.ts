import { create } from 'zustand';
import type { AuthResponse, UserInfo } from '../types';
import { authApi } from '../api/authApi';

interface AuthState {
  user: UserInfo | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (data: AuthResponse) => void;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: true,

  setAuth: (data: AuthResponse) => {
    localStorage.setItem('access_token', data.accessToken);
    localStorage.setItem('refresh_token', data.refreshToken);
    localStorage.setItem('user_info', JSON.stringify(data.user));

    set({
      user: data.user,
      token: data.accessToken,
      refreshToken: data.refreshToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');

    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  initialize: async () => {
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user_info');

    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }

    if (savedUser) {
      try {
        set({ user: JSON.parse(savedUser), isAuthenticated: true });
      } catch {
        // ignore parse error
      }
    }

    try {
      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        localStorage.setItem('user_info', JSON.stringify(response.data));
        set({ user: response.data, isAuthenticated: true, isLoading: false });
      }
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
      set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
