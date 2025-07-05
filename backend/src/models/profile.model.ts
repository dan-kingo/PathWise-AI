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
  }
}, { 
  timestamps: true 
});

// Create index for better performance
profileSchema.index({ userId: 1 });

export default mongoose.model("Profile", profileSchema);