import mongoose from 'mongoose';

const weeklyPlanSchema = new mongoose.Schema({
  week: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  focus: String,
  goals: [String],
  tasks: [String],
  skills: [String],
  resources: [{
    title: String,
    type: {
      type: String,
      enum: ['video', 'article', 'course', 'practice', 'project']
    },
    url: String,
    duration: String,
    description: String,
    source: String,
    difficulty: String,
    rating: String
  }],
  milestones: [String],
  projects: [String],
  project: String,
  hours: Number
});

const careerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: String,
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  totalWeeks: {
    type: Number,
    required: true
  },
  prerequisites: [String],
  outcomes: [String],
  skillsToLearn: [String],
  marketDemand: String,
  averageSalary: String,
  jobTitles: [String],
  weeklyPlan: [weeklyPlanSchema],
  
  // Generation metadata
  targetRole: String,
  timeframe: String,
  pace: {
    type: String,
    enum: ['slow', 'normal', 'fast'],
    default: 'normal'
  },
  customSkills: [String],
  customInterests: [String],
  
  // Progress tracking
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Timestamps
  generatedAt: {
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
careerSchema.index({ generatedAt: -1 });

export default mongoose.model('Career', careerSchema);