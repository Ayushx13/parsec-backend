import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'payment-screenshots',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    }
});

// Create multer upload middleware
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG and PNG files are allowed.'), false);
        }
    }
});

// Middleware wrapper with error handling
export const uploadPaymentScreenshot = (req, res, next) => {
    upload.single('paymentScreenshot')(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return next(new Error('File size exceeds 5MB limit.'));
                }
                return next(new Error(`Upload error: ${err.message}`));
            }
            return next(err);
        }
        next();
    });
};

// Cleanup utility for deleting uploaded files on error
export const cleanupCloudinaryFile = async (req) => {
    if (req.file && req.file.filename) {
        try {
            await cloudinary.uploader.destroy(req.file.filename);
        } catch (err) {
            console.error('Failed to delete uploaded file from Cloudinary:', err);
        }
    }
};

export default cloudinary;
