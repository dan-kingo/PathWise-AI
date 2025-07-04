import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: String,
  email: String,
  name: String,
  avatar: String,
}, { timestamps: true });

export default mongoose.model("User", userSchema);
