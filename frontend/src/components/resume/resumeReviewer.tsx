import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import LoadingSpinner from '../LoadingSpinner';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Target, 
  BarChart3,
  Clock,
  Star,
  Trash2,
  Edit3,
  Save,
  X,
  Eye,
  Download,
  RefreshCw,
  FileCheck,
  AlertCircle,
  Zap,
  Users,
  Brain,
  Search,
  Calendar,
  Lightbulb,
  CheckSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ResumeAnalysis {
  overallScore: number;
  contentAnalysis: {
    totalWords: number;
    readabilityScore: number;
    grammarIssues: string[];
    spellingErrors: string[];
    toneAnalysis: string;
    clarityScore: number;
  };
  sectionAnalysis: Array<{
    section: string;
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    wordCount: number;
  }>;
  skillsAnalysis: {
    identifiedSkills: Array<{
      skill: string;
      relevance: 'high' | 'medium' | 'low';
      frequency: number;
      context: string;
    }>;
    skillsGap: string[];
    recommendedSkills: string[];
    technicalSkills: string[];
    softSkills: string[];
  };
  experienceAnalysis: {
    totalYears: number;
    careerProgression: string;
    achievementCount: number;
    quantifiedAchievements: number;
    actionVerbsUsed: string[];
    improvementSuggestions: string[];
  };
  atsAnalysis: {
    overallScore: number;
    keywordMatch: number;
    formatting: number;
    readability: number;
    recommendations: string[];
    missingKeywords: string[];
    foundKeywords: string[];
  };
  industryAnalysis: {
    targetIndustry: string;
    industryRelevance: number;
    industryKeywords: string[];
    competitorAnalysis: string;
    marketTrends: string[];
  };
  formattingAnalysis: {
    structure: string;
    consistency: number;
    visualAppeal: number;
    length: string;
    fontAnalysis: string;
    spacingAnalysis: string;
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    priorityActions: string[];
  };
  industryBenchmarks: Array<{
    metric: string;
    userScore: number;
    industryAverage: number;
    topPercentile: number;
    recommendation: string;
  }>;
  improvementPlan: {
    weeklyGoals: string[];
    monthlyGoals: string[];
    skillDevelopment: string[];
    networkingAdvice: string[];
  };
}

interface ResumeReview {
  _id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  targetRole?: string;
  targetIndustry?: string;
  experienceLevel: string;
  additionalContext?: string;
  analysisResult: ResumeAnalysis;
  userNotes?: string;
  implementedSuggestions?: string[];
  rating?: number;
  feedback?: string;
  analysisStatus: 'pending' | 'processing' | 'completed' | 'failed';
  processingTime?: number;
  analyzedAt: string;
  lastUpdated: string;
}

interface ResumeInsights {
  totalReviews: number;
  averageScore: number;
  improvementTrend: Array<{
    date: string;
    score: number;
    fileName: string;
  }>;
  topWeaknesses: Array<{
    weakness: string;
    count: number;
  }>;
  completionRate: number;
  averageProcessingTime: number;
}

const ResumeReviewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analyze' | 'reviews' | 'insights'>('analyze');
  
  // Analysis state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [additionalContext, setAdditionalContext] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<ResumeAnalysis | null>(null);
  
  // Reviews state
  const [reviews, setReviews] = useState<ResumeReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<ResumeReview | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');
  const [implementedSuggestions, setImplementedSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Insights state
  const [insights, setInsights] = useState<ResumeInsights | null>(null);

  useEffect(() => {
    loadReviews();
    loadInsights();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await api.getResumeReviews();
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
      const response = await api.getResumeInsights();
      if (response.success) {
        setInsights(response.insights);
      }
    } catch (error) {
      console.error('Failed to load insights:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a PDF, DOC, or DOCX file');
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const analyzeResume = async () => {
    if (!selectedFile) {
      toast.error('Please select a resume file');
      return;
    }

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);
      formData.append('targetRole', targetRole);
      formData.append('targetIndustry', targetIndustry);
      formData.append('experienceLevel', experienceLevel);
      formData.append('additionalContext', additionalContext);

      const response = await api.analyzeResume(formData);
      
      if (response.success) {
        setCurrentAnalysis(response.analysis);
        toast.success('Resume analysis completed successfully!');
        
        // Refresh reviews and insights
        await loadReviews();
        await loadInsights();
        
        // Clear form
        setSelectedFile(null);
        setTargetRole('');
        setTargetIndustry('');
        setAdditionalContext('');
        
        // Reset file input
        const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to analyze resume');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;

    try {
      await api.deleteResumeReview(reviewId);
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

  const startEditingNotes = (review: ResumeReview) => {
    setEditingNotes(review._id);
    setNotesText(review.userNotes || '');
    setImplementedSuggestions(review.implementedSuggestions || []);
  };

  const saveNotes = async (reviewId: string) => {
    try {
      await api.updateResumeReview(reviewId, {
        userNotes: notesText,
        implementedSuggestions
      });
      toast.success('Notes updated successfully');
      setEditingNotes(null);
      await loadReviews();
      
      // Update selected review if it's the one being edited
      if (selectedReview?._id === reviewId) {
        const updatedReview = reviews.find(r => r._id === reviewId);
        if (updatedReview) {
          setSelectedReview({
            ...updatedReview,
            userNotes: notesText,
            implementedSuggestions
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
    setImplementedSuggestions([]);
  };

  // const toggleSuggestionCompletion = (suggestion: string) => {
  //   if (implementedSuggestions.includes(suggestion)) {
  //     setImplementedSuggestions(implementedSuggestions.filter(s => s !== suggestion));
  //   } else {
  //     setImplementedSuggestions([...implementedSuggestions, suggestion]);
  //   }
  // };

  const downloadResume = async (reviewId: string) => {
    try {
      window.open(`http://localhost:3000/resume-reviewer/reviews/${reviewId}/download`, '_blank');
    } catch (error: any) {
      toast.error('Failed to download resume');
    }
  };

  const reanalyzeResume = async (reviewId: string) => {
    try {
      setLoading(true);
      const response = await api.reanalyzeResume(reviewId, {
        targetRole,
        targetIndustry,
        experienceLevel,
        additionalContext
      });
      
      if (response.success) {
        toast.success('Resume reanalysis completed!');
        await loadReviews();
        await loadInsights();
        
        // Update selected review
        const updatedReview = reviews.find(r => r._id === reviewId);
        if (updatedReview) {
          setSelectedReview({
            ...updatedReview,
            analysisResult: response.analysis
          });
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reanalyze resume');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // const getPriorityColor = (priority: string) => {
  //   switch (priority) {
  //     case 'high': return 'bg-red-100 text-red-800 border-red-200';
  //     case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  //     case 'low': return 'bg-green-100 text-green-800 border-green-200';
  //     default: return 'bg-gray-100 text-gray-800 border-gray-200';
  //   }
  // };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  const renderAnalysisResults = (analysis: ResumeAnalysis) => (
    <div className="space-y-8">
      {/* Overall Score */}
      <div className="text-center">
        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
          {analysis.overallScore}
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mt-4">Overall Resume Score</h3>
        <p className="text-gray-600">
          {analysis.overallScore >= 80 ? 'Excellent resume!' : 
           analysis.overallScore >= 60 ? 'Good resume with room for improvement' : 
           'Resume needs significant improvements'}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
          <Brain className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <div className="text-lg font-bold text-gray-900">{analysis.atsAnalysis.overallScore}%</div>
          <div className="text-sm text-gray-600">ATS Score</div>
        </div>

        <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
          <FileCheck className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <div className="text-lg font-bold text-gray-900">{analysis.contentAnalysis.readabilityScore}%</div>
          <div className="text-sm text-gray-600">Readability</div>
        </div>

        <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
          <Users className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <div className="text-lg font-bold text-gray-900">{analysis.skillsAnalysis.identifiedSkills.length}</div>
          <div className="text-sm text-gray-600">Skills Found</div>
        </div>

        <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
          <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-3" />
          <div className="text-lg font-bold text-gray-900">{analysis.experienceAnalysis.quantifiedAchievements}</div>
          <div className="text-sm text-gray-600">Quantified Results</div>
        </div>
      </div>

      {/* Section Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-6 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
          Section Analysis
        </h4>
        <div className="space-y-4">
          {analysis.sectionAnalysis.map((section, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-gray-900 capitalize">{section.section}</h5>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(section.score)}`}>
                  {section.score}%
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h6 className="font-medium text-green-800 mb-2">Strengths</h6>
                  <ul className="space-y-1">
                    {section.strengths.map((strength, i) => (
                      <li key={i} className="text-green-700 flex items-start">
                        <CheckCircle className="w-3 h-3 mr-2 mt-1 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h6 className="font-medium text-red-800 mb-2">Areas for Improvement</h6>
                  <ul className="space-y-1">
                    {section.weaknesses.map((weakness, i) => (
                      <li key={i} className="text-red-700 flex items-start">
                        <AlertTriangle className="w-3 h-3 mr-2 mt-1 flex-shrink-0" />
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {section.suggestions.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h6 className="font-medium text-blue-800 mb-2">Suggestions</h6>
                  <ul className="space-y-1">
                    {section.suggestions.map((suggestion, i) => (
                      <li key={i} className="text-blue-700 text-sm flex items-start">
                        <Lightbulb className="w-3 h-3 mr-2 mt-1 flex-shrink-0" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Skills Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-6 flex items-center">
          <Star className="w-5 h-5 mr-2 text-purple-600" />
          Skills Analysis
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h5 className="font-medium text-green-900 mb-3">Identified Skills</h5>
            <div className="space-y-2">
              {analysis.skillsAnalysis.identifiedSkills.slice(0, 8).map((skillData, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-green-800">{skillData.skill}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    skillData.relevance === 'high' ? 'bg-green-200 text-green-800' :
                    skillData.relevance === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-gray-200 text-gray-800'
                  }`}>
                    {skillData.relevance}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <h5 className="font-medium text-red-900 mb-3">Skills Gap</h5>
            <div className="space-y-2">
              {analysis.skillsAnalysis.skillsGap.slice(0, 6).map((skill, index) => (
                <div key={index} className="text-sm text-red-800 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-2 flex-shrink-0" />
                  {skill}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h5 className="font-medium text-blue-900 mb-3">Recommended Skills</h5>
            <div className="space-y-2">
              {analysis.skillsAnalysis.recommendedSkills.slice(0, 6).map((skill, index) => (
                <div key={index} className="text-sm text-blue-800 flex items-center">
                  <Target className="w-3 h-3 mr-2 flex-shrink-0" />
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ATS Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-6 flex items-center">
          <Search className="w-5 h-5 mr-2 text-blue-600" />
          ATS Compatibility Analysis
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(analysis.atsAnalysis.keywordMatch)}`}>
              {analysis.atsAnalysis.keywordMatch}%
            </div>
            <div className="text-sm text-gray-600">Keyword Match</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(analysis.atsAnalysis.formatting)}`}>
              {analysis.atsAnalysis.formatting}%
            </div>
            <div className="text-sm text-gray-600">Formatting</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(analysis.atsAnalysis.readability)}`}>
              {analysis.atsAnalysis.readability}%
            </div>
            <div className="text-sm text-gray-600">Readability</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-green-800 mb-3">Found Keywords</h5>
            <div className="flex flex-wrap gap-2">
              {analysis.atsAnalysis.foundKeywords.map((keyword, index) => (
                <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-red-800 mb-3">Missing Keywords</h5>
            <div className="flex flex-wrap gap-2">
              {analysis.atsAnalysis.missingKeywords.map((keyword, index) => (
                <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-6 flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
          Improvement Recommendations
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <h5 className="font-medium text-red-900 mb-3 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Immediate (Today)
            </h5>
            <ul className="space-y-2">
              {analysis.recommendations.immediate.map((action, index) => (
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
              {analysis.recommendations.shortTerm.map((action, index) => (
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
              {analysis.recommendations.longTerm.map((action, index) => (
                <li key={index} className="text-green-800 text-sm flex items-start">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Industry Benchmarks */}
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
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-600">You: {benchmark.userScore}</span>
                  <span className="text-gray-600">Industry: {benchmark.industryAverage}</span>
                  <span className="text-gray-600">Top 10%: {benchmark.topPercentile}</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min((benchmark.userScore / benchmark.topPercentile) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">{benchmark.recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FileText className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Resume & CV Reviewer</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Get comprehensive AI-powered analysis of your resume with actionable insights to improve your job prospects
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { id: 'analyze', label: 'Analyze Resume', icon: Upload },
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
          {/* Upload Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-4xl mx-auto">
            <div className="flex items-center mb-8">
              <Upload className="w-6 h-6 mr-3 text-green-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Upload Your Resume</h2>
            </div>

            <div className="space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Resume File (PDF, DOC, DOCX - Max 10MB)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      {selectedFile ? selectedFile.name : 'Choose a file or drag and drop'}
                    </p>
                    <p className="text-gray-600">
                      {selectedFile ? 
                        `${formatFileSize(selectedFile.size)} • ${selectedFile.type}` :
                        'PDF, DOC, or DOCX up to 10MB'
                      }
                    </p>
                  </label>
                </div>
              </div>

              {/* Analysis Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Target Role (Optional)"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g., Software Engineer, Product Manager"
                />

                <Input
                  label="Target Industry (Optional)"
                  value={targetIndustry}
                  onChange={(e) => setTargetIndustry(e.target.value)}
                  placeholder="e.g., Technology, Healthcare, Finance"
                />
              </div>

              <Select
                label="Experience Level"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                options={[
                  { value: 'entry', label: 'Entry Level (0-2 years)' },
                  { value: 'junior', label: 'Junior (2-4 years)' },
                  { value: 'mid', label: 'Mid Level (4-7 years)' },
                  { value: 'senior', label: 'Senior (7-10 years)' },
                  { value: 'executive', label: 'Executive (10+ years)' }
                ]}
              />

              <Textarea
                label="Additional Context (Optional)"
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="Any specific areas you'd like us to focus on or additional context about your career goals..."
                rows={3}
              />

              <Button
                onClick={analyzeResume}
                loading={isAnalyzing}
                disabled={!selectedFile}
                className="w-full py-4 text-lg"
                icon={<Brain className="w-5 h-5" />}
              >
                {isAnalyzing ? 'Analyzing Resume...' : 'Analyze Resume with AI'}
              </Button>
            </div>
          </div>

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
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600 mb-4">Upload your first resume to get AI-powered analysis and insights.</p>
              <Button onClick={() => setActiveTab('analyze')}>
                Analyze Resume
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
                          <FileText className="w-4 h-4 text-gray-600 mr-2" />
                          <span className="font-medium text-gray-900 truncate">{review.fileName}</span>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          review.analysisStatus === 'completed' ? getScoreColor(review.analysisResult?.overallScore || 0) :
                          review.analysisStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          review.analysisStatus === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {review.analysisStatus === 'completed' ? review.analysisResult?.overallScore || 0 :
                           review.analysisStatus === 'processing' ? 'Processing' :
                           review.analysisStatus === 'failed' ? 'Failed' : 'Pending'}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {review.targetRole || 'No target role specified'}
                      </p>
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
                        <FileText className="w-6 h-6 text-gray-600 mr-3" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {selectedReview.fileName}
                          </h3>
                          <p className="text-sm text-gray-600">{formatDate(selectedReview.analyzedAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadResume(selectedReview._id)}
                          icon={<Download className="w-4 h-4" />}
                        >
                          Download
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
                            Mark completed suggestions: {implementedSuggestions.length} completed
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
                    ) : selectedReview.userNotes && (
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Your Notes</h4>
                        <p className="text-gray-700">{selectedReview.userNotes}</p>
                        {selectedReview.implementedSuggestions && selectedReview.implementedSuggestions.length > 0 && (
                          <p className="text-sm text-gray-600 mt-2">
                            Completed: {selectedReview.implementedSuggestions.length} suggestions
                          </p>
                        )}
                      </div>
                    )}

                    {selectedReview.analysisStatus === 'completed' && selectedReview.analysisResult ? (
                      renderAnalysisResults(selectedReview.analysisResult)
                    ) : selectedReview.analysisStatus === 'processing' ? (
                      <div className="text-center py-12">
                        <LoadingSpinner size="lg" className="mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Resume</h3>
                        <p className="text-gray-600">Our AI is analyzing your resume. This may take a few minutes...</p>
                      </div>
                    ) : selectedReview.analysisStatus === 'failed' ? (
                      <div className="text-center py-12">
                        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Failed</h3>
                        <p className="text-gray-600 mb-4">There was an error analyzing your resume. Please try again.</p>
                        <Button
                          onClick={() => reanalyzeResume(selectedReview._id)}
                          icon={<RefreshCw className="w-4 h-4" />}
                        >
                          Retry Analysis
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Pending</h3>
                        <p className="text-gray-600">Your resume is queued for analysis.</p>
                      </div>
                    )}
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
                  <FileText className="w-6 h-6 text-blue-600" />
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
                  <CheckSquare className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{insights.completionRate}%</div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{Math.round(insights.averageProcessingTime / 1000)}s</div>
                <div className="text-sm text-gray-600">Avg Processing Time</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Insights Available</h3>
              <p className="text-gray-600 mb-4">Analyze some resumes to see your improvement insights.</p>
              <Button onClick={() => setActiveTab('analyze')}>
                Analyze Resume
              </Button>
            </div>
          )}

          {/* Top Weaknesses */}
          {insights && insights.topWeaknesses.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                Most Common Areas for Improvement
              </h3>
              <div className="space-y-4">
                {insights.topWeaknesses.map((weakness, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{weakness.weakness}</span>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-3">{weakness.count} times</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full"
                          style={{ width: `${(weakness.count / insights.totalReviews) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Improvement Trend */}
          {insights && insights.improvementTrend.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Recent Resume Scores
              </h3>
              <div className="space-y-4">
                {insights.improvementTrend.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900">{trend.fileName}</span>
                      <p className="text-sm text-gray-600">{formatDate(trend.date)}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(trend.score)}`}>
                      {trend.score}
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

export default ResumeReviewer;