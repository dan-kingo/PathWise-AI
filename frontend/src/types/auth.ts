export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (provider: 'google') => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  user?: T;
  message?: string;
  error?: string;
}