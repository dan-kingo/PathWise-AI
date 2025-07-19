import { Request, Response } from 'express';
import GrokService from '../services/grok.service.js';
import Career from '../models/career.model.js';
import Profile from '../models/profile.model.js';

export const generateCareerPath = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { targetRole, timeframe, customSkills, customInterests } = req.body;

    if (!targetRole) {
      return res.status(400).json({ message: 'Target role is required' });
    }

    // Get user profile for context
    const profile = await Profile.findOne({ userId });
    
    const careerPathRequest = {
      targetRole,
      currentSkills: customSkills || profile?.skills || [],
      experienceLevel: profile?.experience?.level || 'entry',
      timeframe: timeframe || profile?.careerGoals?.timeframe || '8 weeks',
      interests: customInterests || profile?.interests || [],
    };

    const careerPathData = await GrokService.generateCareerPath(careerPathRequest);

    // Save or update career path in database
    // const careerPath = await Career.findOneAndUpdate(
    //   { userId },
    //   {
    //     ...careerPathData,
    //     targetRole,
    //     timeframe,
    //     customSkills: customSkills || [],
    //     customInterests: customInterests || [],
    //     lastUpdated: new Date()
    //   },
    //   { 
    //     new: true, 
    //     upsert: true,
    //     runValidators: true
    //   }
    // );

    // Also update the profile's savedCareerPath for backward compatibility
    await Profile.findOneAndUpdate(
      { userId },
      { 
        $set: { 
          savedCareerPath: careerPathData,
          careerPathGeneratedAt: new Date()
        }
      },
      { upsert: true }
    );

    return res.json({
      success: true,
      careerPath: careerPathData,
      message: 'Career path generated and saved successfully'
    });
  } catch (error) {
    console.error('Generate career path error:', error);
    return res.status(500).json({ 
      message: 'Failed to generate career path',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getCareerPath = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;

    const careerPath = await Career.findOne({ userId, isActive: true });
    
    if (!careerPath) {
      return res.status(404).json({ message: 'No career path found' });
    }

    return res.json({
      success: true,
      careerPath,
      generatedAt: careerPath.generatedAt
    });
  } catch (error) {
    console.error('Get career path error:', error);
    return res.status(500).json({ message: 'Failed to get career path' });
  }
};

export const updateCareerPath = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const updateData = req.body;

    const careerPath = await Career.findOneAndUpdate(
      { userId, isActive: true },
      { 
        ...updateData,
        lastUpdated: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!careerPath) {
      return res.status(404).json({ message: 'No career path found to update' });
    }

    return res.json({
      success: true,
      careerPath,
      message: 'Career path updated successfully'
    });
  } catch (error) {
    console.error('Update career path error:', error);
    return res.status(500).json({ message: 'Failed to update career path' });
  }
};

export const deleteCareerPath = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;

    const careerPath = await Career.findOneAndUpdate(
      { userId, isActive: true },
      { isActive: false, lastUpdated: new Date() },
      { new: true }
    );

    if (!careerPath) {
      return res.status(404).json({ message: 'No career path found to delete' });
    }

    // Also clear from profile
    await Profile.findOneAndUpdate(
      { userId },
      { 
        $unset: { 
          savedCareerPath: 1,
          careerPathGeneratedAt: 1
        }
      }
    );

    return res.json({
      success: true,
      message: 'Career path deleted successfully'
    });
  } catch (error) {
    console.error('Delete career path error:', error);
    return res.status(500).json({ message: 'Failed to delete career path' });
  }
};

export const getResourceRecommendations = async (req: Request, res: Response) => {
  try {
    const { skill, level } = req.query;

    if (!skill) {
      return res.status(400).json({ message: 'Skill parameter is required' });
    }

    const resources = await GrokService.generateResourceRecommendations(
      skill as string, 
      (level as string) || 'beginner'
    );

    return res.json({
      success: true,
      resources,
      message: 'Resources generated successfully'
    });
  } catch (error: any) {
    console.error('Get resource recommendations error:', error);
    return res.status(500).json({ 
      message: 'Failed to get resource recommendations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Skill gap analysis removed as requested
export const analyzeSkillGap = async (_req: Request, res: Response) => {
  return res.status(501).json({ 
    message: 'Skill gap analysis is not implemented yet. This feature will be available soon.',
    success: false
  });
};

// Legacy support - keeping for backward compatibility
export const saveCareerPath = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { careerPath } = req.body;

    if (!careerPath) {
      return res.status(400).json({ message: 'Career path data is required' });
    }

    // Save to Career model
    await Career.findOneAndUpdate(
      { userId },
      {
        ...careerPath,
        lastUpdated: new Date()
      },
      { upsert: true, runValidators: true }
    );

    // Also update profile for backward compatibility
    await Profile.findOneAndUpdate(
      { userId },
      { 
        $set: { 
          savedCareerPath: careerPath,
          careerPathGeneratedAt: new Date()
        }
      },
      { upsert: true }
    );

    return res.json({
      success: true,
      message: 'Career path saved successfully'
    });
  } catch (error) {
    console.error('Save career path error:', error);
    return res.status(500).json({ 
      message: 'Failed to save career path',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Legacy support - keeping for backward compatibility
export const getSavedCareerPath = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;

    // Try to get from Career model first
    let careerPath = await Career.findOne({ userId, isActive: true });
    
    if (!careerPath) {
      // Fallback to profile for backward compatibility
      const profile = await Profile.findOne({ userId });
      if (profile?.savedCareerPath) {
        return res.json({
          success: true,
          careerPath: profile.savedCareerPath,
          generatedAt: profile.careerPathGeneratedAt
        });
      }
      return res.status(404).json({ message: 'No saved career path found' });
    }

    return res.json({
      success: true,
      careerPath,
      generatedAt: careerPath.generatedAt
    });
  } catch (error) {
    console.error('Get saved career path error:', error);
    return res.status(500).json({ message: 'Failed to get saved career path' });
  }
};