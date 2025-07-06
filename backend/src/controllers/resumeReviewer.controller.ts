import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { resumeStorage } from '../configs/cloudinary.js';
import ResumeParserService from '../services/resumeParser.service.js';
import ResumeAnalyzerService from '../services/resumeAnalyzer.service.js';
// Update your imports to include the proper types
import { Types } from 'mongoose';
import ResumeReview from '../models/resumeReview.model';

// Utility function to properly create subdocuments
function createSubdocumentArray<T>(parentDoc: any, path: string, items: T[]): Types.DocumentArray<T> {
  const schemaType = parentDoc.schema.path(path);
  if (!schemaType) {
    throw new Error(`Schema path ${path} not found`);
  }
  return new Types.DocumentArray(items.map(item => new schemaType.casterConstructor(item)));
}
// Configure multer for resume uploads
const upload = multer({
  storage: resumeStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || 
                    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                    file.mimetype === 'application/msword';

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  }
});

export const uploadResume = upload.single('resume');

export const analyzeResume = async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    const userId = (req.user as any).id;
    const { targetRole, targetIndustry, experienceLevel, additionalContext } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ 
        message: 'No resume file uploaded' 
      });
    }

    const file = req.file as Express.Multer.File;
    const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);

    // Create initial resume review record
    const resumeReview = new ResumeReview({
      userId,
      fileName: file.originalname,
      fileUrl: file.path,
      fileType: fileExtension,
      fileSize: file.size,
      cloudinaryPublicId: (file as any).filename, // Cloudinary specific
      targetRole,
      targetIndustry,
      experienceLevel: experienceLevel || 'mid',
      additionalContext,
      extractedText: '',
      analysisResult: {} as any, // Temporary, will be updated
      analysisStatus: 'processing'
    });

    await resumeReview.save();

    try {
      // Parse the resume
      console.log('Parsing resume:', file.path);
      const parsedResume = await ResumeParserService.parseResume(file.path, fileExtension);
      
      // Update with extracted content
      resumeReview.extractedText = parsedResume.text;
      resumeReview.extractedSections = parsedResume.sections;
      await resumeReview.save();

      // Analyze the resume
      console.log('Analyzing resume content...');
      const analysisResult = await ResumeAnalyzerService.analyzeResume({
        extractedText: parsedResume.text,
        extractedSections: parsedResume.sections,
        targetRole,
        targetIndustry,
        experienceLevel,
        additionalContext,
        fileName: file.originalname,
        fileType: fileExtension
      });

      // Convert the analysis result to proper Mongoose document format
      const convertedResult = {
        ...analysisResult,
        sectionAnalysis: createSubdocumentArray(
          resumeReview, 
          'analysisResult.sectionAnalysis', 
          analysisResult.sectionAnalysis
        ),
        skillsAnalysis: {
          ...analysisResult.skillsAnalysis,
          identifiedSkills: createSubdocumentArray(
            resumeReview,
            'analysisResult.skillsAnalysis.identifiedSkills',
            analysisResult.skillsAnalysis.identifiedSkills
          )
        }
      };

      // Update with analysis results
      resumeReview.analysisResult = convertedResult;
      resumeReview.analysisStatus = 'completed';
      const processingTime = Date.now() - startTime;
      resumeReview.processingTime = processingTime;
      await resumeReview.save();

      // Clean up temporary file if it exists locally
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return res.json({
        success: true,
        analysis: analysisResult,
        reviewId: resumeReview._id,
        processingTime,
        message: 'Resume analysis completed successfully'
      });

    } catch (analysisError) {
      console.error('Analysis error:', analysisError);
      
      // Update status to failed
      resumeReview.analysisStatus = 'failed';
      await resumeReview.save();

      return res.status(500).json({
        message: 'Failed to analyze resume content',
        error: analysisError instanceof Error ? analysisError.message : 'Unknown error',
        reviewId: resumeReview._id
      });
    }

  } catch (error) {
    console.error('Resume analysis error:', error);
    return res.status(500).json({ 
      message: 'Failed to process resume',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
export const getResumeReviews = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { status, limit = 10, page = 1 } = req.query;

    const query: any = { userId };
    if (status && ['pending', 'processing', 'completed', 'failed'].includes(status as string)) {
      query.analysisStatus = status;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const reviews = await ResumeReview.find(query)
      .sort({ analyzedAt: -1 })
      .limit(parseInt(limit as string))
      .skip(skip)
      .select('-extractedText'); // Exclude large text field from list view

    const total = await ResumeReview.countDocuments(query);

    return res.json({
      success: true,
      reviews,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Get resume reviews error:', error);
    return res.status(500).json({ 
      message: 'Failed to get resume reviews' 
    });
  }
};

export const getResumeReview = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { reviewId } = req.params;

    const review = await ResumeReview.findOne({ 
      _id: reviewId, 
      userId 
    });

    if (!review) {
      return res.status(404).json({ 
        message: 'Resume review not found' 
      });
    }

    return res.json({
      success: true,
      review
    });
  } catch (error) {
    console.error('Get resume review error:', error);
    return res.status(500).json({ 
      message: 'Failed to get resume review' 
    });
  }
};

export const updateResumeReview = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { reviewId } = req.params;
    const { userNotes, implementedSuggestions, rating, feedback } = req.body;

    const review = await ResumeReview.findOneAndUpdate(
      { _id: reviewId, userId },
      { 
        userNotes,
        implementedSuggestions: implementedSuggestions || [],
        rating,
        feedback,
        lastUpdated: new Date()
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ 
        message: 'Resume review not found' 
      });
    }

    return res.json({
      success: true,
      review,
      message: 'Resume review updated successfully'
    });
  } catch (error) {
    console.error('Update resume review error:', error);
    return res.status(500).json({ 
      message: 'Failed to update resume review' 
    });
  }
};

export const deleteResumeReview = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { reviewId } = req.params;

    const review = await ResumeReview.findOne({ 
      _id: reviewId, 
      userId 
    });

    if (!review) {
      return res.status(404).json({ 
        message: 'Resume review not found' 
      });
    }

    // Delete file from Cloudinary
    try {
      const cloudinary = (await import('../configs/cloudinary.js')).default;
      await cloudinary.uploader.destroy(review.cloudinaryPublicId, { resource_type: 'raw' });
    } catch (cloudinaryError) {
      console.error('Failed to delete file from Cloudinary:', cloudinaryError);
      // Continue with database deletion even if Cloudinary deletion fails
    }

    await ResumeReview.findByIdAndDelete(reviewId);

    return res.json({
      success: true,
      message: 'Resume review deleted successfully'
    });
  } catch (error) {
    console.error('Delete resume review error:', error);
    return res.status(500).json({ 
      message: 'Failed to delete resume review' 
    });
  }
};

export const getResumeInsights = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    
    const reviews = await ResumeReview.find({ 
      userId, 
      analysisStatus: 'completed' 
    }).sort({ analyzedAt: -1 });

    if (reviews.length === 0) {
      return res.json({
        success: true,
        insights: {
          totalReviews: 0,
          averageScore: 0,
          improvementTrend: [],
          topWeaknesses: [],
          completionRate: 0,
          averageProcessingTime: 0
        }
      });
    }

    // Calculate insights
    const totalReviews = reviews.length;
    const averageScore = reviews.reduce((sum, review) => 
      sum + (review.analysisResult?.overallScore || 0), 0) / totalReviews;

    const improvementTrend = reviews.slice(0, 5).map(review => ({
      date: review.analyzedAt,
      score: review.analysisResult?.overallScore || 0,
      fileName: review.fileName
    }));

    // Get most common weaknesses
    const allWeaknesses = reviews.flatMap(review => 
      review.analysisResult?.sectionAnalysis?.flatMap((section: any) => section.weaknesses) || []
    );
    
    const weaknessCounts = allWeaknesses.reduce((acc, weakness) => {
      acc[weakness] = (acc[weakness] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topWeaknesses = Object.entries(weaknessCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([weakness, count]) => ({ weakness, count }));

    // Calculate completion rate (implemented suggestions)
    const totalSuggestions = reviews.reduce((sum, review) => 
      sum + (review.analysisResult?.recommendations?.immediate?.length || 0) +
            (review.analysisResult?.recommendations?.shortTerm?.length || 0), 0);
    
    const implementedSuggestions = reviews.reduce((sum, review) => 
      sum + (review.implementedSuggestions?.length || 0), 0);
    
    const completionRate = totalSuggestions > 0 ? 
      (implementedSuggestions / totalSuggestions) * 100 : 0;

    // Average processing time
    const averageProcessingTime = reviews.reduce((sum, review) => 
      sum + (review.processingTime || 0), 0) / totalReviews;

    return res.json({
      success: true,
      insights: {
        totalReviews,
        averageScore: Math.round(averageScore * 10) / 10,
        improvementTrend,
        topWeaknesses,
        completionRate: Math.round(completionRate * 10) / 10,
        averageProcessingTime: Math.round(averageProcessingTime)
      }
    });
  } catch (error) {
    console.error('Get resume insights error:', error);
    return res.status(500).json({ 
      message: 'Failed to get resume insights' 
    });
  }
};

export const downloadResume = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { reviewId } = req.params;

    const review = await ResumeReview.findOne({ 
      _id: reviewId, 
      userId 
    });

    if (!review) {
      return res.status(404).json({ 
        message: 'Resume review not found' 
      });
    }

    // Redirect to Cloudinary URL for download
    return res.redirect(review.fileUrl);
  } catch (error) {
    console.error('Download resume error:', error);
    return res.status(500).json({ 
      message: 'Failed to download resume' 
    });
  }
};

export const reanalyzeResume = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { reviewId } = req.params;
    const { targetRole, targetIndustry, experienceLevel, additionalContext } = req.body;

    const review = await ResumeReview.findOne({ 
      _id: reviewId, 
      userId 
    });

    if (!review) {
      return res.status(404).json({ 
        message: 'Resume review not found' 
      });
    }

    if (!review.extractedText) {
      return res.status(400).json({ 
        message: 'No extracted text available for reanalysis' 
      });
    }

    const startTime = Date.now();

    // Update analysis context
    review.targetRole = targetRole || review.targetRole;
    review.targetIndustry = targetIndustry || review.targetIndustry;
    review.experienceLevel = experienceLevel || review.experienceLevel;
    review.additionalContext = additionalContext || review.additionalContext;
    review.analysisStatus = 'processing';
    await review.save();

    try {
      // Re-analyze with new context
      const analysisResult = await ResumeAnalyzerService.analyzeResume({
        extractedText: review.extractedText,
        extractedSections: review.extractedSections,
        targetRole: review.targetRole ?? undefined,
        targetIndustry: review.targetIndustry ?? undefined,
        experienceLevel: review.experienceLevel ?? undefined,
        additionalContext: review.additionalContext ?? undefined,
        fileName: review.fileName,
        fileType: review.fileType
      });

      // Update with new analysis results
      const processingTime = Date.now() - startTime;
      // Convert sectionAnalysis to DocumentArray if necessary
      if (Array.isArray(analysisResult.sectionAnalysis) && review.schema.path('analysisResult.sectionAnalysis')) {
        // @ts-ignore
        analysisResult.sectionAnalysis = (review as any).analysisResult.create(analysisResult.sectionAnalysis);
      }
      review.analysisResult = analysisResult;
      review.analysisStatus = 'completed';
      review.processingTime = processingTime;
      review.lastUpdated = new Date();
      await review.save();

      return res.json({
        success: true,
        analysis: analysisResult,
        processingTime,
        message: 'Resume reanalysis completed successfully'
      });

    } catch (analysisError) {
      console.error('Reanalysis error:', analysisError);
      
      review.analysisStatus = 'failed';
      await review.save();

      return res.status(500).json({
        message: 'Failed to reanalyze resume',
        error: analysisError instanceof Error ? analysisError.message : 'Unknown error'
      });
    }

  } catch (error) {
    console.error('Reanalyze resume error:', error);
    return res.status(500).json({ 
      message: 'Failed to reanalyze resume' 
    });
  }
};