import mongoose from "mongoose";
import AccommodationBooking from "../models/accommodationBooking.js";
import AccommodationAvail from "../models/accommodation.js";
import User from "../models/user.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";



export const createAccommodationBooking = catchAsync(async (req, res, next) => {
    const { checkInDate, checkOutDate } = req.body;
    const userId = req.user.id; // user ID comes from authentication middleware

    // Validate required fields
    if (!checkInDate || !checkOutDate) {
        return next(new AppError('Please provide check-in date and check-out date', 400));
    }

    // Check if user exists and get gender
    const user = await User.findById(userId);
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Check if user has completed onboarding (gender is required)
    if (!user.gender) {
        return next(new AppError('Please complete your onboarding profile first', 400));
    }

    const gender = user.gender;

    // Parse dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validate dates
    if (checkIn < today) {
        return next(new AppError('Check-in date cannot be in the past', 400));
    }

    if (checkOut <= checkIn) {
        return next(new AppError('Check-out date must be after check-in date', 400));
    }

    // Calculate number of nights
    const diffTime = Math.abs(checkOut - checkIn);
    const numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Check availability for all dates in the booking range
    const dateArray = [];
    let currentDate = new Date(checkIn);
    
    while (currentDate < checkOut) {
        dateArray.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Check availability for each date
    const availabilityField = gender === 'male' ? 'mensAvailability' : 'womensAvailability';
    
    for (const date of dateArray) {
        const availability = await AccommodationAvail.findOne({ date });
        
        if (!availability || availability[availabilityField] <= 0) {
            return next(new AppError(`No availability for ${gender} on ${date.toDateString()}`, 400));
        }
    }

    // Calculating the total price (assuming a price per night)
    const pricePerNight = 700; 
    const totalPrice = numberOfNights * pricePerNight;


    // 🚩 Start atomic transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Create the booking within transaction
        const booking = await AccommodationBooking.create([{
            userId,
            userName: user.name,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            gender,
            numberOfNights,
            totalPrice,
            status: 'pending',
            paymentStatus: 'unpaid'
        }], { session });

        // Update availability for all dates in the booking range within transaction
        for (const date of dateArray) {
            const updateResult = await AccommodationAvail.findOneAndUpdate(
                { date, [availabilityField]: { $gt: 0 } },
                { $inc: { [availabilityField]: -1 } },
                { new: true, session }
            );

            // If update failed (no availability), throw error to rollback
            if (!updateResult) {
                throw new AppError(`Availability conflict for ${date.toDateString()}. Booking cancelled.`, 409);
            }
        }

        // Commit transaction - all operations succeeded
        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            status: 'success',
            data: {
                booking: booking[0]
            }
        });
    } catch (error) {
        // Rollback transaction - something went wrong
        await session.abortTransaction();
        session.endSession();
        
        // Pass error to error handler
        return next(error);
    }
});


export const getUserAccommodationBookings = catchAsync(async (req, res, next) => {
    const userId = req.user.id; // user ID comes from authentication middleware

    // Find all bookings for the user, sorted by check-in date (newest first)
    const bookings = await AccommodationBooking.find({ userId })
        .sort({ checkInDate: -1 });

    res.status(200).json({
        status: 'success',
        results: bookings.length,
        data: {
            bookings
        }
    });
});

