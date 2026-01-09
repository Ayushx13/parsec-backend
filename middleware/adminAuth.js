import jwt from 'jsonwebtoken';
import AppError from '../utils/appError.js';

// Middleware to verify admin token (after login)
export const verifyAdminToken = (req, res, next) => {
    try {
        // Get token from header
        let token;
        
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new AppError('Admin authentication required', 401));
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.isAdmin || decoded.type !== 'admin') {
            return next(new AppError('Access denied. Admin privileges required.', 403));
        }

        req.isAdmin = true;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return next(new AppError('Invalid admin token', 401));
        }
        if (error.name === 'TokenExpiredError') {
            return next(new AppError('Admin token has expired. Please login again.', 401));
        }
        return next(error);
    }
};

// // Original middleware for direct admin key verification (kept for backward compatibility)
// export const verifyAdminKey = (req, res, next) => {
//     const adminKey = req.headers['x-admin-key'] || req.query.adminKey || req.body.adminKey;

//     if (!adminKey) {
//         return next(new AppError('Admin key is required', 401));
//     }

//     if (adminKey !== process.env.ADMIN_SECRET_KEY) {
//         return next(new AppError('Chala ja bsdk yaha se', 403));
//     }

//     req.isAdmin = true;
//     next();
// };
