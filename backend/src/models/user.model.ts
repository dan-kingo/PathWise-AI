import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
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
    default: 'google',
    required: true
  }
}, { 
  timestamps: true 
});

export default mongoose.model("User", userSchema);