import express from 'express';
import { sortUser, getHouseStats, getMyHouse } from '../controllers/sortingHatController.js';
import { protect } from '../middleware/auth.js';
import { requireOnboarding } from '../middleware/OnBoarding.js';

const router = express.Router();

//---------------------------------- PUBLIC ROUTES ----------------------------------//

// @route   GET /sorting-hat/stats
// @desc    Get house statistics (public leaderboard)
// @access  Public
router.get('/stats', getHouseStats);

//---------------------------------- PROTECTED ROUTES ----------------------------------//

// @route   GET /sorting-hat/my-house
// @desc    Get current user's house information
// @access  Private (requires JWT + completed onboarding)
router.get('/my-house',  protect, requireOnboarding, getMyHouse);

// @route   POST /sorting-hat/sort
// @desc    Assign house to user (after onboarding)
// @access  Private (requires JWT + completed onboarding)
router.post('/sort', protect, requireOnboarding, sortUser);

export default router;
