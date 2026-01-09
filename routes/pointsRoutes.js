import express from 'express';
import { getPoints } from '../controllers/pointsController.js';
import { protect } from '../middleware/auth.js';
import { requireOnboarding } from '../middleware/OnBoarding.js';

const router = express.Router();

// All routes require authentication + onboarding
router.use(protect);
router.use(requireOnboarding);

// @route   GET /points
// @desc    Get current user's points
// @access  Private (requires JWT + onboarding)
router.get('/', getPoints);

export default router;
