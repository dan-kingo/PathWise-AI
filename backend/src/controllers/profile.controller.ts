import { Request, Response } from 'express';
import Profile from '../models/profile.model.js';
import User from '../models/user.model.js';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    
    let profile = await Profile.findOne({ userId });
    
    if (!profile) {
      // Create empty profile if doesn't exist
      profile = new Profile({ userId });
      await profile.save();
    }

    return res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const profileData = req.body;

    // Check if profile is complete
    const requiredFields = [
      profileData.bio,
      profileData.careerGoals?.targetRole,
      profileData.experience?.level,
      profileData.skills?.length > 0
    ];

    const isComplete = requiredFields.every(field => 
      field !== undefined && field !== null && field !== '' && field !== false
    );

    profileData.isComplete = isComplete;

    let profile = await Profile.findOneAndUpdate(
      { userId },
      profileData,
      { new: true, upsert: true }
    );

    // Also update user's name if provided
    if (profileData.name) {
      await User.findByIdAndUpdate(userId, { name: profileData.name });
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updateLearningProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { learningProgress } = req.body;

    if (!learningProgress) {
      return res.status(400).json({ message: 'Learning progress data is required' });
    }

    const profile = await Profile.findOneAndUpdate(
      { userId },
      { 
        $set: { 
          learningProgress: {
            ...learningProgress,
            lastActivityAt: new Date()
          }
        }
      },
      { new: true, upsert: true }
    );

    return res.json({
      success: true,
      message: 'Learning progress updated successfully',
      profile
    });
  } catch (error) {
    console.error('Update learning progress error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // In a real app, you'd upload to cloud storage (AWS S3, Cloudinary, etc.)
    // For now, we'll just store the filename
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    await Profile.findOneAndUpdate(
      { userId },
      { avatar: avatarUrl },
      { upsert: true }
    );

    // Also update user's avatar
    await User.findByIdAndUpdate(userId, { avatar: avatarUrl });

    return res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const deleteProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;

    await Profile.findOneAndDelete({ userId });

    return res.json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete profile error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const checkProfileStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    
    const profile = await Profile.findOne({ userId });
    
    return res.json({
      success: true,
      hasProfile: !!profile,
      isComplete: profile?.isComplete || false,
      profile: profile || null
    });
  } catch (error) {
    console.error('Check profile status error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};