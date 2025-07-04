import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    sparse: true
  },
  linkedinId: {
    type: String,
    sparse: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  avatar: String,
  provider: {
    type: String,
    enum: ['google', 'linkedin', 'google,linkedin', 'linkedin,google'],
    required: true
  }
}, { 
  timestamps: true 
});

// Ensure at least one OAuth ID is present
userSchema.pre('save', function(next) {
  if (!this.googleId && !this.linkedinId) {
    next(new Error('User must have at least one OAuth provider ID'));
  } else {
    next();
  }
});

export default mongoose.model("User", userSchema);