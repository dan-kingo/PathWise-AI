import User from '../models/user.model.js';
import { hashPassword } from '../utils/auth.utils.js';

export const createUser = async (userData: {
  email: string;
  password?: string;
  name: string;
  provider: 'email' | 'google';
  googleId?: string;
  avatar?: string;
}) => {
  const user = new User(userData);
  
  if (userData.password) {
    user.password = await hashPassword(userData.password);
  }
  
  return user.save();
};

export const findUserByEmail = async (email: string) => {
  return User.findOne({ email });
};

export const findUserById = async (id: string) => {
  return User.findById(id);
};

export const findUserByGoogleId = async (googleId: string) => {
  return User.findOne({ googleId });
};

export const updateUser = async (id: string, updateData: any) => {
  return User.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteUser = async (id: string) => {
  return User.findByIdAndDelete(id);
};