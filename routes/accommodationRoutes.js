import express from 'express';
import { protect } from '../middleware/auth.js';
import { requireOnboarding } from '../middleware/OnBoarding.js';
import { 
    createAccommodationBooking,
    getUserAccommodationBookings 
} from '../controllers/accommodationBookingController.js';

const router = express.Router();

// All routes require authentication + onboarding
router.use(protect);
router.use(requireOnboarding);

// @route   POST /accommodation
// @desc    Create accommodation booking 
// @access  Private (requires JWT + onboarding)
router.post('/', createAccommodationBooking);

// @route   GET /accommodation
// @desc    Get all accommodation bookings for current user
// @access  Private (requires JWT + onboarding)
router.get('/', getUserAccommodationBookings);

export default router;
