import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
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
}

interface ProfileState {
  profile: UserProfile | null;
  isProfileComplete: boolean;
  loading: boolean;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setLoading: (loading: boolean) => void;
  checkProfileCompleteness: () => void;
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

      updateProfile: (updates) => {
        const currentProfile = get().profile;
        if (currentProfile) {
          const updatedProfile = { ...currentProfile, ...updates };
          set({ profile: updatedProfile });
          get().checkProfileCompleteness();
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
          profile.name,
          profile.email,
          profile.bio,
          profile.careerGoals.targetRole,
          profile.experience.level,
          profile.skills.length > 0
        ];

        const isComplete = requiredFields.every(field => 
          field !== undefined && field !== null && field !== ''
        );

        set({ isProfileComplete: isComplete });
      },
    }),
    {
      name: 'profile-storage',
    }
  )
);