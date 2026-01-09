import { cleanupCloudinaryFile } from './cloudinaryConfig.js';

// Enhanced catchAsync that handles Cloudinary file cleanup on errors
const catchAsyncWithCleanup = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(async (err) => {
            // Clean up uploaded file if request fails
            await cleanupCloudinaryFile(req);
            next(err);
        });
    };
};

export default catchAsyncWithCleanup;
