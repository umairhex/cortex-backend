import express from 'express';
import { getHealth } from './health.js';
import { signup, signin, signupValidation, signinValidation, refresh, logout, forgotPassword, resetPassword, forgotPasswordValidation, resetPasswordValidation } from '../controllers/auth.js';
import { authenticateToken } from '../middleware/auth.js';
import { authRateLimit } from '../middleware/rateLimit.js';
import User from '../models/User.js';

/**
 * Express router for API routes.
 * Defines all application routes.
 */
const router: express.Router = express.Router();

// Health check route
router.get('/health', getHealth);

// Auth routes with rate limiting
router.post('/signup', authRateLimit, signupValidation, signup);
router.post('/signin', authRateLimit, signinValidation, signin);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', authRateLimit, forgotPasswordValidation, forgotPassword);
router.post('/reset-password', resetPasswordValidation, resetPassword);

// Protected route example
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -refreshToken');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;