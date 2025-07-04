const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = {
  // Email signup
  signup: async (email: string, password: string, name: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    return data;
  },

  // Email login
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      const error = new Error(data.message || 'Login failed');
      (error as any).needsVerification = data.needsVerification;
      throw error;
    }

    return data;
  },

  // Verify email
  verifyEmail: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Email verification failed');
    }

    return data;
  },

  // Resend verification email
  resendVerification: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to resend verification email');
    }

    return data;
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send reset email');
    }

    return data;
  },

  // Reset password
  resetPassword: async (token: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Password reset failed');
    }

    return data;
  },

  // Change password (authenticated)
  changePassword: async (currentPassword: string, newPassword: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Password change failed');
    }

    return data;
  },

  // Get current user profile
  getCurrentUser: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    return response.json();
  },

  // Logout user
  logout: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
    }
  },

  // OAuth login URL
  getGoogleAuthUrl: () => `${API_BASE_URL}/auth/google`,
};