import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../../stores/profileStore';
import { api } from '../../services/api';
import Button from '../ui/Button';
import LoadingSpinner from '../LoadingSpinner';
import { 
  Calendar, 
  CheckCircle, 
  BookOpen, 
  Play, 
  Target, 
  ArrowLeft,
  Star,
  ExternalLink,
  Award,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

interface WeeklyPlan {
  week: number;
  title: string;
  description: string;
  focus?: string;
  goals?: string[];
  tasks?: string[];
  skills?: string[];
  resources?: {
    title: string;
    type: 'video' | 'article' | 'course' | 'practice' | 'project';
    url: string;
    duration: string;
    description: string;
    source: string;
  }[];
  milestones?: string[];
  projects?: string[];
  project?: string;
  hours?: number;
}

interface CareerPath {
  _id?: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  totalWeeks: number;
  weeklyPlan: WeeklyPlan[];
  generatedAt?: string;
}

const WeeklyLearningPlan: React.FC = () => {
  const navigate = useNavigate();
  const { profile, updateLearningProgress } = useProfileStore();
  const [careerPath, setCareerPath] = useState<CareerPath | null>(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [completedResources, setCompletedResources] = useState<Set<string>>(new Set());
  const [completedMilestones, setCompletedMilestones] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    loadCareerPath();
  }, []);

  const loadCareerPath = async () => {
    try {
      setLoading(true);
      
      // Try to get career path from new Career model first
      let response;
      try {
        response = await api.getCareerPath();
      } catch (error) {
        // Fallback to legacy saved career path
        response = await api.getSavedCareerPath();
      }

      if (response.success && response.careerPath) {
        setCareerPath(response.careerPath);
        
        // Load progress from profile if available
        if (profile?.learningProgress) {
          setCurrentWeek(profile.learningProgress.currentWeek || 1);
          setCompletedResources(new Set(profile.learningProgress.completedResources || []));
          setCompletedMilestones(new Set(profile.learningProgress.completedMilestones || []));
        }
      } else {
        toast.error('No career path found. Please generate one first.');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Failed to load career path:', error);
      toast.error('Failed to load career path');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async () => {
    try {
      const progressData = {
        currentWeek,
        completedResources: Array.from(completedResources),
        completedMilestones: Array.from(completedMilestones),
        startedAt: profile?.learningProgress?.startedAt || new Date().toISOString(),
        lastActivityAt: new Date().toISOString()
      };

      await updateLearningProgress(progressData);
      toast.success('Progress saved!');
    } catch (error) {
      console.error('Failed to save progress:', error);
      toast.error('Failed to save progress');
    }
  };

  const toggleResourceCompletion = async (resourceTitle: string) => {
    const newCompleted = new Set(completedResources);
    if (newCompleted.has(resourceTitle)) {
      newCompleted.delete(resourceTitle);
    } else {
      newCompleted.add(resourceTitle);
    }
    setCompletedResources(newCompleted);
    
    // Auto-save progress
    setTimeout(saveProgress, 500);
  };

  const toggleMilestoneCompletion = async (milestone: string) => {
    const newCompleted = new Set(completedMilestones);
    if (newCompleted.has(milestone)) {
      newCompleted.delete(milestone);
    } else {
      newCompleted.add(milestone);
    }
    setCompletedMilestones(newCompleted);
    
    // Auto-save progress
    setTimeout(saveProgress, 500);
  };

  const openResource = (url: string) => {
    if (url && url.startsWith('http')) {
      window.open(url, '_blank');
    } else if (url && url.startsWith('Search:')) {
      const searchTerm = url.replace('Search:', '').trim();
      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`, '_blank');
    } else {
      // If no URL, search for the resource title
      const searchTerm = url || 'learning resource';
      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`, '_blank');
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'article': return '📄';
      case 'course': return '📚';
      case 'practice': return '💻';
      case 'project': return '🚀';
      default: return '📖';
    }
  };

  const getWeekProgress = (week: WeeklyPlan) => {
    if (!week) return 0;
    
    const resources = week.resources || [];
    const milestones = week.milestones || [];
    const totalItems = resources.length + milestones.length;
    
    if (totalItems === 0) return 0;
    
    const completedResourcesCount = resources.filter(r => completedResources.has(r.title)).length;
    const completedMilestonesCount = milestones.filter(m => completedMilestones.has(m)).length;
    const completedItems = completedResourcesCount + completedMilestonesCount;
    
    return Math.round((completedItems / totalItems) * 100);
  };

  const getOverallProgress = () => {
    if (!careerPath?.weeklyPlan || careerPath.weeklyPlan.length === 0) return 0;
    
    const totalWeeks = careerPath.weeklyPlan.length;
    const completedWeeks = careerPath.weeklyPlan.filter(week => getWeekProgress(week) === 100).length;
    return totalWeeks > 0 ? Math.round((completedWeeks / totalWeeks) * 100) : 0;
  };

  const goToWeek = (weekNumber: number) => {
    if (weekNumber >= 1 && weekNumber <= (careerPath?.totalWeeks || 0)) {
      setCurrentWeek(weekNumber);
      setIsSidebarOpen(false); // Close sidebar on mobile after selection
    }
  };

  const currentWeekData = careerPath?.weeklyPlan?.find(week => week.week === currentWeek);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!careerPath || !currentWeekData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Learning Plan Found</h2>
          <p className="text-gray-600 mb-4">Please generate a career path first.</p>
          <Button onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Mobile-Friendly Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Back button and title */}
            <div className="flex items-center min-w-0 flex-1">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="p-2 sm:px-3 sm:py-2 mr-2 sm:mr-4"
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                  {careerPath.title}
                </h1>
                <p className="text-sm text-gray-600">
                  Week {currentWeek} of {careerPath.totalWeeks}
                </p>
              </div>
            </div>

            {/* Right side - Progress and menu */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Progress indicator */}
              <div className="text-right hidden sm:block">
                <div className="text-sm text-gray-600">Overall Progress</div>
                <div className="text-lg font-bold text-blue-600">{getOverallProgress()}%</div>
              </div>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Save progress button - hidden on mobile, shown on larger screens */}
              <Button 
                onClick={saveProgress} 
                variant="outline" 
                className="hidden sm:flex"
                size="sm"
              >
                Save Progress
              </Button>
            </div>
          </div>

          {/* Mobile progress indicator */}
          <div className="mt-2 sm:hidden">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress: {getOverallProgress()}%</span>
              <Button onClick={saveProgress} variant="outline" size="sm">
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex pt-20">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Week Navigation Sidebar */}
        <div className={`
          fixed lg:sticky top-20 left-0 h-screen w-80 bg-white shadow-lg z-1 transform transition-transform duration-300 ease-in-out
          lg:transform-none lg:shadow-sm lg:border-r lg:border-gray-200
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-4 lg:p-6 h-full overflow-y-auto">
            {/* Mobile header */}
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <h3 className="font-semibold text-gray-900">Learning Plan</h3>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Desktop header */}
            <h3 className="hidden lg:flex font-semibold text-gray-900 mb-4 items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Learning Plan
            </h3>
            
            <div className="space-y-2">
              {(careerPath.weeklyPlan || []).map((week) => {
                const progress = getWeekProgress(week);
                const isActive = week.week === currentWeek;
                
                return (
                  <button
                    key={week.week}
                    onClick={() => goToWeek(week.week)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-50 border-2 border-blue-200' 
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-medium ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                        Week {week.week}
                      </span>
                      {progress === 100 && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-2 line-clamp-2">{week.title}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{progress}% complete</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
            {/* Week Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 sm:p-8 text-white">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                    Week {currentWeekData.week}: {currentWeekData.title}
                  </h2>
                  <p className="text-blue-100 text-base sm:text-lg">{currentWeekData.description}</p>
                  {currentWeekData.focus && (
                    <p className="text-blue-200 text-sm mt-2">Focus: {currentWeekData.focus}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-blue-100 text-sm">Week Progress</div>
                  <div className="text-2xl sm:text-3xl font-bold">{getWeekProgress(currentWeekData)}%</div>
                </div>
              </div>
              
              {/* Week Navigation */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <Button
                  variant="secondary"
                  onClick={() => goToWeek(currentWeek - 1)}
                  disabled={currentWeek === 1}
                  icon={<ChevronLeft className="w-4 h-4" />}
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30 w-full sm:w-auto"
                  size="sm"
                >
                  Previous Week
                </Button>
                
                <div className="flex flex-wrap gap-2 justify-center">
                  {(currentWeekData.skills || []).slice(0, 3).map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                  {(currentWeekData.skills || []).length > 3 && (
                    <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                      +{(currentWeekData.skills || []).length - 3} more
                    </span>
                  )}
                </div>
                
                <Button
                  variant="secondary"
                  onClick={() => goToWeek(currentWeek + 1)}
                  disabled={currentWeek === careerPath.totalWeeks}
                  icon={<ChevronRight className="w-4 h-4" />}
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30 w-full sm:w-auto"
                  size="sm"
                >
                  Next Week
                </Button>
              </div>
            </div>

            {/* Goals Section */}
            {currentWeekData.goals && currentWeekData.goals.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 mr-3 text-green-600" />
                  Week Goals
                </h3>
                <ul className="space-y-3">
                  {currentWeekData.goals.map((goal, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tasks Section */}
            {currentWeekData.tasks && currentWeekData.tasks.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-3 text-blue-600" />
                  Tasks to Complete
                </h3>
                <div className="space-y-4">
                  {currentWeekData.tasks.map((task, index) => (
                    <div key={index} className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-4 mt-1 flex-shrink-0"></div>
                      <span className="text-gray-700">{task}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Resources */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 mr-3 text-blue-600" />
                Learning Resources
              </h3>
              
              {currentWeekData.resources && currentWeekData.resources.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {currentWeekData.resources.map((resource, index) => {
                    const isCompleted = completedResources.has(resource.title);
                    
                    return (
                      <div key={index} className={`border rounded-xl p-4 sm:p-6 transition-all hover:shadow-md ${
                        isCompleted ? 'bg-green-50 border-green-200' : 'border-gray-200 hover:border-blue-300'
                      }`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center min-w-0 flex-1">
                            <span className="text-2xl mr-3 flex-shrink-0">{getResourceIcon(resource.type)}</span>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-gray-900 truncate">{resource.title}</h4>
                              <p className="text-sm text-gray-500">{resource.source} • {resource.duration}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-2">
                            <button
                              onClick={() => openResource(resource.url)}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors flex-shrink-0"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleResourceCompletion(resource.title)}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                                isCompleted
                                  ? 'bg-green-500 border-green-500'
                                  : 'border-gray-300 hover:border-green-400'
                              }`}
                            >
                              {isCompleted && <CheckCircle className="w-4 h-4 text-white" />}
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            resource.type === 'video' ? 'bg-red-100 text-red-800' :
                            resource.type === 'course' ? 'bg-blue-100 text-blue-800' :
                            resource.type === 'article' ? 'bg-green-100 text-green-800' :
                            resource.type === 'practice' ? 'bg-purple-100 text-purple-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {resource.type}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openResource(resource.url)}
                            icon={<Play className="w-3 h-3" />}
                            className="w-full sm:w-auto"
                          >
                            Start
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No resources available for this week</p>
                </div>
              )}
            </div>

            {/* Milestones */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 mr-3 text-green-600" />
                Week Milestones
              </h3>
              
              {currentWeekData.milestones && currentWeekData.milestones.length > 0 ? (
                <div className="space-y-4">
                  {currentWeekData.milestones.map((milestone, index) => {
                    const isCompleted = completedMilestones.has(milestone);
                    
                    return (
                      <div key={index} className={`flex items-start p-4 rounded-lg border transition-colors ${
                        isCompleted ? 'bg-green-50 border-green-200' : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <button
                          onClick={() => toggleMilestoneCompletion(milestone)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 mt-0.5 transition-colors flex-shrink-0 ${
                            isCompleted
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-300 hover:border-green-400'
                          }`}
                        >
                          {isCompleted && <CheckCircle className="w-4 h-4 text-white" />}
                        </button>
                        <span className={`flex-1 ${isCompleted ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                          {milestone}
                        </span>
                        {isCompleted && (
                          <Award className="w-5 h-5 text-green-600 ml-2 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No milestones defined for this week</p>
                </div>
              )}
            </div>

            {/* Projects */}
            {((currentWeekData.projects && currentWeekData.projects.length > 0) || currentWeekData.project) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 mr-3 text-orange-600" />
                  Practice Projects
                </h3>
                
                <div className="space-y-4">
                  {currentWeekData.projects && currentWeekData.projects.map((project, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors gap-3">
                      <div className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0 mt-1 sm:mt-0"></div>
                      <span className="flex-1 text-gray-900">{project}</span>
                      <Button size="sm" variant="outline" className="w-full sm:w-auto">
                        Start Project
                      </Button>
                    </div>
                  ))}
                  
                  {currentWeekData.project && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors gap-3">
                      <div className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0 mt-1 sm:mt-0"></div>
                      <span className="flex-1 text-gray-900">{currentWeekData.project}</span>
                      <Button size="sm" variant="outline" className="w-full sm:w-auto">
                        Start Project
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Week Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 sm:p-8 border border-purple-200">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 mr-3 text-purple-600" />
                Week Summary
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">
                    {(currentWeekData.resources || []).filter(r => completedResources.has(r.title)).length}
                  </div>
                  <div className="text-sm text-gray-600">Resources Completed</div>
                  <div className="text-xs text-gray-500">of {(currentWeekData.resources || []).length}</div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    {(currentWeekData.milestones || []).filter(m => completedMilestones.has(m)).length}
                  </div>
                  <div className="text-sm text-gray-600">Milestones Achieved</div>
                  <div className="text-xs text-gray-500">of {(currentWeekData.milestones || []).length}</div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">{getWeekProgress(currentWeekData)}%</div>
                  <div className="text-sm text-gray-600">Week Progress</div>
                  <div className="text-xs text-gray-500">Overall completion</div>
                </div>

                {currentWeekData.hours && (
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-orange-600">{currentWeekData.hours}h</div>
                    <div className="text-sm text-gray-600">Estimated Time</div>
                    <div className="text-xs text-gray-500">This week</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyLearningPlan;