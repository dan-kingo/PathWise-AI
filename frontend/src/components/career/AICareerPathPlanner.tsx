import React, { useState, useEffect } from 'react';
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
  ChevronUp
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
  const { profile } = useProfileStore();
  const [targetRole, setTargetRole] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [customInterests, setCustomInterests] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPath, setGeneratedPath] = useState<CareerPath | null>(null);
  const [savedPath, setSavedPath] = useState<CareerPath | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const [skillGapAnalysis, setSkillGapAnalysis] = useState<any>(null);
  const [showSkillGap, setShowSkillGap] = useState(false);

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
      // No saved path found, which is fine
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
        customSkills,
        customInterests
      });

      if (response.success) {
        setGeneratedPath(response.careerPath);
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

  const analyzeSkillGap = async () => {
    if (!targetRole.trim()) {
      toast.error('Please enter a target role first');
      return;
    }

    try {
      const response = await api.analyzeSkillGap(targetRole);
      if (response.success) {
        setSkillGapAnalysis(response.analysis);
        setShowSkillGap(true);
        toast.success('Skill gap analysis completed!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to analyze skill gap');
    }
  };

  const saveCareerPath = async () => {
    if (!generatedPath) return;

    try {
      await api.saveCareerPath(generatedPath);
      setSavedPath(generatedPath);
      toast.success('Career path saved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save career path');
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

  const openResource = (url: string) => {
    if (url.startsWith('http')) {
      window.open(url, '_blank');
    } else if (url.startsWith('Search:')) {
      const searchTerm = url.replace('Search:', '').trim();
      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Career Path Planner</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Get a personalized, AI-generated learning roadmap tailored to your goals and current skills
        </p>
      </div>

      {/* Input Form */}
      <div className="card max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Brain className="w-5 h-5 mr-2 text-purple-600" />
          Tell us about your career goals
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

        {/* Custom Skills */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Current Skills
          </label>
          <div className="flex gap-2 mb-3">
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
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeCustomSkill(skill)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Custom Interests */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Interests
          </label>
          <div className="flex gap-2 mb-3">
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
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 border border-green-200"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => removeCustomInterest(interest)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={generateCareerPath}
            loading={isGenerating}
            className="flex-1"
            icon={<Sparkles className="w-4 h-4" />}
          >
            {isGenerating ? 'Generating Path...' : 'Generate AI Career Path'}
          </Button>
          
          <Button
            onClick={analyzeSkillGap}
            variant="outline"
            icon={<TrendingUp className="w-4 h-4" />}
          >
            Analyze Skill Gap
          </Button>
        </div>
      </div>

      {/* Skill Gap Analysis */}
      {showSkillGap && skillGapAnalysis && (
        <div className="card max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Skill Gap Analysis
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSkillGap(false)}
            >
              ×
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">Missing Skills</h4>
              <div className="space-y-1">
                {skillGapAnalysis.missingSkills?.map((skill: string) => (
                  <span key={skill} className="block text-sm text-red-700">{skill}</span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Skills to Improve</h4>
              <div className="space-y-1">
                {skillGapAnalysis.skillsToImprove?.map((skill: string) => (
                  <span key={skill} className="block text-sm text-yellow-700">{skill}</span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Strong Skills</h4>
              <div className="space-y-1">
                {skillGapAnalysis.strongSkills?.map((skill: string) => (
                  <span key={skill} className="block text-sm text-green-700">{skill}</span>
                ))}
              </div>
            </div>
          </div>

          {skillGapAnalysis.recommendations && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Recommendations</h4>
              <p className="text-sm text-blue-700">{skillGapAnalysis.recommendations}</p>
            </div>
          )}
        </div>
      )}

      {/* Generated Career Path */}
      {generatedPath && (
        <div className="space-y-6">
          {/* Path Overview */}
          <div className="card max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{generatedPath.title}</h2>
              <Button
                onClick={saveCareerPath}
                icon={<Save className="w-4 h-4" />}
                variant="outline"
              >
                Save Path
              </Button>
            </div>

            <p className="text-gray-600 mb-6">{generatedPath.description}</p>

            {/* Path Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900">{generatedPath.duration}</div>
                <div className="text-xs text-gray-500">Duration</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900">{generatedPath.totalWeeks} weeks</div>
                <div className="text-xs text-gray-500">Total Weeks</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900">{generatedPath.marketDemand.split(' ')[0]}</div>
                <div className="text-xs text-gray-500">Market Demand</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900">{generatedPath.averageSalary}</div>
                <div className="text-xs text-gray-500">Avg Salary</div>
              </div>
            </div>

            {/* Difficulty Badge */}
            <div className="flex items-center gap-4 mb-6">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(generatedPath.difficulty)}`}>
                {generatedPath.difficulty}
              </span>
            </div>

            {/* Prerequisites, Outcomes, Skills */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Prerequisites</h4>
                <ul className="space-y-2">
                  {generatedPath.prerequisites.map((prereq, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {prereq}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Learning Outcomes</h4>
                <ul className="space-y-2">
                  {generatedPath.outcomes.map((outcome, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <Target className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Skills You'll Learn</h4>
                <div className="flex flex-wrap gap-2">
                  {generatedPath.skillsToLearn.map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Job Titles */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Related Job Titles</h4>
              <div className="flex flex-wrap gap-2">
                {generatedPath.jobTitles.map((title, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-lg">
                    {title}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly Plan */}
          <div className="card max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Weekly Learning Plan</h3>
            
            <div className="space-y-4">
              {generatedPath.weeklyPlan.map((week) => (
                <div key={week.week} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleWeekExpansion(week.week)}
                    className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Week {week.week}: {week.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{week.description}</p>
                    </div>
                    {expandedWeeks.has(week.week) ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {expandedWeeks.has(week.week) && (
                    <div className="p-4 border-t border-gray-200">
                      {/* Skills for this week */}
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-900 mb-2">Skills Focus</h5>
                        <div className="flex flex-wrap gap-2">
                          {week.skills.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Resources */}
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-900 mb-3">Learning Resources</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {week.resources.map((resource, index) => (
                            <div key={index} className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center">
                                  <span className="text-lg mr-2">{getResourceIcon(resource.type)}</span>
                                  <div>
                                    <h6 className="font-medium text-gray-900 text-sm">{resource.title}</h6>
                                    <p className="text-xs text-gray-500">{resource.source} • {resource.duration}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => openResource(resource.url)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-xs text-gray-600">{resource.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Milestones */}
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-900 mb-2">Week Milestones</h5>
                        <ul className="space-y-1">
                          {week.milestones.map((milestone, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                              {milestone}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Projects */}
                      {week.projects.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Practice Projects</h5>
                          <ul className="space-y-1">
                            {week.projects.map((project, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-center">
                                <Play className="w-4 h-4 text-blue-500 mr-2" />
                                {project}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Saved Career Path */}
      {savedPath && !generatedPath && (
        <div className="card max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Saved Career Path</h3>
            <Button
              onClick={() => setGeneratedPath(savedPath)}
              variant="outline"
              size="sm"
            >
              View Details
            </Button>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900">{savedPath.title}</h4>
            <p className="text-sm text-blue-700 mt-1">{savedPath.description}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-blue-600">
              <span>{savedPath.duration}</span>
              <span>{savedPath.difficulty}</span>
              <span>{savedPath.totalWeeks} weeks</span>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className="card max-w-4xl mx-auto text-center py-12">
          <LoadingSpinner size="lg" className="mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Your Career Path</h3>
          <p className="text-gray-600">Our AI is analyzing your goals and creating a personalized learning roadmap...</p>
        </div>
      )}
    </div>
  );
};

export default AICareerPathPlanner;