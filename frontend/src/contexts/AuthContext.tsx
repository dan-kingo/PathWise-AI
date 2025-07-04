import React, { createContext, useContext, useEffect, useState } from 'react';
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.getCurrentUser();
      if (response.success && response.user) {
        setUser(response.user);
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (provider: 'google' | 'email-login' | 'email-signup' | 'forgot-password', data?: any) => {
    if (provider === 'google') {
      const authUrl = api.getGoogleAuthUrl();
      window.location.href = authUrl;
      return;
    }

    if (provider === 'forgot-password') {
      window.location.href = '/forgot-password';
      return;
    }

    setLoading(true);
    try {
      let response;
      if (provider === 'email-signup') {
        response = await api.signup(data.email, data.password, data.name);
        if (response.success) {
          // Show success message for signup
          alert('Account created successfully! Please check your email to verify your account.');
          return;
        }
      } else if (provider === 'email-login') {
        response = await api.login(data.email, data.password);
        if (response.success && response.token) {
          localStorage.setItem('auth_token', response.token);
          setUser(response.user);
          return;
        }
      }
      
      throw new Error(response?.message || 'Authentication failed');
    } catch (error: any) {
      if (error.needsVerification) {
        alert('Please verify your email before logging in. Check your inbox for the verification link.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
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