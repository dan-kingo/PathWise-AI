import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/auth';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (provider: 'google' | 'email-login' | 'email-signup' | 'forgot-password', data?: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: true,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (loading) => set({ loading }),
      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },

      checkAuthStatus: async () => {
        try {
          const token = localStorage.getItem('auth_token');
          if (!token) {
            set({ loading: false, user: null, isAuthenticated: false });
            return;
          }

          const response = await api.getCurrentUser();
          if (response.success && response.user) {
            set({ user: response.user, isAuthenticated: true });
          } else {
            localStorage.removeItem('auth_token');
            set({ user: null, isAuthenticated: false });
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('auth_token');
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ loading: false });
        }
      },

      login: async (provider, data) => {
        if (provider === 'google') {
          const authUrl = api.getGoogleAuthUrl();
          window.location.href = authUrl;
          return;
        }

        if (provider === 'forgot-password') {
          window.location.href = '/forgot-password';
          return;
        }

        set({ loading: true });
        try {
          let response;
          if (provider === 'email-signup') {
            response = await api.signup(data.email, data.password, data.name);
            if (response.success) {
              return;
            }
          } else if (provider === 'email-login') {
            response = await api.login(data.email, data.password);
            if (response.success && response.token) {
              localStorage.setItem('auth_token', response.token);
              set({ user: response.user, isAuthenticated: true });
              return;
            }
          }
          
          throw new Error(response?.message || 'Authentication failed');
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        set({ loading: true });
        try {
          await api.logout();
          set({ user: null, isAuthenticated: false });
        } catch (error) {
          console.error('Logout failed:', error);
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);