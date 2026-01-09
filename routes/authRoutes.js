import express from 'express';
import { initiateGoogleAuth, handleGoogleCallback, logout, getCurrentUser } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /auth/google
// @desc    Initiate Google OAuth flow
// @access  Public
router.get('/google', initiateGoogleAuth);

// @route   GET /auth/google/callback
// @desc    Handle Google OAuth callback
// @access  Public
router.get('/google/callback', handleGoogleCallback);

// @route   POST /auth/logout
// @desc    Logout user
// @access  Private (requires JWT)
router.post('/logout', protect, logout);

// @route   GET /auth/me
// @desc    Get current logged-in user
// @access  Private (requires JWT)
router.get('/me', protect, getCurrentUser);

export default router;
