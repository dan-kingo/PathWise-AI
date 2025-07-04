import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Google Auth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const user = req.user as any;

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/error?message=Authentication failed`);
    }

    // Create JWT
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        provider: user.provider
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/success?token=${token}`);
  }
);

// LinkedIn Auth Routes
router.get('/linkedin', passport.authenticate('linkedin'));

router.get('/linkedin/callback',
  passport.authenticate('linkedin', { session: false }),
  (req, res) => {
    const user = req.user as any;

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/error?message=Authentication failed`);
    }

    // Create JWT
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        provider: user.provider
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/success?token=${token}`);
  }
);

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const User = (await import('../models/user.model.js')).default;
    const user = await User.findById((req.user as any).id).select('-googleId -linkedinId');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        provider: user.provider,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;