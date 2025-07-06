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
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error('Session expired');
      }
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
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error('Session expired');
      }
      throw new Error('Failed to fetch user');
    }

    return response.json();
  },

  // Profile API methods
  getProfile: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_BASE_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error('Session expired');
      }
      throw new Error('Failed to fetch profile');
    }

    return response.json();
  },

  checkProfileStatus: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_BASE_URL}/profile/status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error('Session expired');
      }
      throw new Error('Failed to check profile status');
    }

    return response.json();
  },

  updateProfile: async (profileData: any) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error('Session expired');
      }
      throw new Error(data.message || 'Failed to update profile');
    }

    return data;
  },

  updateLearningProgress: async (learningProgress: any) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_BASE_URL}/profile/learning-progress`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ learningProgress }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error('Session expired');
      }
      throw new Error(data.message || 'Failed to update learning progress');
    }

    return data;
  },

  uploadAvatar: async (file: File) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No token found');

    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_BASE_URL}/profile/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error('Session expired');
      }
      throw new Error(data.message || 'Failed to upload avatar');
    }

    return data;
  },

  // Career API methods - New Career model endpoints
  generateCareerPath: async (data: any) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_BASE_URL}/career/generate-path`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error('Session expired');
      }
      throw new Error(result.message || 'Failed to generate career path');
    }

    return result;
  },

  getCareerPath: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_BASE_URL}/career/path`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (!response.ok && response.status !== 404) {
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error('Session expired');
      }
      throw new Error(result.message || 'Failed to get career path');
    }

    return result;
  },

  updateCareerPath: async (data: any) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_BASE_URL}/career/path`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error('Session expired');
      }
      throw new Error(result.message || 'Failed to update career path');
    }

    return result;
  },

  deleteCareerPath: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_BASE_URL}/career/path`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error('Session expired');
      }
      throw new Error(result.message || 'Failed to delete career path');
    }

    return result;
  },

  getResourceRecommendations: async (skill: string, level: string = 'beginner') => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_BASE_URL}/career/resources?skill=${encodeURIComponent(skill)}&level=${level}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error('Session expired');
      }
      throw new Error(result.message || 'Failed to get resource recommendations');
    }

    return result;
  },

  analyzeSkillGap: async (targetRole: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_BASE_URL}/career/analyze-skills`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ targetRole }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error('Session expired');
      }
      throw new Error(result.message || 'Failed to analyze skill gap');
    }

    return result;
  },

  // Profile Reviewer API methods
  analyzeProfile: async (profileUrl: string, profileType: 'linkedin' | 'github', additionalContext?: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_BASE_URL}/profile-reviewer/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ profileUrl, profileType, additionalContext }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error('Session expired');
      }
      throw new Error(result.message || 'Failed to analyze profile');
    }

    return result;
  },

  getProfileReviews: async (profileType?: 'linkedin' | 'github') => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No token found');

    const queryParams = profileType ? `?profileType=${profileType}` : '';
    const response = await fetch(`${API_BASE_URL}/profile-reviewer/reviews${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error('Session expired');
      }
      throw new Error(result.message || 'Failed to get profile reviews');
    }

    return result;
  },

  getProfileReview: async (reviewId: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_BASE_URL}/profile-reviewer/reviews/${reviewId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error('Session expired');
      }
      throw new Error(result.message || 'Failed to get profile review');
    }

    return result;
  },

  deleteProfileReview: async (reviewId: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_BASE_URL}/profile-reviewer/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error('Session expired');
      }
      throw new Error(result.message || 'Failed to delete profile review');
    }

    return result;
  },

  updateReviewNotes: async (reviewId: string, notes: string, completedSuggestions: string[]) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_BASE_URL}/profile-reviewer/reviews/${reviewId}/notes`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes, completedSuggestions }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error('Session expired');
      }
      throw new Error(result.message || 'Failed to update review notes');
    }

    return result;
  },

  getProfileInsights: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_BASE_URL}/profile-reviewer/insights`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error('Session expired');
      }
      throw new Error(result.message || 'Failed to get profile insights');
    }

    return result;
  },

  // Legacy methods for backward compatibility
  saveCareerPath: async (careerPath: any) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_BASE_URL}/career/save-path`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ careerPath }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error('Session expired');
      }
      throw new Error(result.message || 'Failed to save career path');
    }

    return result;
  },

  getSavedCareerPath: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_BASE_URL}/career/saved-path`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (!response.ok && response.status !== 404) {
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error('Session expired');
      }
      throw new Error(result.message || 'Failed to get saved career path');
    }

    return result;
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