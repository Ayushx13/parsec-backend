import express from 'express';
import { protect } from '../middleware/auth.js';
import { requireOnboarding } from '../middleware/OnBoarding.js';

const router = express.Router();

// Example protected route that requires onboarding completion
// @route   GET /api/dashboard
// @desc    Get user dashboard (requires completed onboarding)
// @access  Private + Onboarding Required
router.get('/dashboard', protect, requireOnboarding, (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to your dashboard!',
        data: {
            user: {
                name: req.user.name,
                email: req.user.email,
                college: req.user.college,
                batch: req.user.batch
            }
        }
    });
});

// Example: Get all events (requires onboarding)
// @route   GET /api/events
// @desc    Get all events
// @access  Private + Onboarding Required
router.get('/events', protect, requireOnboarding, (req, res) => {
    res.json({
        success: true,
        message: 'Here are all the events',
        data: {
            events: [
                { id: 1, name: 'Tech Talk', date: '2025-11-01' },
                { id: 2, name: 'Hackathon', date: '2025-11-15' }
            ]
        }
    });
});

// Example: Register for event (requires onboarding)
// @route   POST /api/events/:id/register
// @desc    Register for an event
// @access  Private + Onboarding Required
router.post('/events/:id/register', protect, requireOnboarding, (req, res) => {
    res.json({
        success: true,
        message: `You have registered for event ${req.params.id}`,
        data: {
            user: req.user.name,
            eventId: req.params.id
        }
    });
});

export default router;
