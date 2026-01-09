import express from 'express';
import { createOrder , getOrderByMe } from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';
import { requireOnboarding } from '../middleware/OnBoarding.js';

const router = express.Router();
// All order routes require JWT + completed onboarding
router.use(protect);
router.use(requireOnboarding); 

// @route   POST /orders
// @desc    Create a new order
// @access  Private (requires JWT + onboarding)
router.post('/', createOrder);  

// @route   GET /orders/me
// @desc    Get order history for logged-in user
// @access  Private (requires JWT + onboarding)
router.get('/me', getOrderByMe);


export default router;