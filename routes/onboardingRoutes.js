import express from 'express';
import { submitOnboarding } from '../controllers/onBoardingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /onboarding/submit
// @desc    Submit onboarding information
// @access  Private (requires JWT)
router.post('/submit', protect, submitOnboarding);

export default router;
