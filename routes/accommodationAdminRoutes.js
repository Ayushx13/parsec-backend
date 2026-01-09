import express from 'express';
import { createAvailability, modifyAvailability } from '../controllers/accommodationController.js';

const router = express.Router();

// @route   POST /paneermoms/accommodation
// @desc    Create accommodation availability for a date (admin only)
// @access  Private (requires admin token via adminRoutes)
router.post('/', createAvailability);

// @route   PATCH /paneermoms/accommodation
// @desc    Modify accommodation availability for a date (admin only)
// @access  Private (requires admin token via adminRoutes)
router.patch('/', modifyAvailability);

export default router;
