import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';

export interface UserProfile {
  _id?: string;
  userId?: string;
  name?: string;
  email?: string;
  bio?: string;
  phone?: string;
  location?: string;
  avatar?: string;
  education: {
    degree?: string;
    institution?: string;
    graduationYear?: number;
    fieldOfStudy?: string;
  };
  careerGoals: {
    targetRole?: string;
    industry?: string;
    timeframe?: string;
    description?: string;
  };
  skills: string[];
  interests: string[];
  experience: {
    level: 'entry' | 'junior' | 'mid' | 'senior' | 'expert';
    years?: number;
    currentRole?: string;
    currentCompany?: string;
  };
  isComplete?: boolean;
  savedCareerPath?: any;
  careerPathGeneratedAt?: string;
  learningProgress?: {
    currentWeek: number;
    completedResources: string[];
    completedMilestones: string[];
    startedAt: string;
    lastActivityAt: string;
  };
}

interface ProfileState {
  profile: UserProfile | null;
  isProfileComplete: boolean;
  loading: boolean;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateLearningProgress: (progress: any) => Promise<void>;
  setLoading: (loading: boolean) => void;
  checkProfileCompleteness: () => void;
  fetchProfile: () => Promise<void>;
  checkProfileStatus: () => Promise<{ hasProfile: boolean; isComplete: boolean }>;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      isProfileComplete: false,
      loading: false,

      setProfile: (profile) => {
        set({ profile });
        get().checkProfileCompleteness();
      },

      updateProfile: async (updates) => {
        set({ loading: true });
        try {
          const response = await api.updateProfile(updates);
          if (response.success) {
            set({ profile: response.profile });
            get().checkProfileCompleteness();
          }
        } catch (error) {
          console.error('Failed to update profile:', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      updateLearningProgress: async (progress) => {
        set({ loading: true });
        try {
          const response = await api.updateLearningProgress(progress);
          if (response.success) {
            set({ profile: response.profile });
          }
        } catch (error) {
          console.error('Failed to update learning progress:', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      fetchProfile: async () => {
        set({ loading: true });
        try {
          const response = await api.getProfile();
          if (response.success) {
            set({ profile: response.profile });
            get().checkProfileCompleteness();
          }
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        } finally {
          set({ loading: false });
        }
      },

      checkProfileStatus: async () => {
        try {
          const response = await api.checkProfileStatus();
          if (response.success) {
            set({ 
              profile: response.profile,
              isProfileComplete: response.isComplete 
            });
            return {
              hasProfile: response.hasProfile,
              isComplete: response.isComplete
            };
          }
          return { hasProfile: false, isComplete: false };
        } catch (error) {
          console.error('Failed to check profile status:', error);
          return { hasProfile: false, isComplete: false };
        }
      },

      setLoading: (loading) => set({ loading }),

      checkProfileCompleteness: () => {
        const profile = get().profile;
        if (!profile) {
          set({ isProfileComplete: false });
          return;
        }

        const requiredFields = [
          profile.bio,
          profile.careerGoals?.targetRole,
          profile.experience?.level,
          profile.skills?.length > 0
        ];

        const isComplete = requiredFields.every(field => 
          field !== undefined && field !== null && field !== '' && field !== false
        );

        set({ isProfileComplete: isComplete });
      },
    }),
    {
      name: 'profile-storage',
    }
  )
);