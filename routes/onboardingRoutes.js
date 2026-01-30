import express from 'express';
import { submitOnboarding, getOnboardingStatus, onBoardingUpdate } from '../controllers/onBoardingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /onboarding/submit
// @desc    Submit onboarding information
// @access  Private (requires JWT)
router.post('/submit', protect, submitOnboarding);

// @route   GET /onboarding/status
// @desc    Get onboarding status
// @access  Private (requires JWT)
router.get('/status', protect, getOnboardingStatus);

// @route   PATCH /onboarding/update
// @desc    Update onboarding information
// @access  Private (requires JWT)
router.patch('/update', protect, onBoardingUpdate);


export default router;
