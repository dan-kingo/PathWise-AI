import { Request, Response } from 'express';
import GrokService from '../services/grok.service.js';
import ProfileReview from '../models/profileReview.model.js';
import { validateUrl } from '../utils/validation.utils.js';

interface ProfileAnalysisRequest {
  profileUrl: string;
  profileType: 'linkedin' | 'github';
  additionalContext?: string;
  // LinkedIn specific data
  linkedinData?: {
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
  };
}

interface ProfileAnalysisResult {
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

export const analyzeProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { profileUrl, profileType, additionalContext, linkedinData }: ProfileAnalysisRequest = req.body;

    // Validation
    if (!profileUrl || !profileType) {
      return res.status(400).json({ 
        message: 'Profile URL and type are required' 
      });
    }

    if (!validateUrl(profileUrl)) {
      return res.status(400).json({ 
        message: 'Please provide a valid URL' 
      });
    }

    if (!['linkedin', 'github'].includes(profileType)) {
      return res.status(400).json({ 
        message: 'Profile type must be either "linkedin" or "github"' 
      });
    }

    // Validate URL matches profile type
    const isValidProfileUrl = validateProfileUrl(profileUrl, profileType);
    if (!isValidProfileUrl) {
      return res.status(400).json({ 
        message: `Please provide a valid ${profileType} profile URL` 
      });
    }

    // For LinkedIn, require additional data
    if (profileType === 'linkedin') {
      if (!linkedinData || Object.keys(linkedinData).length === 0) {
        return res.status(400).json({
          message: 'LinkedIn profile analysis requires additional profile information',
          requiresLinkedInData: true,
          requiredFields: [
            'headline',
            'summary', 
            'experience',
            'education',
            'skills',
            'recommendations',
            'connections'
          ]
        });
      }

      // Validate required LinkedIn fields
      const missingFields = [];
      if (!linkedinData.headline) missingFields.push('headline');
      if (!linkedinData.summary) missingFields.push('summary');
      if (!linkedinData.experience || linkedinData.experience.length === 0) missingFields.push('experience');
      if (!linkedinData.skills || linkedinData.skills.length === 0) missingFields.push('skills');

      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `Missing required LinkedIn profile information: ${missingFields.join(', ')}`,
          missingFields,
          requiresLinkedInData: true
        });
      }
    }

    // Generate AI analysis
    const analysisResult = await GrokService.analyzeProfile({
      profileUrl,
      profileType,
      additionalContext,
      linkedinData
    });

    // Save analysis to database
    const profileReview = await ProfileReview.findOneAndUpdate(
      { userId, profileUrl },
      {
        profileType,
        analysisResult,
        additionalContext,
        linkedinData: profileType === 'linkedin' ? linkedinData : undefined,
        analyzedAt: new Date(),
        lastUpdated: new Date()
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true
      }
    );

    return res.json({
      success: true,
      analysis: analysisResult,
      reviewId: profileReview._id,
      message: 'Profile analysis completed successfully'
    });
  } catch (error) {
    console.error('Profile analysis error:', error);
    
    // Handle specific GitHub API errors
    if (error.message.includes('GitHub API error')) {
      return res.status(400).json({
        message: 'Unable to access GitHub profile. Please ensure the profile is public and the username is correct.',
        error: error.message
      });
    }
    
    // Handle LinkedIn data requirement errors
    if (error.message.includes('LinkedIn profile analysis requires')) {
      return res.status(400).json({
        message: error.message,
        requiresLinkedInData: true
      });
    }
    
    return res.status(500).json({ 
      message: 'Failed to analyze profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getProfileReviews = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { profileType } = req.query;

    const query: any = { userId };
    if (profileType && ['linkedin', 'github'].includes(profileType as string)) {
      query.profileType = profileType;
    }

    const reviews = await ProfileReview.find(query)
      .sort({ analyzedAt: -1 })
      .limit(10);

    return res.json({
      success: true,
      reviews,
      count: reviews.length
    });
  } catch (error) {
    console.error('Get profile reviews error:', error);
    return res.status(500).json({ 
      message: 'Failed to get profile reviews' 
    });
  }
};

export const getProfileReview = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { reviewId } = req.params;

    const review = await ProfileReview.findOne({ 
      _id: reviewId, 
      userId 
    });

    if (!review) {
      return res.status(404).json({ 
        message: 'Profile review not found' 
      });
    }

    return res.json({
      success: true,
      review
    });
  } catch (error) {
    console.error('Get profile review error:', error);
    return res.status(500).json({ 
      message: 'Failed to get profile review' 
    });
  }
};

export const deleteProfileReview = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { reviewId } = req.params;

    const review = await ProfileReview.findOneAndDelete({ 
      _id: reviewId, 
      userId 
    });

    if (!review) {
      return res.status(404).json({ 
        message: 'Profile review not found' 
      });
    }

    return res.json({
      success: true,
      message: 'Profile review deleted successfully'
    });
  } catch (error) {
    console.error('Delete profile review error:', error);
    return res.status(500).json({ 
      message: 'Failed to delete profile review' 
    });
  }
};

export const updateReviewNotes = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { reviewId } = req.params;
    const { notes, completedSuggestions } = req.body;

    const review = await ProfileReview.findOneAndUpdate(
      { _id: reviewId, userId },
      { 
        notes,
        completedSuggestions: completedSuggestions || [],
        lastUpdated: new Date()
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ 
        message: 'Profile review not found' 
      });
    }

    return res.json({
      success: true,
      review,
      message: 'Review notes updated successfully'
    });
  } catch (error) {
    console.error('Update review notes error:', error);
    return res.status(500).json({ 
      message: 'Failed to update review notes' 
    });
  }
};

// Helper function to validate profile URLs
const validateProfileUrl = (url: string, profileType: string): boolean => {
  try {
    const urlObj = new URL(url);
    
    if (profileType === 'linkedin') {
      return urlObj.hostname.includes('linkedin.com') && 
             (url.includes('/in/') || url.includes('/pub/'));
    } else if (profileType === 'github') {
      return urlObj.hostname.includes('github.com') && 
             url.split('/').length >= 4; // github.com/username
    }
    
    return false;
  } catch {
    return false;
  }
};

export const getProfileInsights = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    
    const reviews = await ProfileReview.find({ userId })
      .sort({ analyzedAt: -1 });

    if (reviews.length === 0) {
      return res.json({
        success: true,
        insights: {
          totalReviews: 0,
          averageScore: 0,
          improvementTrend: [],
          topSuggestions: [],
          completionRate: 0
        }
      });
    }

    // Calculate insights
    const totalReviews = reviews.length;
    const averageScore = reviews.reduce((sum, review) => 
      sum + (review.analysisResult?.overallScore || 0), 0) / totalReviews;

    const improvementTrend = reviews.slice(0, 5).map(review => ({
      date: review.analyzedAt,
      score: review.analysisResult?.overallScore || 0,
      profileType: review.profileType
    }));

    // Get most common suggestions
    const allSuggestions = reviews.flatMap(review => 
      review.analysisResult?.suggestions || []
    );
    
    const suggestionCounts = allSuggestions.reduce((acc, suggestion) => {
      acc[suggestion.category] = (acc[suggestion.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topSuggestions = Object.entries(suggestionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));

    // Calculate completion rate
    const totalSuggestions = allSuggestions.length;
    const completedSuggestions = reviews.reduce((sum, review) => 
      sum + (review.completedSuggestions?.length || 0), 0);
    const completionRate = totalSuggestions > 0 ? 
      (completedSuggestions / totalSuggestions) * 100 : 0;

    return res.json({
      success: true,
      insights: {
        totalReviews,
        averageScore: Math.round(averageScore * 10) / 10,
        improvementTrend,
        topSuggestions,
        completionRate: Math.round(completionRate * 10) / 10
      }
    });
  } catch (error) {
    console.error('Get profile insights error:', error);
    return res.status(500).json({ 
      message: 'Failed to get profile insights' 
    });
  }
};