export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: string;
  isEmailVerified?: boolean;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (provider: 'google' | 'email-login' | 'email-signup' | 'forgot-password', data?: any) => void | Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  user?: T;
  message?: string;
  error?: string;
  token?: string;
  needsVerification?: boolean;
}