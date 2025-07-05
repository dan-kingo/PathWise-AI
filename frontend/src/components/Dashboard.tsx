import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useProfileStore } from '../stores/profileStore';
import LoadingSpinner from './LoadingSpinner';
import ProfileSetup from './profile/ProfileSetup';
import CareerPathPlanner from './career/CareerPathPlanner';
import Button from './ui/Button';
import { User, Target, BookOpen, Settings, LogOut } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout, loading } = useAuthStore();
  const { profile, isProfileComplete, checkProfileCompleteness } = useProfileStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'career' | 'settings'>('overview');
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  useEffect(() => {
    checkProfileCompleteness();
    
    // Show profile setup if profile is not complete
    if (!isProfileComplete && !showProfileSetup) {
      setShowProfileSetup(true);
    }
  }, [isProfileComplete, checkProfileCompleteness, showProfileSetup]);

  const handleProfileSetupComplete = () => {
    setShowProfileSetup(false);
    setActiveTab('overview');
  };

  if (loading) {
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

  const navigation = [
    { id: 'overview', name: 'Overview', icon: User },
    { id: 'career', name: 'Career Paths', icon: Target },
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">Job Ready AI Coach</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === item.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </button>
                  );
                })}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                icon={<LogOut className="w-4 h-4" />}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user.name}!
              </h1>
              <p className="text-gray-600">Ready to advance your career?</p>
            </div>

            {/* Profile Completion Alert */}
            {!isProfileComplete && (
              <div className="card bg-yellow-50 border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-yellow-800">Complete Your Profile</h3>
                    <p className="text-yellow-700">
                      Complete your profile to get personalized career recommendations.
                    </p>
                  </div>
                  <Button onClick={() => setShowProfileSetup(true)}>
                    Complete Profile
                  </Button>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Profile Status</p>
                    <p className={`text-lg font-semibold ${isProfileComplete ? 'text-green-600' : 'text-yellow-600'}`}>
                      {isProfileComplete ? 'Complete' : 'Incomplete'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Career Paths</p>
                    <p className="text-lg font-semibold text-gray-900">3 Available</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Learning Progress</p>
                    <p className="text-lg font-semibold text-gray-900">0% Complete</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => setActiveTab('career')}
                >
                  <Target className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Explore Career Paths</div>
                    <div className="text-sm text-gray-500">Find your ideal career roadmap</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => setActiveTab('profile')}
                >
                  <User className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Update Profile</div>
                    <div className="text-sm text-gray-500">Keep your information current</div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'career' && <CareerPathPlanner />}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Profile</h1>
              <p className="text-gray-600">Manage your personal information and preferences</p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                <Button onClick={() => setShowProfileSetup(true)}>
                  Edit Profile
                </Button>
              </div>

              {profile ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <p className="text-gray-900">{profile.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-gray-900">{profile.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <p className="text-gray-900">{profile.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
                      <p className="text-gray-900">{profile.careerGoals.targetRole || 'Not specified'}</p>
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
                      {profile.skills.map((skill) => (
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

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
              <p className="text-gray-600">Manage your account preferences</p>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-600">Receive updates about your learning progress</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Weekly Progress Reports</h3>
                    <p className="text-sm text-gray-600">Get weekly summaries of your learning activity</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy & Security</h2>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Download My Data
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600 border-red-300 hover:bg-red-50">
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;