import AccommodationAvail from "../models/accommodation.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";


export const createAvailability = catchAsync(async (req, res, next) => {
    const { date, mensAvailability, womensAvailability } = req.body;

    // Validate required fields
    if (!date || mensAvailability === undefined || womensAvailability === undefined) {
        return next(new AppError('Date, mensAvailability, and womensAvailability are required.', 400));
    }

    // Check if availability for the date already exists
    const existingAvailability = await AccommodationAvail.findOne({ date });
    if (existingAvailability) {
        return next(new AppError('Availability for this date already exists.', 400));
    }

    // Create new availability record
    const newAvailability = await AccommodationAvail.create({ date, mensAvailability, womensAvailability });

    res.status(201).json({
        success: true,
        message: 'Accommodation availability created successfully',
        data: newAvailability
    });

});


export const modifyAvailability = catchAsync(async (req, res, next) => {
    const { date, mensAvailability, womensAvailability } = req.body;

    // Validate required fields
    if (!date || mensAvailability === undefined || womensAvailability === undefined) {
        return next(new AppError('Date, mensAvailability, and womensAvailability are required.', 400));
    }   

    // Find existing availability for the date
    let accommodationAvail = await AccommodationAvail.findOne({ date });

    if (accommodationAvail) {
        // Update existing record
        accommodationAvail.mensAvailability = mensAvailability;
        accommodationAvail.womensAvailability = womensAvailability;
        await accommodationAvail.save();
    } else {
        return next(new AppError('Accommodation availability not found for this date.', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Accommodation availability modified successfully',
        data: accommodationAvail
    });

});