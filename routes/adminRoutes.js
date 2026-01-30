import express from 'express';
import { verifyAdminToken } from '../middleware/adminAuth.js';
import { adminLogin } from '../controllers/adminAuthController.js';
import { getAllPaymentHistories, verifyPayment, rejectPayment, getAdminStats } from '../controllers/paymentController.js';
import { addpoints, subtractpoints } from '../controllers/pointsController.js';
import { addMerch, updateMerchStock, deleteMerch } from '../controllers/merchController.js';
import { bulkUpdateOrdersWithGender } from '../controllers/orderController.js';
import { givePass, giveAccommodationCulturalEventPass, getAccommodationBookingEmails } from '../controllers/givePassController.js';
import accommodationAdminRoutes from './accommodationAdminRoutes.js';
import qrRoutes from './qrRoutes.js';

const router = express.Router();

/**
 * Admin Authentication Flow:
 * 
 * 1. Admin enters admin key on login page
 * 2. Backend verifies key and returns JWT token
 * 3. Frontend stores token (localStorage/sessionStorage)
 * 4. All subsequent admin requests use this token
 * 
 * Token is valid for 1 hour
*/


// --------------------------------------------- Admin Login Routes --------------------------------------------------//

// @route   POST /paneermoms/login
// @desc    Verify admin key and return admin token
// @access  Public
router.post('/login', adminLogin);

//-------------------------------------------- Payments Management Routes -------------------------------------------------//

// Apply admin token verification to all routes below
router.use(verifyAdminToken);

// @route   GET /paneermoms/payments
// @desc    Get all payment histories (admin only)
// @access  Private (requires admin token)
router.get('/payments', getAllPaymentHistories);

// @route   PATCH /paneermoms/payments/:id/verify
// @desc    Verify a payment (admin only)
// @access  Private (requires admin token)
router.patch('/payments/:id/verify', verifyPayment);

// @route   PATCH /paneermoms/payments/:id/reject
// @desc    Reject a payment (admin only)
// @access  Private (requires admin token)
router.patch('/payments/:id/reject', rejectPayment);

// @route   GET /paneermoms/payments/stats
// @desc    Get payment statistics (admin only)
// @access  Private (requires admin token)
router.get('/payments/stats', getAdminStats);

// -------------------------------------------- House Points Management Routes -------------------------------------------------//

// @route   POST /paneermoms/points/add
// @desc    Add points to a user and their house (admin only)
// @access  Private (requires admin token)
router.post('/points/add', addpoints);

// @route   POST /paneermoms/points/subtract
// @desc    Subtract points from a user and their house (admin only)
// @access  Private (requires admin token)
router.post('/points/subtract', subtractpoints);

// -------------------------------------------- Merch Management Routes -------------------------------------------------//

// @route   POST /paneermoms/merch
// @desc    Add new merch item (admin only)
// @access  Private (requires admin token)
router.post('/merch', addMerch);

// @route   PATCH /paneermoms/merch/:id/stock
// @desc    Update merch stock quantity (admin only)
// @access  Private (requires admin token)
router.patch('/merch/:id/stock', updateMerchStock);

// @route   DELETE /paneermoms/merch/:id
// @desc    Delete merch item by ID (admin only)
// @access  Private (requires admin token)
router.delete('/merch/:id', deleteMerch);

// -------------------------------------------- Orders Management Routes -------------------------------------------------//

// @route   PATCH /paneermoms/orders/bulk/update-gender
// @desc    Bulk update all orders with gender from user data (admin only)
// @access  Private (requires admin token)
router.patch('/orders/bulk/update-gender', bulkUpdateOrdersWithGender);

// -------------------------------------------- Free Pass Distribution Routes -------------------------------------------------//

// @route   POST /paneermoms/give-pass
// @desc    Issue free opening ceremony pass to user (admin only)
// @access  Private (requires admin token)
router.post('/give-pass', givePass);

// @route   POST /paneermoms/give-accommodation-pass
// @desc    Issue complementary accommodation cultural event pass to user (admin only)
// @access  Private (requires admin token)
router.post('/give-accommodation-pass', giveAccommodationCulturalEventPass);

// @route   GET /paneermoms/accommodation-booking-emails
// @desc    Get emails of users with accommodation bookings within a date range (admin only)
// @access  Private (requires admin token)
// @query   startDate - Start date in YYYY-MM-DD format
// @query   endDate - End date in YYYY-MM-DD format
router.get('/accommodation-booking-emails', getAccommodationBookingEmails);

// -------------------------------------------- Accommodation Availability Management Routes -------------------------------------------------//

// @route   /paneermoms/accommodation
// @desc    Accommodation availability management (admin only)
// @access  Private (requires admin token)
router.use('/accommodation', accommodationAdminRoutes);

// -------------------------------------------- QR Code Verification Routes -------------------------------------------------//

// @route   /paneermoms/qr
// @desc    QR code verification (admin only)
// @access  Private (requires admin token)
router.use('/qr', qrRoutes);

export default router;
