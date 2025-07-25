import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: String,
  phone: String,
  location: String,
  avatar: String,
  education: {
    degree: String,
    institution: String,
    graduationYear: Number,
    fieldOfStudy: String,
  },
  careerGoals: {
    targetRole: String,
    industry: String,
    timeframe: String,
    description: String,
  },
  skills: [String],
  interests: [String],
  experience: {
    level: {
      type: String,
      enum: ['entry', 'junior', 'mid', 'senior', 'expert'],
      default: 'entry'
    },
    years: Number,
    currentRole: String,
    currentCompany: String,
  },
  isComplete: {
    type: Boolean,
    default: false
  },
  savedCareerPath: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  careerPathGeneratedAt: Date,
  skillGapAnalysis: {
    targetRole: String,
    analysis: mongoose.Schema.Types.Mixed,
    completedSkills: [String],
    analyzedAt: Date
  },
  learningProgress: {
    currentWeek: {
      type: Number,
      default: 0
    },
    completedMilestones: [String],
    completedResources: [String],
    startedAt: Date,
    lastActivityAt: Date
  }
}, {  
  timestamps: true 
});

// Create index for better performance

export default mongoose.model("Profile", profileSchema);