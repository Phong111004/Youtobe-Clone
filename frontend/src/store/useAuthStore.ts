import { create } from 'zustand';
import api from '../services/api';

interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  subscribedChannels?: string[];
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true, // Mặc định là true để chờ check auth khi load trang
  error: null,

  setUser: (user) => set({ user }),

  checkAuth: async () => {
    try {
      set({ isLoading: true, error: null });
      const res = await api.get('/auth/me');
      set({ user: res.data, isLoading: false });
    } catch (error: any) {
      set({ user: null, isLoading: false, error: error.response?.data?.message || 'Not authenticated' });
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
      set({ user: null });
    } catch (error) {
      console.error('Logout failed', error);
    }
  },
}));
