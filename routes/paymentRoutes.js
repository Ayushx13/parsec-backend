import express from 'express';
import { recordPayment, getPaymentHistory } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';
import { requireOnboarding } from '../middleware/OnBoarding.js';
import { uploadPaymentScreenshot } from '../utils/cloudinaryConfig.js';

const router = express.Router();

// All payment routes require JWT + completed onboarding
router.use(protect);
router.use(requireOnboarding);

// @route   POST /payments
// @desc    Create a new payment record
// @access  Private (requires JWT + onboarding)
router.post('/', uploadPaymentScreenshot, recordPayment);

// @route   GET /payments/me
// @desc    Get payment history for logged-in user
// @access  Private (requires JWT + onboarding)
router.get('/me', getPaymentHistory);

export default router;