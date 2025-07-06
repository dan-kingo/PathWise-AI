import mongoose from 'mongoose';

const suggestionSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    required: true
  },
  suggestion: {
    type: String,
    required: true
  },
  impact: {
    type: String,
    required: true
  }
});

const industryBenchmarkSchema = new mongoose.Schema({
  metric: {
    type: String,
    required: true
  },
  userScore: {
    type: Number,
    required: true
  },
  industryAverage: {
    type: Number,
    required: true
  },
  recommendation: {
    type: String,
    required: true
  }
});

const actionPlanSchema = new mongoose.Schema({
  immediate: [String],
  shortTerm: [String],
  longTerm: [String]
});

const analysisResultSchema = new mongoose.Schema({
  overallScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  strengths: [String],
  weaknesses: [String],
  suggestions: [suggestionSchema],
  industryBenchmarks: [industryBenchmarkSchema],
  actionPlan: actionPlanSchema
});

// LinkedIn specific data schema
const linkedinExperienceSchema = new mongoose.Schema({
  title: String,
  company: String,
  duration: String,
  description: String
});

const linkedinEducationSchema = new mongoose.Schema({
  school: String,
  degree: String,
  field: String,
  year: String
});

const linkedinPostSchema = new mongoose.Schema({
  content: String,
  engagement: Number
});

const linkedinDataSchema = new mongoose.Schema({
  headline: String,
  summary: String,
  experience: [linkedinExperienceSchema],
  education: [linkedinEducationSchema],
  skills: [String],
  recommendations: Number,
  connections: String,
  posts: [linkedinPostSchema]
});

const profileReviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  profileUrl: {
    type: String,
    required: true
  },
  profileType: {
    type: String,
    enum: ['linkedin', 'github'],
    required: true
  },
  analysisResult: {
    type: analysisResultSchema,
    required: true
  },
  additionalContext: String,
  linkedinData: linkedinDataSchema, // Only populated for LinkedIn profiles
  notes: String,
  completedSuggestions: [String],
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

// Index for better performance
profileReviewSchema.index({ userId: 1, analyzedAt: -1 });
profileReviewSchema.index({ userId: 1, profileUrl: 1 }, { unique: true });

export default mongoose.model('ProfileReview', profileReviewSchema);