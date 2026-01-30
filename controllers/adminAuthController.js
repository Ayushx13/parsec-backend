import jwt from 'jsonwebtoken';
import AppError from '../utils/appError.js';

// @route   POST /paneermoms/login
// @desc    Verify admin key and return admin token
// @access  Public
export const adminLogin = (req, res, next) => {
    const { adminKey } = req.body;

    if (!adminKey) {
        return next(new AppError('Admin key is required', 401));
    }

    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
        return next(new AppError('Invalid Admin Key', 403));
    }

    // Generate admin JWT token (expires in 1 hour)
    const adminToken = jwt.sign(
        { isAdmin: true, type: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.status(200).json({
        status: 'success',
        message: 'Admin authenticated successfully',
        data: {
            token: adminToken
        }
    });
};
