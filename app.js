import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import onboardingRoutes from './routes/onboardingRoutes.js';
import sortingHatRoutes from './routes/sortingHatRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import pointsRoutes from './routes/pointsRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import globalErrorHandler from './utils/globalErrorHandler.js';
import merchRoutes from './routes/merchRoute.js';
import accommodationRoutes from './routes/accommodationRoutes.js';
import AppError from './utils/appError.js';

const app = express();


//-------------------------------- 1.) GLOBAL MIDDLEWARES --------------------------------//

// Set security HTTP headers
app.use(helmet());

// Rate limiting to prevent brute force attacks
const limiter = rateLimit({
    max: 1000, // 100 requests per windowMs
    windowMs: 15 * 60 * 100, // 15 minutes
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body    
app.use(express.json({ limit: '50mb' })); // Limit body size (supports image uploads)
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Data sanitization against NoSQL query injection (Express v5 compatible)
// Note: req.query is read-only in Express v5, so we only sanitize body and params
app.use((req, res, next) => {
    if (req.body) {
        req.body = mongoSanitize.sanitize(req.body);
    }
    if (req.params) {
        req.params = mongoSanitize.sanitize(req.params);
    }
    next();
});

app.use(cookieParser()); // Parse cookies

// Print environment
console.log('🔍 NODE_ENV:', process.env.NODE_ENV);

// CORS configuration
const allowedOrigins = [
    'http://localhost:5173',           // Local Vite
    'http://localhost:3000',           // Local React/Next
    'https://qrscannerparsec.netlify.app'    // Production frontend (explicit)
];

// Add FRONTEND_URL if it exists and is different
if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

console.log('✅ Allowed CORS Origins:', allowedOrigins);

// CORS middleware with function-based origin check
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, or same-origin)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            console.log('✅ CORS allowed for origin:', origin);
            callback(null, true);
        } else {
            console.log('❌ CORS blocked for origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true, // Important for cookies
    optionsSuccessStatus: 200 // For legacy browsers
}));

// Development logging
if ((process.env.NODE_ENV || "").trim() === "development") {
    app.use(morgan('dev'));
}

//--------------------------------------- 2.) ROUTES ---------------------------------------//

// Test route
app.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to Parsec Backend API',
        status: 'running',
        timestamp: new Date().toISOString()
    });
});

// Auth routes (no onboarding required)
app.use('/api/parsec/v1/auth', authRoutes);

// Admin routes (secret admin panel - requires admin key for login) 
app.use('/api/parsec/v1/paneermoms', adminRoutes);

// Onboarding routes (no onboarding required - this is where they complete it!)
app.use('/api/parsec/v1/onboarding', onboardingRoutes);

// Sorting Hat routes (public stats, private sorting)
app.use('/api/parsec/v1/sorting-hat', sortingHatRoutes);

// Payment routes (user only)
app.use('/api/parsec/v1/payments', paymentRoutes);

// Order routes (user only)
app.use('/api/parsec/v1/orders', orderRoutes);

// Points routes (user only - add/view points)
app.use('/api/parsec/v1/points', pointsRoutes);

// merch routes (user + admin)
app.use('/api/parsec/v1/merch', merchRoutes);

// Accommodation routes (user only - booking)
app.use('/api/parsec/v1/accommodation', accommodationRoutes);


// 404 handler
app.all('/{*any}', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!!`, 404));
});


// Global error handler
app.use(globalErrorHandler);

export { app };