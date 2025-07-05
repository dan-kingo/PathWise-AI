import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  generateCareerPath,
  getResourceRecommendations,
  analyzeSkillGap,
  saveCareerPath,
  getSavedCareerPath
} from '../controllers/career.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Career path routes
router.post('/generate-path', generateCareerPath);
router.get('/resources', getResourceRecommendations);
router.post('/analyze-skills', analyzeSkillGap);
router.post('/save-path', saveCareerPath);
router.get('/saved-path', getSavedCareerPath);

export default router;