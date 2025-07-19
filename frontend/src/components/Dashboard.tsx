import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useProfileStore } from '../stores/profileStore';
import { DashboardTab } from '../types/dashboard';
import LoadingSpinner from './LoadingSpinner';
import ProfileSetup from './profile/ProfileSetup';
import AICareerPathPlanner from './career/AICareerPathPlanner';
import ProfileReviewer from './profile/ProfileReviewer';
import ResumeReviewer from './resume/resumeReviewer';
import Button from './ui/Button';
import { 
  User, 
  BarChart3,
  Search,
  Sparkles
} from 'lucide-react';

// Dashboard Components
import Navbar from './dashboard/Navbar';
import WelcomeHeader from './dashboard/WelcomeHeader';
import ProfileCompletionAlert from './dashboard/ProfileCompletionAlert';
import QuickStats from './dashboard/QuickStats';
import QuickActions from './dashboard/QuickActions';
import RecentActivity from './dashboard/RecentActivity';
import SkillsOverview from './dashboard/SkillsOverview';

const Dashboard: React.FC = () => {
  const { user, logout, loading } = useAuthStore();
  const { profile, isProfileComplete, checkProfileStatus, fetchProfile } = useProfileStore();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setProfileLoading(true);
        
        // Check profile status from backend
        const status = await checkProfileStatus();
        
        if (!status.hasProfile || !status.isComplete) {
          setShowProfileSetup(true);
        } else {
          // Fetch full profile data
          await fetchProfile();
        }
      } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        // If there's an error, show profile setup to be safe
        setShowProfileSetup(true);
      } finally {
        setProfileLoading(false);
      }
    };

    if (user) {
      initializeDashboard();
    }
  }, [user, checkProfileStatus, fetchProfile]);

  const handleProfileSetupComplete = async () => {
    setShowProfileSetup(false);
    setActiveTab('overview');
    // Refresh profile data
    await fetchProfile();
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (showProfileSetup) {
    return <ProfileSetup onComplete={handleProfileSetupComplete} />;
  }

  const navigation: { id: DashboardTab; name: string; icon: React.FC<any> }[] = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'career', name: 'AI Career Planner', icon: Sparkles },
    { id: 'profile-reviewer', name: 'Profile Reviewer', icon: Search },
    { id: 'profile', name: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        navigation={navigation}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={logout}
      />

      {/* Main Content with top padding for fixed nav */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pt-24">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <WelcomeHeader
              userName={user.name}
              onGenerateCareerPath={() => setActiveTab('career')}
            />

            {!isProfileComplete && (
              <ProfileCompletionAlert
                onCompleteProfile={() => setShowProfileSetup(true)}
              />
            )}

            <QuickStats profile={profile} isProfileComplete={isProfileComplete} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <QuickActions
                  onCareerPlannerClick={() => setActiveTab('career')}
                  onProfileReviewerClick={() => setActiveTab('profile-reviewer')}
                  onResumeReviewerClick={() => setActiveTab('resume-reviewer')}
                  onProfileClick={() => setActiveTab('profile')}
                />
              </div>
              
              <RecentActivity />
            </div>

            {profile?.skills && profile.skills.length > 0 && (
              <SkillsOverview
                skills={profile.skills}
                onManageSkills={() => setActiveTab('profile')}
              />
            )}
          </div>
        )}

        {activeTab === 'career' && <AICareerPathPlanner />}
        {activeTab === 'profile-reviewer' && <ProfileReviewer />}
        {activeTab === 'resume-reviewer' && <ResumeReviewer />}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Your Profile</h1>
              <p className="text-gray-600">Manage your personal information and preferences</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                <Button onClick={() => setShowProfileSetup(true)}>
                  Edit Profile
                </Button>
              </div>

              {profile ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <p className="text-gray-900">{user.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <p className="text-gray-900">{profile.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
                      <p className="text-gray-900">{profile.careerGoals?.targetRole || 'Not specified'}</p>
                    </div>
                  </div>

                  {profile.bio && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                      <p className="text-gray-900">{profile.bio}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills?.map((skill) => (
                        <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {profile.interests && profile.interests.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map((interest) => (
                          <span key={interest} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Profile Information</h3>
                  <p className="text-gray-600 mb-4">Complete your profile to get started.</p>
                  <Button onClick={() => setShowProfileSetup(true)}>
                    Complete Profile
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;