import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  analyzeProfile,
  getProfileReviews,
  getProfileReview,
  deleteProfileReview,
  updateReviewNotes,
  getProfileInsights
} from '../controllers/profileReviewer.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Profile analysis routes
router.post('/analyze', analyzeProfile);
router.get('/reviews', getProfileReviews);
router.get('/reviews/:reviewId', getProfileReview);
router.delete('/reviews/:reviewId', deleteProfileReview);
router.put('/reviews/:reviewId/notes', updateReviewNotes);
router.get('/insights', getProfileInsights);

export default router;