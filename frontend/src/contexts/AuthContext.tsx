import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types/auth';
import { api } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        try {
          const response = await api.getProfile(token);
          if (response.success) {
            setUser(response.user);
          } else {
            localStorage.removeItem('auth_token');
          }
        } catch (error) {
          console.error('Auth initialization failed:', error);
          localStorage.removeItem('auth_token');
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (provider: 'google' | 'linkedin') => {
    const authUrl = provider === 'google' 
      ? 'http://localhost:3000/auth/google'
      : 'http://localhost:3000/auth/linkedin';
    
    window.location.href = authUrl;
  };

  const logout = async () => {
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      try {
        await api.logout(token);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};