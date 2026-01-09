import axios from 'axios';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

// Helper function to generate JWT
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN 
    });
};


//----------------------------------  Initiate Google OAuth flow  @route GET /auth/google -----------------------------------------------------------------
export const initiateGoogleAuth = (req, res) => {
    const redirectUri = process.env.NODE_ENV === 'production'
        ? 'https://parsec.iitdh.ac.in/api/parsec/v1/auth/google/callback'
        : 'http://localhost:3000/api/parsec/v1/auth/google/callback';
    
    const clientId = process.env.GOOGLE_CLIENT_ID;

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email profile`;

    res.redirect(authUrl);
};




//----------------------------------  Handle Google OAuth callback  @route GET /auth/google/callback -----------------------------------------------------------------  
export const handleGoogleCallback = catchAsync(async (req, res, next) => {
    const code = req.query.code;
    const redirectUri = process.env.NODE_ENV === 'production'
        ? 'https://parsec.iitdh.ac.in/api/parsec/v1/auth/google/callback'
        : 'http://localhost:3000/api/parsec/v1/auth/google/callback';

    if (!code) {
        return next(new AppError('Authorization code not provided', 400));
    }

    // Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
    });

    const accessToken = tokenResponse.data.access_token;

    // Get user profile
    const profileResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    const profile = profileResponse.data;
    console.log('Google user profile:', profile);

    // Find or create user in database
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
        user = await User.create({
            googleId: profile.id,
            email: profile.email,
            name: profile.name,
            givenName: profile.given_name,
            familyName: profile.family_name,
            avatar: profile.picture,
            emailVerified: profile.verified_email,
            provider: 'google',
            lastLogin: new Date()
        });
        console.log('✅ New user created:', user._id);
    } else {
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        console.log('✅ User logged in:', user._id);
    }

    // Generate JWT token
    const token = signToken(user._id);

    // Set cookie
    const cookieOptions = {
        expires: new Date(
            Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    };
    res.cookie('jwt', token, cookieOptions);

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/signup/auth?token=${token}`);
});



//----------------------------------  Logout user @route POST /auth/logout -----------------------------------------------------------------
export const logout = (req, res) => {
    // Clear the JWT cookie
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    
    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
};

//----------------------------------  Get current logged-in user @route GET /auth/me -----------------------------------------------------------------
export const getCurrentUser = (req, res) => {
    // Check if onboarding is complete
    const isOnboardingComplete = !!(
        req.user.college &&
        req.user.batch &&
        req.user.gender &&
        req.user.contactNumber &&
        req.user.aadharOrCollegeId &&
        req.user.merchSize
    );

    res.status(200).json({
        status: 'success',
        data: {
            user: {
                email: req.user.email,
                name: req.user.name,
                avatar: req.user.avatar,
                house: req.user.house,
                points: req.user.points,
                isOnboardingComplete
            }
        }
    });
};
