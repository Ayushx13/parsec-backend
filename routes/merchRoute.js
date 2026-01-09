import express from 'express';
import { getAllMerch, getMerchById } from '../controllers/merchController.js';

const router = express.Router();

// @route   GET /merch
// @desc    Get all merch items
// @access  Public
router.get('/', getAllMerch);

// @route   GET /merch/:id
// @desc    Get merch item by ID
// @access  Public
router.get('/:id', getMerchById);

export default router;
