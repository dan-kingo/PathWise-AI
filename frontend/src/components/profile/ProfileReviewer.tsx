import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import LoadingSpinner from '../LoadingSpinner';
import LinkedInDataForm from './LinkedInDataForm';
import { 
  Search, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Target, 
  Award, 
  BarChart3,
  Clock,
  Star,
  Trash2,
  Edit3,
  Save,
  X,
  Eye,
  Github,
  Linkedin,
  ArrowRight,
  Lightbulb,
  Flag,
  Calendar,
  Users,
  Zap,
  Info,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileAnalysis {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: {
    category: string;
    priority: 'high' | 'medium' | 'low';
    suggestion: string;
    impact: string;
  }[];
  industryBenchmarks: {
    metric: string;
    userScore: number;
    industryAverage: number;
    recommendation: string;
  }[];
  actionPlan: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

interface ProfileReview {
  _id: string;
  profileUrl: string;
  profileType: 'linkedin' | 'github';
  analysisResult: ProfileAnalysis;
  additionalContext?: string;
  linkedinData?: any;
  notes?: string;
  completedSuggestions?: string[];
  analyzedAt: string;
  lastUpdated: string;
}

interface ProfileInsights {
  totalReviews: number;
  averageScore: number;
  improvementTrend: {
    date: string;
    score: number;
    profileType: string;
  }[];
  topSuggestions: {
    category: string;
    count: number;
  }[];
  completionRate: number;
}

interface LinkedInData {
  headline?: string;
  summary?: string;
  experience?: Array<{
    title: string;
    company: string;
    duration: string;
    description?: string;
  }>;
  education?: Array<{
    school: string;
    degree: string;
    field: string;
    year?: string;
  }>;
  skills?: string[];
  recommendations?: number;
  connections?: string;
  posts?: Array<{
    content: string;
    engagement: number;
  }>;
}

const ProfileReviewer: React.FC = () => {
  const [profileUrl, setProfileUrl] = useState('');
  const [profileType, setProfileType] = useState<'linkedin' | 'github'>('linkedin');
  const [additionalContext, setAdditionalContext] = useState('');
  const [linkedinData, setLinkedinData] = useState<LinkedInData>({});
  const [showLinkedInForm, setShowLinkedInForm] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<ProfileAnalysis | null>(null);
  const [reviews, setReviews] = useState<ProfileReview[]>([]);
  const [insights, setInsights] = useState<ProfileInsights | null>(null);
  const [selectedReview, setSelectedReview] = useState<ProfileReview | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');
  const [completedSuggestions, setCompletedSuggestions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'analyze' | 'reviews' | 'insights'>('analyze');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReviews();
    loadInsights();
  }, []);

  useEffect(() => {
    // Reset LinkedIn data when switching profile types
    if (profileType === 'github') {
      setShowLinkedInForm(false);
      setLinkedinData({});
    }
  }, [profileType]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await api.getProfileReviews();
      if (response.success) {
        setReviews(response.reviews);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInsights = async () => {
    try {
      const response = await api.getProfileInsights();
      if (response.success) {
        setInsights(response.insights);
      }
    } catch (error) {
      console.error('Failed to load insights:', error);
    }
  };

  const analyzeProfile = async () => {
    if (!profileUrl.trim()) {
      toast.error('Please enter a profile URL');
      return;
    }

    // Basic URL validation
    try {
      const url = new URL(profileUrl);
      if (profileType === 'linkedin' && !url.hostname.includes('linkedin.com')) {
        toast.error('Please enter a valid LinkedIn profile URL');
        return;
      }
      if (profileType === 'github' && !url.hostname.includes('github.com')) {
        toast.error('Please enter a valid GitHub profile URL');
        return;
      }
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    // For LinkedIn, check if we have required data
    if (profileType === 'linkedin') {
      const hasRequiredData = linkedinData.headline && 
                             linkedinData.summary && 
                             linkedinData.experience && 
                             linkedinData.experience.length > 0 &&
                             linkedinData.skills && 
                             linkedinData.skills.length > 0;

      if (!hasRequiredData) {
        setShowLinkedInForm(true);
        toast.error('LinkedIn analysis requires additional profile information. Please fill out the form below.');
        return;
      }
    }

    setIsAnalyzing(true);
    try {
      const requestData: any = {
        profileUrl,
        profileType,
        additionalContext
      };

      if (profileType === 'linkedin') {
        requestData.linkedinData = linkedinData;
      }

      const response = await api.analyzeProfile(requestData.profileUrl, requestData.profileType, requestData.additionalContext, requestData.linkedinData);
      
      if (response.success) {
        setCurrentAnalysis(response.analysis);
        toast.success('Profile analysis completed!');
        
        // Refresh reviews and insights
        await loadReviews();
        await loadInsights();
        
        // Clear form
        setProfileUrl('');
        setAdditionalContext('');
        setLinkedinData({});
        setShowLinkedInForm(false);
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
      
      if (error.requiresLinkedInData) {
        setShowLinkedInForm(true);
        toast.error('LinkedIn analysis requires additional profile information. Please fill out the form below.');
      } else if (error.message.includes('GitHub')) {
        toast.error('Unable to access GitHub profile. Please ensure the profile is public and the username is correct.');
      } else {
        toast.error(error.message || 'Failed to analyze profile');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await api.deleteProfileReview(reviewId);
      toast.success('Review deleted successfully');
      await loadReviews();
      await loadInsights();
      if (selectedReview?._id === reviewId) {
        setSelectedReview(null);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete review');
    }
  };

  const startEditingNotes = (review: ProfileReview) => {
    setEditingNotes(review._id);
    setNotesText(review.notes || '');
    setCompletedSuggestions(review.completedSuggestions || []);
  };

  const saveNotes = async (reviewId: string) => {
    try {
      await api.updateReviewNotes(reviewId, notesText, completedSuggestions);
      toast.success('Notes updated successfully');
      setEditingNotes(null);
      await loadReviews();
      
      // Update selected review if it's the one being edited
      if (selectedReview?._id === reviewId) {
        const updatedReview = reviews.find(r => r._id === reviewId);
        if (updatedReview) {
          setSelectedReview({
            ...updatedReview,
            notes: notesText,
            completedSuggestions
          });
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update notes');
    }
  };

  const cancelEditingNotes = () => {
    setEditingNotes(null);
    setNotesText('');
    setCompletedSuggestions([]);
  };

  const toggleSuggestionCompletion = (suggestion: string) => {
    if (completedSuggestions.includes(suggestion)) {
      setCompletedSuggestions(completedSuggestions.filter(s => s !== suggestion));
    } else {
      setCompletedSuggestions([...completedSuggestions, suggestion]);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Flag className="w-4 h-4 text-red-600" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Flag className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderAnalysisResults = (analysis: ProfileAnalysis) => (
    <div className="space-y-8">
      {/* Overall Score */}
      <div className="text-center">
        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
          {analysis.overallScore}
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mt-4">Overall Profile Score</h3>
        <p className="text-gray-600">
          {analysis.overallScore >= 80 ? 'Excellent profile!' : 
           analysis.overallScore >= 60 ? 'Good profile with room for improvement' : 
           'Profile needs significant improvements'}
        </p>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <h4 className="font-semibold text-green-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Strengths
          </h4>
          <ul className="space-y-2">
            {analysis.strengths.map((strength, index) => (
              <li key={index} className="text-green-800 flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                {strength}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <h4 className="font-semibold text-red-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Areas for Improvement
          </h4>
          <ul className="space-y-2">
            {analysis.weaknesses.map((weakness, index) => (
              <li key={index} className="text-red-800 flex items-start">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                {weakness}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggestions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-6 flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-blue-600" />
          Improvement Suggestions
        </h4>
        <div className="space-y-4">
          {analysis.suggestions.map((suggestion, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  {getPriorityIcon(suggestion.priority)}
                  <span className="font-medium text-gray-900 ml-2">{suggestion.category}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(suggestion.priority)}`}>
                  {suggestion.priority} priority
                </span>
              </div>
              <p className="text-gray-700 mb-2">{suggestion.suggestion}</p>
              <p className="text-sm text-gray-600 italic">Impact: {suggestion.impact}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Industry Benchmarks */}
      {analysis.industryBenchmarks && analysis.industryBenchmarks.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
            Industry Benchmarks
          </h4>
          <div className="space-y-4">
            {analysis.industryBenchmarks.map((benchmark, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{benchmark.metric}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">You: {benchmark.userScore}</span>
                    <span className="text-sm text-gray-600">Industry: {benchmark.industryAverage}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min((benchmark.userScore / benchmark.industryAverage) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">{benchmark.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Plan */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-6 flex items-center">
          <Target className="w-5 h-5 mr-2 text-green-600" />
          Action Plan
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <h5 className="font-medium text-red-900 mb-3 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Immediate (Today)
            </h5>
            <ul className="space-y-2">
              {analysis.actionPlan.immediate.map((action, index) => (
                <li key={index} className="text-red-800 text-sm flex items-start">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                  {action}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h5 className="font-medium text-yellow-900 mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Short-term (1-2 weeks)
            </h5>
            <ul className="space-y-2">
              {analysis.actionPlan.shortTerm.map((action, index) => (
                <li key={index} className="text-yellow-800 text-sm flex items-start">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                  {action}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h5 className="font-medium text-green-900 mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Long-term (1-3 months)
            </h5>
            <ul className="space-y-2">
              {analysis.actionPlan.longTerm.map((action, index) => (
                <li key={index} className="text-green-800 text-sm flex items-start">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Search className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Profile Reviewer</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Get AI-powered insights to optimize your LinkedIn and GitHub profiles for maximum professional impact
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { id: 'analyze', label: 'Analyze Profile', icon: Search },
            { id: 'reviews', label: 'My Reviews', icon: Eye },
            { id: 'insights', label: 'Insights', icon: BarChart3 }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Analyze Tab */}
      {activeTab === 'analyze' && (
        <div className="space-y-8">
          {/* Analysis Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-4xl mx-auto">
            <div className="flex items-center mb-8">
              <Search className="w-6 h-6 mr-3 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Analyze Your Profile</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Profile URL"
                    value={profileUrl}
                    onChange={(e) => setProfileUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile or https://github.com/yourusername"
                    icon={<ExternalLink className="w-5 h-5 text-gray-400" />}
                  />
                </div>
                <Select
                  label="Profile Type"
                  value={profileType}
                  onChange={(e) => setProfileType(e.target.value as 'linkedin' | 'github')}
                  options={[
                    { value: 'linkedin', label: 'LinkedIn' },
                    { value: 'github', label: 'GitHub' }
                  ]}
                />
              </div>

              {/* Profile Type Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">
                      {profileType === 'github' ? 'GitHub Analysis' : 'LinkedIn Analysis'}
                    </h4>
                    <p className="text-blue-800 text-sm">
                      {profileType === 'github' 
                        ? 'We\'ll analyze your public GitHub profile including repositories, activity, and code quality automatically.'
                        : 'LinkedIn analysis requires additional profile information to provide accurate insights. You\'ll need to provide details about your experience, skills, and other profile sections.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <Textarea
                label="Additional Context (Optional)"
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="Provide any additional context about your career goals, target roles, or specific areas you'd like feedback on..."
                rows={3}
              />

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={analyzeProfile}
                  loading={isAnalyzing}
                  className="flex-1 py-4 text-lg"
                  icon={profileType === 'linkedin' ? <Linkedin className="w-5 h-5" /> : <Github className="w-5 h-5" />}
                >
                  {isAnalyzing ? 'Analyzing Profile...' : `Analyze ${profileType === 'linkedin' ? 'LinkedIn' : 'GitHub'} Profile`}
                </Button>
              </div>
            </div>
          </div>

          {/* LinkedIn Data Form */}
          {showLinkedInForm && profileType === 'linkedin' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Linkedin className="w-6 h-6 mr-3 text-blue-600" />
                  <h2 className="text-2xl font-semibold text-gray-900">LinkedIn Profile Information</h2>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowLinkedInForm(false)}
                  icon={<X className="w-5 h-5" />}
                >
                  Cancel
                </Button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-yellow-900 mb-1">Why do we need this information?</h4>
                    <p className="text-yellow-800 text-sm">
                      LinkedIn profiles are not publicly accessible via API. To provide accurate analysis, we need you to manually provide key information from your LinkedIn profile. This data is only used for analysis and is stored securely.
                    </p>
                  </div>
                </div>
              </div>

              <LinkedInDataForm
                data={linkedinData}
                onChange={setLinkedinData}
                onSubmit={() => {
                  setShowLinkedInForm(false);
                  analyzeProfile();
                }}
              />
            </div>
          )}

          {/* Current Analysis Results */}
          {currentAnalysis && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-semibold text-gray-900">Analysis Results</h2>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  Just now
                </div>
              </div>
              {renderAnalysisResults(currentAnalysis)}
            </div>
          )}
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-8">
          {loading ? (
            <div className="text-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600 mb-4">Start by analyzing your first profile to see AI-powered insights.</p>
              <Button onClick={() => setActiveTab('analyze')}>
                Analyze Profile
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Reviews List */}
              <div className="lg:col-span-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Reviews</h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      onClick={() => setSelectedReview(review)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        selectedReview?._id === review._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {review.profileType === 'linkedin' ? 
                            <Linkedin className="w-4 h-4 text-blue-600 mr-2" /> : 
                            <Github className="w-4 h-4 text-gray-900 mr-2" />
                          }
                          <span className="font-medium text-gray-900 capitalize">{review.profileType}</span>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(review.analysisResult.overallScore)}`}>
                          {review.analysisResult.overallScore}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 truncate mb-2">{review.profileUrl}</p>
                      <p className="text-xs text-gray-500">{formatDate(review.analyzedAt)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Review Details */}
              <div className="lg:col-span-2">
                {selectedReview ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        {selectedReview.profileType === 'linkedin' ? 
                          <Linkedin className="w-6 h-6 text-blue-600 mr-3" /> : 
                          <Github className="w-6 h-6 text-gray-900 mr-3" />
                        }
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 capitalize">
                            {selectedReview.profileType} Profile Review
                          </h3>
                          <p className="text-sm text-gray-600">{formatDate(selectedReview.analyzedAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(selectedReview.profileUrl, '_blank')}
                          icon={<ExternalLink className="w-4 h-4" />}
                        >
                          View Profile
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditingNotes(selectedReview)}
                          icon={<Edit3 className="w-4 h-4" />}
                        >
                          Edit Notes
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteReview(selectedReview._id)}
                          icon={<Trash2 className="w-4 h-4" />}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    {/* Notes Section */}
                    {editingNotes === selectedReview._id ? (
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Notes & Progress</h4>
                        <Textarea
                          value={notesText}
                          onChange={(e) => setNotesText(e.target.value)}
                          placeholder="Add your notes about this review..."
                          rows={3}
                          className="mb-4"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Mark completed suggestions: {completedSuggestions.length} of {selectedReview.analysisResult.suggestions.length}
                          </span>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={cancelEditingNotes}
                              icon={<X className="w-4 h-4" />}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => saveNotes(selectedReview._id)}
                              icon={<Save className="w-4 h-4" />}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : selectedReview.notes && (
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Your Notes</h4>
                        <p className="text-gray-700">{selectedReview.notes}</p>
                        {selectedReview.completedSuggestions && selectedReview.completedSuggestions.length > 0 && (
                          <p className="text-sm text-gray-600 mt-2">
                            Completed: {selectedReview.completedSuggestions.length} of {selectedReview.analysisResult.suggestions.length} suggestions
                          </p>
                        )}
                      </div>
                    )}

                    {renderAnalysisResults(selectedReview.analysisResult)}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Review</h3>
                    <p className="text-gray-600">Choose a review from the list to view detailed analysis.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-8">
          {insights ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stats Cards */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{insights.totalReviews}</div>
                <div className="text-sm text-gray-600">Total Reviews</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{insights.averageScore}</div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{insights.completionRate}%</div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {insights.improvementTrend.length > 1 ? 
                    (insights.improvementTrend[0].score - insights.improvementTrend[insights.improvementTrend.length - 1].score > 0 ? '+' : '') +
                    Math.round(insights.improvementTrend[0].score - insights.improvementTrend[insights.improvementTrend.length - 1].score) : 
                    '0'
                  }
                </div>
                <div className="text-sm text-gray-600">Score Change</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Insights Available</h3>
              <p className="text-gray-600 mb-4">Analyze some profiles to see your improvement insights.</p>
              <Button onClick={() => setActiveTab('analyze')}>
                Analyze Profile
              </Button>
            </div>
          )}

          {/* Top Suggestions */}
          {insights && insights.topSuggestions.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
                Most Common Improvement Areas
              </h3>
              <div className="space-y-4">
                {insights.topSuggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{suggestion.category}</span>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-3">{suggestion.count} times</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(suggestion.count / insights.totalReviews) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileReviewer;