import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  generateCareerPath,
  getCareerPath,
  updateCareerPath,
  deleteCareerPath,
  getResourceRecommendations,
  analyzeSkillGap,
  saveCareerPath,
  getSavedCareerPath
} from '../controllers/career.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// New Career model routes
router.post('/generate-path', generateCareerPath);
router.get('/path', getCareerPath);
router.put('/path', updateCareerPath);
router.delete('/path', deleteCareerPath);

// Resource and analysis routes
router.get('/resources', getResourceRecommendations);
router.post('/analyze-skills', analyzeSkillGap);

// Legacy routes for backward compatibility
router.post('/save-path', saveCareerPath);
router.get('/saved-path', getSavedCareerPath);

export default router;