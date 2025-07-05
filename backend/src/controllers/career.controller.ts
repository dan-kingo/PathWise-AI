import { Request, Response } from 'express';
import GrokService from '../services/grok.service.js';
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

    const careerPath = await GrokService.generateCareerPath(careerPathRequest);

    return res.json({
      success: true,
      careerPath,
      message: 'Career path generated successfully'
    });
  } catch (error) {
    console.error('Generate career path error:', error);
    return res.status(500).json({ 
      message: 'Failed to generate career path',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
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
  } catch (error) {
    console.error('Get resource recommendations error:', error);
    return res.status(500).json({ 
      message: 'Failed to get resource recommendations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const analyzeSkillGap = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { targetRole } = req.body;

    if (!targetRole) {
      return res.status(400).json({ message: 'Target role is required' });
    }

    // Get user profile
    const profile = await Profile.findOne({ userId });
    const currentSkills = profile?.skills || [];

    const analysis = await GrokService.analyzeSkillGap(currentSkills, targetRole);

    return res.json({
      success: true,
      analysis,
      message: 'Skill gap analysis completed'
    });
  } catch (error) {
    console.error('Analyze skill gap error:', error);
    return res.status(500).json({ 
      message: 'Failed to analyze skill gap',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const saveCareerPath = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { careerPath } = req.body;

    if (!careerPath) {
      return res.status(400).json({ message: 'Career path data is required' });
    }

    // Update profile with the saved career path
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

export const getSavedCareerPath = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;

    const profile = await Profile.findOne({ userId });
    
    if (!profile?.savedCareerPath) {
      return res.status(404).json({ message: 'No saved career path found' });
    }

    return res.json({
      success: true,
      careerPath: profile.savedCareerPath,
      generatedAt: profile.careerPathGeneratedAt
    });
  } catch (error) {
    console.error('Get saved career path error:', error);
    return res.status(500).json({ message: 'Failed to get saved career path' });
  }
};