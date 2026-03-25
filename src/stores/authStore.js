import { create } from 'zustand';
import api from '../lib/api';
import usePlayerStore from './playerStore';

const parseError = (error, defaultMessage) => {
  let message = defaultMessage;
  if (error.response?.data) {
    if (error.response.data.detail) {
      message = error.response.data.detail;
    } else if (error.response.data.error) {
      message = error.response.data.error;
    } else if (error.response.data.message) {
      message = error.response.data.message;
    } else {
      message = Object.entries(error.response.data)
        .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : val}`)
        .join(' | ');
    }
  }
  return message;
};

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: localStorage.getItem('tunora_access_token') || null,
  refreshToken: localStorage.getItem('tunora_refresh_token') || null,
  isAuthenticated: !!localStorage.getItem('tunora_access_token'),
  isLoading: false,
  error: null,

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('auth/register/', payload);
      set({ isLoading: false });
      return data;
    } catch (error) {
      const message = parseError(error, 'Registration failed');
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  verifyOtp: async ({ email, otp }) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('auth/verify-otp/', { email, otp });
      set({ isLoading: false });
      return data;
    } catch (error) {
      const message = parseError(error, 'Invalid OTP code');
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  resendOtp: async ({ email }) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('auth/resend-otp/', { email });
      set({ isLoading: false });
      return data;
    } catch (error) {
      const message = parseError(error, 'Failed to resend OTP');
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  login: async ({ email, password }) => {
    set({ isLoading: true, error: null });
    try {
      const { data, status } = await api.post('auth/login/', { email, password });

      if (status === 202 && data.requires_otp) {
        set({ isLoading: false });
        return data; // Return to UI to show OTP field
      }

      localStorage.setItem('tunora_access_token', data.tokens.access);
      localStorage.setItem('tunora_refresh_token', data.tokens.refresh);

      set({
        user: data.user,
        accessToken: data.tokens.access,
        refreshToken: data.tokens.refresh,
        isAuthenticated: true,
        isLoading: false,
      });

      return data;
    } catch (error) {
      const message = parseError(error, 'Invalid credentials');
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  verifyAdminOtp: async ({ email, otp }) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('auth/verify-admin-otp/', { email, otp });

      localStorage.setItem('tunora_access_token', data.tokens.access);
      localStorage.setItem('tunora_refresh_token', data.tokens.refresh);

      set({
        user: data.user,
        accessToken: data.tokens.access,
        refreshToken: data.tokens.refresh,
        isAuthenticated: true,
        isLoading: false,
      });

      return data;
    } catch (error) {
      const message = parseError(error, 'Invalid admin OTP code');
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      const refreshToken = get().refreshToken;
      if (refreshToken) {
        await api.post('auth/logout/', { refresh: refreshToken });
      }
    } catch {
      // Best-effort logout
    } finally {
      // Clear player state on logout
      usePlayerStore.getState().reset();
      
      localStorage.removeItem('tunora_access_token');
      localStorage.removeItem('tunora_refresh_token');
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  fetchMe: async () => {
    if (!get().accessToken) return;
    set({ isLoading: true });
    try {
      const { data } = await api.get('auth/me/');
      set({ user: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  updateOnboarding: async ({ favourite_genres, favourite_moods, favourite_artists }) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.patch('auth/onboarding/', {
        favourite_genres,
        favourite_moods,
        favourite_artists,
        onboarding_completed: true,
      });
      set({ user: data, isLoading: false });
      return data;
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to save preferences';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  forgotPassword: async ({ email }) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('auth/forgot-password/', { email });
      set({ isLoading: false });
      return data;
    } catch (error) {
      const message = parseError(error, 'Failed to send reset code');
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  verifyResetOtp: async ({ email, otp }) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('auth/verify-reset-otp/', { email, otp });
      set({ isLoading: false });
      return data;
    } catch (error) {
      const message = parseError(error, 'Invalid OTP code');
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  resetPassword: async ({ email, otp, new_password, confirm_password }) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('auth/reset-password/', {
        email,
        otp,
        new_password,
        confirm_password,
      });
      set({ isLoading: false });
      return data;
    } catch (error) {
      const message = parseError(error, 'Failed to reset password');
      set({ error: message, isLoading: false });
      throw error;
    }
  },
}));

export default useAuthStore;

