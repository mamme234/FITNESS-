import express from 'express';
import { body } from 'express-validator';
import { 
  register, 
  login, 
  telegramLogin,
  googleLogin,
  refreshToken, 
  forgotPassword, 
  resetPassword,
  verifyEmail,
  logout 
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { strictRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], register);

// Login
router.post('/login', strictRateLimiter, [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], login);

// Telegram Login
router.post('/telegram', telegramLogin);

// Google Login
router.post('/google', googleLogin);

// Refresh Token
router.post('/refresh', refreshToken);

// Forgot Password
router.post('/forgot-password', strictRateLimiter, [
  body('email').isEmail().withMessage('Valid email is required')
], forgotPassword);

// Reset Password
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], resetPassword);

// Verify Email
router.get('/verify/:token', verifyEmail);

// Logout
router.post('/logout', authenticate, logout);

export default router;
