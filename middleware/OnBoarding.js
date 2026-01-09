import user from "../models/user.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

// Middleware to check if user has completed onBoarding or not ?
export const requireOnboarding = catchAsync(async (req, res, next) => {
    const currentUser = await user.findById(req.user.id || req.user._id).select('college batch gender contactNumber aadharOrCollegeId merchSize');

    // Check if all onboarding fields are filled
    const isOnboardingComplete = !!(
        currentUser.college && 
        currentUser.batch && 
        currentUser.gender &&
        currentUser.contactNumber && 
        currentUser.aadharOrCollegeId &&
        currentUser.merchSize
    )
    
    if (!isOnboardingComplete) {
        return next(
            new AppError('Please complete your onboarding before accessing this resource.', 403)
        );
    }

    next();
});