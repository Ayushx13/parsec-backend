import User from "../models/user.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";


export const submitOnboarding = catchAsync(async (req, res, next) => {
    const { college, batch, gender, contactNumber, aadharOrCollegeId, merchSize } = req.body;

    // Validate required fields
    if (!college || !batch || !gender || !contactNumber || !aadharOrCollegeId || !merchSize) {
        return next(new AppError('All onboarding fields are required.', 400));
    }

    // Validate enum values
    if (!['male', 'female', 'other'].includes(gender)) {
        return next(new AppError('Invalid gender value. Must be male, female, or other.', 400));
    }

    if (!['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].includes(merchSize.toUpperCase())) {
        return next(new AppError('Invalid merch size. Must be XS, S, M, L, XL, XXL, or XXXL.', 400));
    }

    // Update user with onboarding information
    const userId = req.user._id;
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
            college,
            batch,
            gender,
            contactNumber,
            aadharOrCollegeId,
            merchSize: merchSize.toUpperCase()
        },
        { 
            new: true, // Return updated document
            runValidators: true // Run schema validators
        }
    );

    if (!updatedUser) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Onboarding information submitted successfully',
        data: {
            user: {
                id: updatedUser._id,
                email: updatedUser.email,
                name: updatedUser.name,
                college: updatedUser.college,
                batch: updatedUser.batch,
                gender: updatedUser.gender,
                contactNumber: updatedUser.contactNumber,
                aadharOrCollegeId: updatedUser.aadharOrCollegeId,
                merchSize: updatedUser.merchSize
            }
        }
    });
});


export const getOnboardingStatus = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Check if onboarding is complete
    const isOnboardingComplete = !!(
        user.college && 
        user.batch && 
        user.gender && 
        user.contactNumber && 
        user.aadharOrCollegeId && 
        user.merchSize
    );

    res.status(200).json({
        success: true,
        data: {
            isOnboardingComplete,
            onboardingData: {
                college: user.college || null,
                batch: user.batch || null,
                gender: user.gender || null,
                contactNumber: user.contactNumber || null,
                aadharOrCollegeId: user.aadharOrCollegeId || null,
                merchSize: user.merchSize || null
            }
        }
    });
});