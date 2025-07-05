import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  getProfile,
  updateProfile,
  updateLearningProgress,
  uploadAvatar,
  deleteProfile,
  checkProfileStatus
} from '../controllers/profile.controller.js';

const router = express.Router();

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (_, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
}); 

const upload = multer({
  storage, 
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get('/', getProfile);
router.get('/status', checkProfileStatus);
router.put('/', updateProfile);
router.put('/learning-progress', updateLearningProgress);
router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.delete('/', deleteProfile);

export default router;