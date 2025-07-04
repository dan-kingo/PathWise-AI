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
  login: (provider: 'google' | 'linkedin') => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface AuthResponse {
  success: boolean;
  user: User;
}