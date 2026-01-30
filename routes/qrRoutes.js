import express from 'express';
import { verifyEventPassQR , getQR } from '../controllers/qrController.js';
import { verifyAdminToken } from '../middleware/adminAuth.js';

const router = express.Router();

// @route   POST /paneermoms/qr/verify
// @desc    Verify event pass QR code at venue (admin only)
// @access  Private (requires admin token)
router.post('/verify',verifyAdminToken , verifyEventPassQR);

// @route   POST /paneermoms/qr/get
// @desc    Get QR record and check if used (for frontend QR scan check)
// @access  Private (requires admin token)
router.post('/get', verifyAdminToken, getQR);

export default router;
