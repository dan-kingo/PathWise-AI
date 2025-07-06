import mongoose, {Document} from 'mongoose';


export interface ISkillAnalysis extends Document {
  skill: string;
  relevance: 'high' | 'medium' | 'low';
  frequency: number;
  context?: string;
  recommendation?: string;
}

export interface ISectionAnalysis extends Document {
  section: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  content?: string;
  wordCount?: number;
  keywordDensity?: number;
}

export interface IAtsAnalysis extends Document {
  overallScore: number;
  keywordMatch: number;
  formatting: number;
  readability: number;
  recommendations: string[];
  missingKeywords: string[];
  foundKeywords: string[];
}

export interface IResumeAnalysis extends Document {
  overallScore: number;
  contentAnalysis: {
    totalWords?: number;
    readabilityScore?: number;
    grammarIssues?: string[];
    spellingErrors?: string[];
    toneAnalysis?: string;
    clarityScore?: number;
  };
  sectionAnalysis: ISectionAnalysis[];
  skillsAnalysis: {
    identifiedSkills: ISkillAnalysis[];
    skillsGap: string[];
    recommendedSkills: string[];
    technicalSkills: string[];
    softSkills: string[];
  };
  experienceAnalysis: {
    totalYears?: number;
    careerProgression?: string;
    achievementCount?: number;
    quantifiedAchievements?: number;
    actionVerbsUsed?: string[];
    improvementSuggestions?: string[];
  };
  atsAnalysis: IAtsAnalysis;
  industryAnalysis: {
    targetIndustry?: string;
    industryRelevance?: number;
    industryKeywords?: string[];
    competitorAnalysis?: string;
    marketTrends?: string[];
  };
  formattingAnalysis: {
    structure?: string;
    consistency?: number;
    visualAppeal?: number;
    length?: string;
    fontAnalysis?: string;
    spacingAnalysis?: string;
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

export interface IResumeReview extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  fileName: string;
  fileUrl: string;
  fileType: 'pdf' | 'doc' | 'docx';
  fileSize: number;
  cloudinaryPublicId: string;
  targetRole?: string;
  targetIndustry?: string;
  experienceLevel: 'entry' | 'junior' | 'mid' | 'senior' | 'executive';
  additionalContext?: string;
  extractedText: string;
  extractedSections: {
    contact?: string;
    summary?: string;
    experience?: string;
    education?: string;
    skills?: string;
    projects?: string;
    certifications?: string;
    other?: string;
  };
  analysisResult: IResumeAnalysis;
  userNotes?: string;
  implementedSuggestions?: string[];
  rating?: number;
  feedback?: string;
  analysisStatus: 'pending' | 'processing' | 'completed' | 'failed';
  processingTime?: number;
  analyzedAt: Date;
  lastUpdated: Date;
}

const skillAnalysisSchema = new mongoose.Schema({
  skill: {
    type: String,
    required: true
  },
  relevance: {
    type: String,
    enum: ['high', 'medium', 'low'],
    required: true
  },
  frequency: {
    type: Number,
    required: true
  },
  context: String,
  recommendation: String
});

const sectionAnalysisSchema = new mongoose.Schema({
  section: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  strengths: [String],
  weaknesses: [String],
  suggestions: [String],
  content: String,
  wordCount: Number,
  keywordDensity: Number
});

const atsAnalysisSchema = new mongoose.Schema({
  overallScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  keywordMatch: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  formatting: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  readability: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  recommendations: [String],
  missingKeywords: [String],
  foundKeywords: [String]
});

const resumeAnalysisSchema = new mongoose.Schema({
  overallScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  
  // Content Analysis
  contentAnalysis: {
    totalWords: Number,
    readabilityScore: Number,
    grammarIssues: [String],
    spellingErrors: [String],
    toneAnalysis: String,
    clarityScore: Number
  },

  // Section Analysis
  sectionAnalysis: [sectionAnalysisSchema],

  // Skills Analysis
  skillsAnalysis: {
    identifiedSkills: [skillAnalysisSchema],
    skillsGap: [String],
    recommendedSkills: [String],
    technicalSkills: [String],
    softSkills: [String]
  },

  // Experience Analysis
  experienceAnalysis: {
    totalYears: Number,
    careerProgression: String,
    achievementCount: Number,
    quantifiedAchievements: Number,
    actionVerbsUsed: [String],
    improvementSuggestions: [String]
  },

  // ATS Compatibility
  atsAnalysis: atsAnalysisSchema,

  // Industry-Specific Analysis
  industryAnalysis: {
    targetIndustry: String,
    industryRelevance: Number,
    industryKeywords: [String],
    competitorAnalysis: String,
    marketTrends: [String]
  },

  // Formatting Analysis
  formattingAnalysis: {
    structure: String,
    consistency: Number,
    visualAppeal: Number,
    length: String,
    fontAnalysis: String,
    spacingAnalysis: String
  },

  // Recommendations
  recommendations: {
    immediate: [String],
    shortTerm: [String],
    longTerm: [String],
    priorityActions: [String]
  },

  // Benchmarks
  industryBenchmarks: [{
    metric: String,
    userScore: Number,
    industryAverage: Number,
    topPercentile: Number,
    recommendation: String
  }],

  // Improvement Plan
  improvementPlan: {
    weeklyGoals: [String],
    monthlyGoals: [String],
    skillDevelopment: [String],
    networkingAdvice: [String]
  }
});

const resumeReviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // File Information
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'doc', 'docx'],
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  cloudinaryPublicId: {
    type: String,
    required: true
  },

  // Analysis Context
  targetRole: String,
  targetIndustry: String,
  experienceLevel: {
    type: String,
    enum: ['entry', 'junior', 'mid', 'senior', 'executive'],
    default: 'mid'
  },
  additionalContext: String,

  // Extracted Content
  extractedText: {
    type: String,
    required: true
  },
  extractedSections: {
    contact: String,
    summary: String,
    experience: String,
    education: String,
    skills: String,
    projects: String,
    certifications: String,
    other: String
  },

  // AI Analysis Results
  analysisResult: {
    type: resumeAnalysisSchema,
    required: true
  },

  // User Feedback and Progress
  userNotes: String,
  implementedSuggestions: [String],
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: String,

  // Status and Metadata
  analysisStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processingTime: Number, // in milliseconds
  
  analyzedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
resumeReviewSchema.index({ userId: 1, analyzedAt: -1 });
resumeReviewSchema.index({ analysisStatus: 1 });
resumeReviewSchema.index({ 'analysisResult.overallScore': -1 });

export default mongoose.model('ResumeReview', resumeReviewSchema);