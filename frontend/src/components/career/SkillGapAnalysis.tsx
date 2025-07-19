import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useProfileStore } from '../../stores/profileStore';
import Button from '../ui/Button';
import LoadingSpinner from '../LoadingSpinner';
import { 
  TrendingUp, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Star,
  Clock,
  Target,
  Save,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SkillGapAnalysisProps {
  targetRole: string;
  onClose: () => void;
}

interface SkillGapData {
  missingSkills: string[];
  skillsToImprove: string[];
  strongSkills: string[];
  learningPriority: {
    skill: string;
    priority: 'High' | 'Medium' | 'Low';
    reason: string;
    timeToLearn: string;
  }[];
  recommendations: string;
}

const SkillGapAnalysis: React.FC<SkillGapAnalysisProps> = ({ targetRole, onClose }) => {
  const { profile, updateProfile } = useProfileStore();
  const [analysis, setAnalysis] = useState<SkillGapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [completedSkills, setCompletedSkills] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (targetRole) {
      analyzeSkillGap();
    }
  }, [targetRole]);

  const analyzeSkillGap = async () => {
    if (!targetRole.trim()) {
      toast.error('Please enter a target role first');
      return;
    }

    setLoading(true);
    try {
      const response = await api.analyzeSkillGap(targetRole);
      if (response.success) {
        setAnalysis(response.analysis);
        toast.success('Skill gap analysis completed!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to analyze skill gap');
    } finally {
      setLoading(false);
    }
  };

  const saveAnalysis = async () => {
    if (!analysis || !profile) return;

    try {
      // Save the analysis to the user's profile
      const updatedProfile = {
        ...profile,
        skillGapAnalysis: {
          targetRole,
          analysis,
          completedSkills: Array.from(completedSkills),
          analyzedAt: new Date().toISOString()
        }
      };

      await updateProfile(updatedProfile);
      setIsSaved(true);
      toast.success('Skill gap analysis saved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save analysis');
    }
  };

  const toggleSkillCompletion = (skill: string) => {
    const newCompleted = new Set(completedSkills);
    if (newCompleted.has(skill)) {
      newCompleted.delete(skill);
    } else {
      newCompleted.add(skill);
    }
    setCompletedSkills(newCompleted);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressPercentage = () => {
    if (!analysis) return 0;
    const totalSkills = analysis.missingSkills.length + analysis.skillsToImprove.length;
    if (totalSkills === 0) return 100;
    return Math.round((completedSkills.size / totalSkills) * 100);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Skill Gap Analysis</h2>
                <p className="text-gray-600">For {targetRole}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {analysis && !isSaved && (
                <Button onClick={saveAnalysis} icon={<Save className="w-4 h-4" />}>
                  Save Analysis
                </Button>
              )}
              {isSaved && (
                <div className="flex items-center text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Saved</span>
                </div>
              )}
              <Button variant="ghost" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <LoadingSpinner size="lg" className="mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Your Skills</h3>
              <p className="text-gray-600">Our AI is comparing your current skills with {targetRole} requirements...</p>
            </div>
          ) : analysis ? (
            <div className="space-y-8">
              {/* Progress Overview */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
                  <div className="text-2xl font-bold text-blue-600">{getProgressPercentage()}%</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
                <p className="text-gray-600">
                  {completedSkills.size} of {analysis.missingSkills.length + analysis.skillsToImprove.length} skills completed
                </p>
              </div>

              {/* Skills Overview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Missing Skills */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <h4 className="font-semibold text-red-900">Missing Skills</h4>
                  </div>
                  <div className="space-y-3">
                    {analysis.missingSkills?.map((skill) => (
                      <div key={skill} className="flex items-center justify-between">
                        <span className="text-sm text-red-700">{skill}</span>
                        <button
                          onClick={() => toggleSkillCompletion(skill)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            completedSkills.has(skill)
                              ? 'bg-green-500 border-green-500'
                              : 'border-red-300 hover:border-red-400'
                          }`}
                        >
                          {completedSkills.has(skill) && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills to Improve */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="w-5 h-5 text-yellow-600 mr-2" />
                    <h4 className="font-semibold text-yellow-900">Skills to Improve</h4>
                  </div>
                  <div className="space-y-3">
                    {analysis.skillsToImprove?.map((skill) => (
                      <div key={skill} className="flex items-center justify-between">
                        <span className="text-sm text-yellow-700">{skill}</span>
                        <button
                          onClick={() => toggleSkillCompletion(skill)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            completedSkills.has(skill)
                              ? 'bg-green-500 border-green-500'
                              : 'border-yellow-300 hover:border-yellow-400'
                          }`}
                        >
                          {completedSkills.has(skill) && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strong Skills */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <Star className="w-5 h-5 text-green-600 mr-2" />
                    <h4 className="font-semibold text-green-900">Strong Skills</h4>
                  </div>
                  <div className="space-y-2">
                    {analysis.strongSkills?.map((skill) => (
                      <div key={skill} className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm text-green-700">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Learning Priority */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-6 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  Learning Priority
                </h4>
                <div className="space-y-4">
                  {analysis.learningPriority?.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900">{item.skill}</h5>
                            <div className="flex items-center mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                                {item.priority} Priority
                              </span>
                              <span className="text-sm text-gray-500 ml-3 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {item.timeToLearn}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleSkillCompletion(item.skill)}
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                            completedSkills.has(item.skill)
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {completedSkills.has(item.skill) && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 ml-11">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-purple-600" />
                  AI Recommendations
                </h4>
                <p className="text-gray-700 leading-relaxed">{analysis.recommendations}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <Button 
                  onClick={onClose}
                  className="flex-1"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Create Learning Plan
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.open('https://www.google.com/search?q=' + encodeURIComponent(`${targetRole} skills learning resources`), '_blank')}
                  className="flex-1"
                >
                  Find Resources
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analysis Available</h3>
              <p className="text-gray-600 mb-4">Enter a target role to get started with skill gap analysis.</p>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillGapAnalysis;