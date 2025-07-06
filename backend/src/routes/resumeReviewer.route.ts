import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  uploadResume,
  analyzeResume,
  getResumeReviews,
  getResumeReview,
  updateResumeReview,
  deleteResumeReview,
  getResumeInsights,
  downloadResume,
  reanalyzeResume
} from '../controllers/resumeReviewer.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Resume analysis routes
router.post('/analyze', uploadResume, analyzeResume);
router.post('/reanalyze/:reviewId', reanalyzeResume);

// Resume review management
router.get('/reviews', getResumeReviews);
router.get('/reviews/:reviewId', getResumeReview);
router.put('/reviews/:reviewId', updateResumeReview);
router.delete('/reviews/:reviewId', deleteResumeReview);

// Download resume
router.get('/reviews/:reviewId/download', downloadResume);

// Analytics and insights
router.get('/insights', getResumeInsights);

export default router;