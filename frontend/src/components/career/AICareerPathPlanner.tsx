import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../../stores/profileStore';
import { api } from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import LoadingSpinner from '../LoadingSpinner';
import { 
  Sparkles, 
  Target, 
  Clock, 
  BookOpen, 
  CheckCircle, 
  Play, 
  Save,
  Brain,
  TrendingUp,
  Users,
  DollarSign,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Star,
  Award,
  Calendar,
  BarChart3,
  ArrowRight,
  Zap,
  Turtle,
  Gauge
} from 'lucide-react';
import toast from 'react-hot-toast';

interface WeeklyPlan {
  week: number;
  title: string;
  description: string;
  skills: string[];
  resources: {
    title: string;
    type: 'video' | 'article' | 'course' | 'practice' | 'project';
    url: string;
    duration: string;
    description: string;
    source: string;
    difficulty?: string;
    rating?: string;
  }[];
  milestones: string[];
  projects: string[];
}

interface CareerPath {
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  totalWeeks: number;
  prerequisites: string[];
  outcomes: string[];
  skillsToLearn: string[];
  weeklyPlan: WeeklyPlan[];
  marketDemand: string;
  averageSalary: string;
  jobTitles: string[];
}

const AICareerPathPlanner: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useProfileStore();
  const [targetRole, setTargetRole] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [pace, setPace] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [customInterests, setCustomInterests] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPath, setGeneratedPath] = useState<CareerPath | null>(null);
  const [savedPath, setSavedPath] = useState<CareerPath | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const [isPathSaved, setIsPathSaved] = useState(false);

  useEffect(() => {
    // Load saved career path on component mount
    loadSavedCareerPath();
    
    // Pre-fill form with profile data
    if (profile) {
      setTargetRole(profile.careerGoals?.targetRole || '');
      setTimeframe(profile.careerGoals?.timeframe || '');
      setCustomSkills(profile.skills || []);
      setCustomInterests(profile.interests || []);
    }
  }, [profile]);

  const loadSavedCareerPath = async () => {
    try {
      const response = await api.getSavedCareerPath();
      if (response.success) {
        setSavedPath(response.careerPath);
      }
    } catch (error) {
      console.log('No saved career path found');
    }
  };

  const addCustomSkill = () => {
    if (skillInput.trim() && !customSkills.includes(skillInput.trim())) {
      setCustomSkills([...customSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeCustomSkill = (skill: string) => {
    setCustomSkills(customSkills.filter(s => s !== skill));
  };

  const addCustomInterest = () => {
    if (interestInput.trim() && !customInterests.includes(interestInput.trim())) {
      setCustomInterests([...customInterests, interestInput.trim()]);
      setInterestInput('');
    }
  };

  const removeCustomInterest = (interest: string) => {
    setCustomInterests(customInterests.filter(i => i !== interest));
  };

  const generateCareerPath = async () => {
    if (!targetRole.trim()) {
      toast.error('Please enter a target role');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await api.generateCareerPath({
        targetRole,
        timeframe,
        pace,
        customSkills,
        customInterests
      });

      if (response.success) {
        setGeneratedPath(response.careerPath);
        setIsPathSaved(false);
        toast.success('Career path generated successfully!');
        
        // Expand first week by default
        setExpandedWeeks(new Set([1]));
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate career path');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveCareerPath = async () => {
    if (!generatedPath) return;

    try {
      await api.saveCareerPath(generatedPath);
      setSavedPath(generatedPath);
      setIsPathSaved(true);
      toast.success('Career path saved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save career path');
    }
  };

  const startLearningPlan = () => {
    if (generatedPath || savedPath) {
      navigate('/learning-plan');
    } else {
      toast.error('Please generate or load a career path first');
    }
  };

  const toggleWeekExpansion = (week: number) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(week)) {
      newExpanded.delete(week);
    } else {
      newExpanded.add(week);
    }
    setExpandedWeeks(newExpanded);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getPaceIcon = (paceValue: string) => {
    switch (paceValue) {
      case 'slow': return <Turtle className="w-4 h-4" />;
      case 'fast': return <Zap className="w-4 h-4" />;
      default: return <Gauge className="w-4 h-4" />;
    }
  };

  const openResource = (url: string) => {
    if (url.startsWith('http')) {
      window.open(url, '_blank');
    } else if (url.startsWith('Search:')) {
      const searchTerm = url.replace('Search:', '').trim();
      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`, '_blank');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Career Path Planner</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Get a personalized, AI-generated learning roadmap tailored to your goals, skills, and learning pace
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Brain className="w-6 h-6 mr-3 text-purple-600" />
          <h2 className="text-2xl font-semibold text-gray-900">Tell us about your career goals</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Input
            label="Target Role"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g., UI Designer, Data Scientist, Frontend Developer"
            icon={<Target className="w-5 h-5 text-gray-400" />}
          />

          <Select
            label="Timeframe"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            options={[
              { value: '', label: 'Select timeframe' },
              { value: '4 weeks', label: '4 weeks (Intensive)' },
              { value: '8 weeks', label: '8 weeks (Recommended)' },
              { value: '12 weeks', label: '12 weeks (Comprehensive)' },
              { value: '6 months', label: '6 months (In-depth)' },
            ]}
          />
        </div>

        {/* Learning Pace */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Learning Pace
          </label>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: 'slow', label: 'Relaxed', description: '50% more time', icon: <Turtle className="w-5 h-5" /> },
              { value: 'normal', label: 'Normal', description: 'Standard pace', icon: <Gauge className="w-5 h-5" /> },
              { value: 'fast', label: 'Intensive', description: '25% less time', icon: <Zap className="w-5 h-5" /> }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPace(option.value as 'slow' | 'normal' | 'fast')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  pace === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  {option.icon}
                </div>
                <div className="text-sm font-medium text-gray-900">{option.label}</div>
                <div className="text-xs text-gray-500">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Skills */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Your Current Skills
          </label>
          <div className="flex gap-3 mb-4">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Add a skill you already have"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
            />
            <Button type="button" onClick={addCustomSkill} variant="outline">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {customSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-3 py-2 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200 transition-colors"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeCustomSkill(skill)}
                  className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Custom Interests */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Your Interests
          </label>
          <div className="flex gap-3 mb-4">
            <Input
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              placeholder="Add an interest or area you're curious about"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomInterest())}
            />
            <Button type="button" onClick={addCustomInterest} variant="outline">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {customInterests.map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center px-3 py-2 rounded-full text-sm bg-green-100 text-green-800 border border-green-200 hover:bg-green-200 transition-colors"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => removeCustomInterest(interest)}
                  className="ml-2 text-green-600 hover:text-green-800 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={generateCareerPath}
            loading={isGenerating}
            className="flex-1 py-4 text-lg"
            icon={<Sparkles className="w-5 h-5" />}
          >
            {isGenerating ? 'Generating Path...' : 'Generate AI Career Path'}
          </Button>
        </div>
      </div>

      {/* Generated Career Path */}
      {generatedPath && (
        <div className="space-y-8">
          {/* Path Overview */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{generatedPath.title}</h2>
                <p className="text-lg text-gray-600">{generatedPath.description}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                {!isPathSaved && (
                  <Button
                    onClick={saveCareerPath}
                    icon={<Save className="w-5 h-5" />}
                    variant="outline"
                  >
                    Save Path
                  </Button>
                )}
                {isPathSaved && (
                  <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-medium">Path Saved</span>
                  </div>
                )}
                <Button
                  onClick={startLearningPlan}
                  icon={<ArrowRight className="w-5 h-5" />}
                >
                  Start Learning Plan
                </Button>
              </div>
            </div>

            {/* Path Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-lg font-bold text-gray-900">{generatedPath.duration}</div>
                <div className="text-sm text-gray-600">Duration</div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                <Target className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <div className="text-lg font-bold text-gray-900">{generatedPath.totalWeeks} weeks</div>
                <div className="text-sm text-gray-600">Total Weeks</div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <div className="text-lg font-bold text-gray-900">{generatedPath.marketDemand?.split(' ')[0] || 'High'}</div>
                <div className="text-sm text-gray-600">Market Demand</div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                <DollarSign className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
                <div className="text-lg font-bold text-gray-900">{generatedPath.averageSalary}</div>
                <div className="text-sm text-gray-600">Avg Salary</div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200">
                {getPaceIcon(pace)}
                <div className="text-lg font-bold text-gray-900 capitalize">{pace}</div>
                <div className="text-sm text-gray-600">Learning Pace</div>
              </div>
            </div>

            {/* Difficulty Badge */}
            <div className="flex items-center gap-4 mb-8">
              <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getDifficultyColor(generatedPath.difficulty)}`}>
                <Award className="w-4 h-4 inline mr-2" />
                {generatedPath.difficulty}
              </span>
            </div>

            {/* Prerequisites, Outcomes, Skills */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Prerequisites
                </h4>
                <ul className="space-y-3">
                  {(generatedPath.prerequisites || []).map((prereq, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      {prereq}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  Learning Outcomes
                </h4>
                <ul className="space-y-3">
                  {(generatedPath.outcomes || []).map((outcome, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-purple-600" />
                  Skills You'll Learn
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(generatedPath.skillsToLearn || []).map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Job Titles */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-orange-600" />
                Related Job Titles
              </h4>
              <div className="flex flex-wrap gap-3">
                {(generatedPath.jobTitles || []).map((title, index) => (
                  <span key={index} className="px-4 py-2 bg-white text-gray-800 text-sm rounded-lg border border-gray-200 font-medium">
                    {title}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly Plan Preview */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-blue-600" />
                <h3 className="text-2xl font-semibold text-gray-900">Weekly Learning Plan Preview</h3>
              </div>
              <Button
                onClick={startLearningPlan}
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Start Learning Plan
              </Button>
            </div>
            
            <div className="space-y-4">
              {(generatedPath.weeklyPlan || []).slice(0, 3).map((week) => (
                <div key={week.week} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                        {week.week}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          Week {week.week}: {week.title}
                        </h4>
                        <p className="text-gray-600 mt-1">{week.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Skills Focus</h5>
                      <div className="flex flex-wrap gap-1">
                        {(week.skills || []).slice(0, 3).map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Resources</h5>
                      <p className="text-sm text-gray-600">{(week.resources || []).length} learning resources</p>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Projects</h5>
                      <p className="text-sm text-gray-600">{(week.projects || []).length} hands-on projects</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {(generatedPath.weeklyPlan || []).length > 3 && (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">
                    And {(generatedPath.weeklyPlan || []).length - 3} more weeks of structured learning...
                  </p>
                  <Button
                    onClick={startLearningPlan}
                    icon={<ArrowRight className="w-5 h-5" />}
                  >
                    View Complete Learning Plan
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Saved Career Path */}
      {savedPath && !generatedPath && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Save className="w-5 h-5 mr-2 text-blue-600" />
              Your Saved Career Path
            </h3>
            <div className="flex gap-3">
              <Button
                onClick={() => setGeneratedPath(savedPath)}
                variant="outline"
                size="sm"
              >
                View Details
              </Button>
              <Button
                onClick={startLearningPlan}
                size="sm"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Start Learning Plan
              </Button>
            </div>
          </div>
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
            <h4 className="font-semibold text-blue-900 text-lg">{savedPath.title}</h4>
            <p className="text-blue-700 mt-2">{savedPath.description}</p>
            <div className="flex items-center gap-6 mt-4 text-sm text-blue-600">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {savedPath.duration}
              </span>
              <span className="flex items-center">
                <Award className="w-4 h-4 mr-1" />
                {savedPath.difficulty}
              </span>
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {savedPath.totalWeeks} weeks
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 max-w-4xl mx-auto text-center">
          <LoadingSpinner size="lg" className="mb-6" />
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">Generating Your Personalized Career Path</h3>
          <p className="text-gray-600 text-lg mb-4">
            Our AI is analyzing your profile and creating a customized learning roadmap...
          </p>
          <div className="bg-gray-100 rounded-lg p-4 text-left max-w-md mx-auto">
            <div className="text-sm text-gray-700 space-y-2">
              <div>✓ Analyzing your current skills: {customSkills.slice(0, 3).join(', ')}</div>
              <div>✓ Considering your interests: {customInterests.slice(0, 2).join(', ')}</div>
              <div>✓ Tailoring content for {targetRole}</div>
              <div>✓ Adjusting for {pace} learning pace</div>
              <div>⏳ Generating {timeframe} learning plan...</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICareerPathPlanner;