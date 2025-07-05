import React, { useEffect, useState } from 'react';
import { useCareerStore, mockCareerPaths } from '../../stores/careerStore';
import { useProfileStore } from '../../stores/profileStore';
import { Clock, Users, BookOpen, Target, ChevronRight, Play, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';

const CareerPathPlanner: React.FC = () => {
  const { 
    availablePaths, 
    recommendedPaths, 
    selectedPath, 
    setAvailablePaths, 
    setSelectedPath, 
    generateRecommendations 
  } = useCareerStore();
  
  const { profile } = useProfileStore();
  const [activeTab, setActiveTab] = useState<'recommended' | 'all'>('recommended');

  useEffect(() => {
    // Initialize with mock data
    setAvailablePaths(mockCareerPaths);
    
    // Generate recommendations based on profile
    if (profile) {
      generateRecommendations(profile);
    }
  }, [profile, setAvailablePaths, generateRecommendations]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const PathCard: React.FC<{ path: any; isRecommended?: boolean }> = ({ path, isRecommended }) => (
    <div className="card hover:shadow-xl transition-all duration-300 cursor-pointer group"
         onClick={() => setSelectedPath(path)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {path.title}
            </h3>
            {isRecommended && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                Recommended
              </span>
            )}
          </div>
          <p className="text-gray-600 mb-4">{path.description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
      </div>

      <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{path.duration}</span>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(path.difficulty)}`}>
          {path.difficulty}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Skills you'll learn:</p>
        <div className="flex flex-wrap gap-1">
          {path.skills.slice(0, 4).map((skill: string) => (
            <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              {skill}
            </span>
          ))}
          {path.skills.length > 4 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              +{path.skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <BookOpen className="w-4 h-4" />
          <span>{path.roadmap.length} weeks</span>
        </div>
        <Button size="sm" variant="outline">
          View Details
        </Button>
      </div>
    </div>
  );

  const PathDetails: React.FC<{ path: any }> = ({ path }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setSelectedPath(null)}>
          ← Back to Paths
        </Button>
        <Button>
          Start Learning Path
        </Button>
      </div>

      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{path.title}</h1>
            <p className="text-lg text-gray-600 mb-4">{path.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{path.duration}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(path.difficulty)}`}>
                {path.difficulty}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Prerequisites</h3>
            <ul className="space-y-1">
              {path.prerequisites.map((prereq: string) => (
                <li key={prereq} className="text-sm text-blue-700 flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  {prereq}
                </li>
              ))}
            </ul>
          </div>

          <div className="card bg-green-50 border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">Skills You'll Learn</h3>
            <div className="flex flex-wrap gap-1">
              {path.skills.map((skill: string) => (
                <span key={skill} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="card bg-purple-50 border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-2">Outcomes</h3>
            <ul className="space-y-1">
              {path.outcomes.map((outcome: string) => (
                <li key={outcome} className="text-sm text-purple-700 flex items-center gap-2">
                  <Target className="w-3 h-3" />
                  {outcome}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Learning Roadmap</h2>
          <div className="space-y-6">
            {path.roadmap.map((week: any) => (
              <div key={week.week} className="card border-l-4 border-blue-500">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Week {week.week}: {week.title}
                    </h3>
                    <p className="text-gray-600">{week.description}</p>
                  </div>
                  <Button size="sm" variant="outline" icon={<Play className="w-4 h-4" />}>
                    Start Week
                  </Button>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Resources:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {week.resources.map((resource: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                          resource.type === 'video' ? 'bg-red-500' :
                          resource.type === 'course' ? 'bg-blue-500' :
                          resource.type === 'article' ? 'bg-green-500' :
                          'bg-purple-500'
                        }`}>
                          {resource.type === 'video' ? '▶' :
                           resource.type === 'course' ? '📚' :
                           resource.type === 'article' ? '📄' : '💻'}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{resource.title}</p>
                          <p className="text-sm text-gray-500 capitalize">{resource.type} • {resource.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Milestones:</h4>
                  <ul className="space-y-1">
                    {week.milestones.map((milestone: string, index: number) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {milestone}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (selectedPath) {
    return <PathDetails path={selectedPath} />;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Career Path Planner</h1>
        <p className="text-gray-600">Discover personalized learning paths to achieve your career goals</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('recommended')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'recommended'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Recommended for You ({recommendedPaths.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Paths ({availablePaths.length})
          </button>
        </div>
      </div>

      {/* Recommended Paths */}
      {activeTab === 'recommended' && (
        <div>
          {recommendedPaths.length > 0 ? (
            <>
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h2 className="font-semibold text-blue-900 mb-1">Personalized Recommendations</h2>
                <p className="text-sm text-blue-700">
                  Based on your profile, we've found {recommendedPaths.length} career path{recommendedPaths.length !== 1 ? 's' : ''} that match your goals and interests.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedPaths.map((path) => (
                  <PathCard key={path.id} path={path} isRecommended />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recommendations Yet</h3>
              <p className="text-gray-600 mb-4">
                Complete your profile to get personalized career path recommendations.
              </p>
              <Button>Complete Profile</Button>
            </div>
          )}
        </div>
      )}

      {/* All Paths */}
      {activeTab === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availablePaths.map((path) => (
            <PathCard key={path.id} path={path} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CareerPathPlanner;