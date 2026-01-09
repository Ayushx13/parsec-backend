import express from 'express';
import { verifyEventPassQR } from '../controllers/qrController.js';
import { verifyAdminToken } from '../middleware/adminAuth.js';

const router = express.Router();

// @route   POST /paneermoms/qr/verify
// @desc    Verify event pass QR code at venue (admin only)
// @access  Private (requires admin token)
router.post('/verify',verifyAdminToken , verifyEventPassQR);

export default router;
