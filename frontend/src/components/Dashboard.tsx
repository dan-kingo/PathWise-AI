import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useProfileStore } from '../stores/profileStore';
import LoadingSpinner from './LoadingSpinner';
import ProfileSetup from './profile/ProfileSetup';
import AICareerPathPlanner from './career/AICareerPathPlanner';
import ProfileReviewer from './profile/ProfileReviewer';
import Button from './ui/Button';
import { 
  User, 
  Target, 
  BookOpen, 
  Settings, 
  LogOut, 
  Sparkles,
  TrendingUp,
  Clock,
  Award,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Calendar,
  Star,
  Search,
  Eye
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout, loading } = useAuthStore();
  const { profile, isProfileComplete, checkProfileStatus, fetchProfile } = useProfileStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'career' | 'profile-reviewer' | 'settings'>('overview');
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

  const navigation = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'career', name: 'AI Career Planner', icon: Sparkles },
    { id: 'profile-reviewer', name: 'Profile Reviewer', icon: Search },
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const quickStats = [
    {
      icon: <Target className="w-6 h-6 text-blue-600" />,
      label: "Career Goal",
      value: profile?.careerGoals?.targetRole || "Not set",
      color: "bg-blue-50 border-blue-200"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-green-600" />,
      label: "Experience Level",
      value: profile?.experience?.level ? profile.experience.level.charAt(0).toUpperCase() + profile.experience.level.slice(1) : "Not set",
      color: "bg-green-50 border-green-200"
    },
    {
      icon: <BookOpen className="w-6 h-6 text-purple-600" />,
      label: "Skills",
      value: `${profile?.skills?.length || 0} skills`,
      color: "bg-purple-50 border-purple-200"
    },
    {
      icon: <Award className="w-6 h-6 text-orange-600" />,
      label: "Profile Status",
      value: isProfileComplete ? "Complete" : "Incomplete",
      color: isProfileComplete ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"
    }
  ];

  const recentActivities = [
    {
      icon: <Sparkles className="w-5 h-5 text-purple-600" />,
      title: "Career path generated",
      description: "AI created your personalized roadmap",
      time: "2 hours ago",
      color: "bg-purple-50"
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      title: "Profile completed",
      description: "All required information added",
      time: "1 day ago",
      color: "bg-green-50"
    },
    {
      icon: <Target className="w-5 h-5 text-blue-600" />,
      title: "Goal updated",
      description: "Target role set to Frontend Developer",
      time: "3 days ago",
      color: "bg-blue-50"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
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
              <div className="hidden md:flex items-center space-x-1">
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
              
              {/* Mobile Navigation */}
              <div className="md:hidden">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  {navigation.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                icon={<LogOut className="w-4 h-4" />}
              >
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Welcome back, {user.name}! 👋
                  </h1>
                  <p className="text-blue-100 text-lg">
                    Ready to take the next step in your career journey?
                  </p>
                </div>
                <div className="mt-6 lg:mt-0">
                  <Button 
                    variant="secondary" 
                    onClick={() => setActiveTab('career')}
                    className="bg-white text-blue-600 hover:bg-gray-100"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Career Path
                  </Button>
                </div>
              </div>
            </div>

            {/* Profile Completion Alert */}
            {!isProfileComplete && (
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-orange-900">Complete Your Profile</h3>
                      <p className="text-orange-700 mt-1">
                        Complete your profile to unlock personalized career recommendations and AI-powered insights.
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => setShowProfileSetup(true)} className="flex-shrink-0">
                    Complete Profile
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickStats.map((stat, index) => (
                <div key={index} className={`bg-white rounded-xl p-6 border ${stat.color} hover:shadow-lg transition-shadow`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white">
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Quick Actions */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => setActiveTab('career')}
                      className="p-6 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all group text-left"
                    >
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                          <Sparkles className="w-5 h-5 text-purple-600" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-purple-600 transition-colors" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">Generate AI Career Path</h3>
                      <p className="text-sm text-gray-600">Get a personalized learning roadmap tailored to your goals</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('profile-reviewer')}
                      className="p-6 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group text-left"
                    >
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <Search className="w-5 h-5 text-blue-600" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-blue-600 transition-colors" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">AI Profile Reviewer</h3>
                      <p className="text-sm text-gray-600">Get AI insights to optimize your LinkedIn and GitHub profiles</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('career')}
                      className="p-6 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all group text-left"
                    >
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-green-600 transition-colors" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">Analyze Skill Gap</h3>
                      <p className="text-sm text-gray-600">Identify skills you need to reach your target role</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('profile')}
                      className="p-6 border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all group text-left"
                    >
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                          <User className="w-5 h-5 text-orange-600" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-orange-600 transition-colors" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">Update Profile</h3>
                      <p className="text-sm text-gray-600">Keep your information current for better recommendations</p>
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.color}`}>
                        {activity.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                        <p className="text-gray-600 text-sm">{activity.description}</p>
                        <p className="text-gray-400 text-xs mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Skills Overview */}
            {profile?.skills && profile.skills.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Your Skills</h2>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('profile')}>
                    Manage Skills
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.slice(0, 12).map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                  {profile.skills.length > 12 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                      +{profile.skills.length - 12} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'career' && <AICareerPathPlanner />}
        {activeTab === 'profile-reviewer' && <ProfileReviewer />}

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

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Settings</h1>
              <p className="text-gray-600">Manage your account preferences</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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