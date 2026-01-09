import User from "../models/user.js";
import House from '../models/house.js';
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

export const getPoints = catchAsync(async (req,res,next)=>{
    const userId = req.user.id;
    const user = await User.findById(userId).select('points');
    if (!user) {
        return next(new AppError('User not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            points: user.points
        }
    });
});

export const addpoints  = catchAsync(async (req,res,next)=>{
    const { email, pointsToAdd } = req.body;

    // Validate required fields
    if (!email) {
        return next(new AppError('User email is required', 400));
    }

    // Validate points input
    if (typeof pointsToAdd !== 'number' || pointsToAdd <= 0) {
        return next(new AppError('Invalid points value. Points must be a positive number', 400));
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Check if user has a house assigned
    if (!user.house) {
        return next(new AppError('User is not assigned to any house', 400));
    }

    // Add points to user
    user.points += pointsToAdd;
    await user.save();

    // Add same points to user's house
    const house = await House.findOneAndUpdate(
        { name: user.house },
        { $inc: { points: pointsToAdd } },
        { new: true }
    );

    if (!house) {
        return next(new AppError('House not found', 404));
    }

    res.status(200).json({
        status: 'success',
        message: `${pointsToAdd} points added successfully`,
        data: {
            user: {
                id: user._id,
                name: user.name,
                points: user.points,
                house: user.house
            },
            house: {
                name: house.name,
                totalPoints: house.points
            }
        }
    });
});


export const subtractpoints  = catchAsync(async (req,res,next)=>{
    const { email, pointsToSubtract } = req.body;   

    // Validate required fields
    if (!email) {
        return next(new AppError('User email is required', 400));
    }

    // Validate points input
    if (typeof pointsToSubtract !== 'number' || pointsToSubtract <= 0) {
        return next(new AppError('Invalid points value. Points must be a positive number', 400));
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Check if user has a house assigned
    if (!user.house) {
        return next(new AppError('User is not assigned to any house', 400));
    }

    // Check if subtraction would result in negative points
    if (user.points < pointsToSubtract) {
        return next(new AppError(`Cannot subtract ${pointsToSubtract} points. User only has ${user.points} points`, 400));
    }

    // Subtract points from user
    user.points -= pointsToSubtract;
    await user.save();

    // Subtract same points from user's house
    const house = await House.findOneAndUpdate(
        { name: user.house },
        { $inc: { points: -pointsToSubtract } },
        { new: true }
    );

    if (!house) {
        return next(new AppError('House not found', 404));
    }

    res.status(200).json({
        status: 'success',
        message: `${pointsToSubtract} points subtracted successfully`,
        data: {
            user: {
                id: user._id,
                name: user.name,
                points: user.points,
                house: user.house
            },
            house: {
                name: house.name,
                totalPoints: house.points
            }
        }
    });
});
