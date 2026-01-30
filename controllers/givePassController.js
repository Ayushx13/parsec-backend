import User from '../models/user.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import OrderHistory from '../models/orderHistory.js';
import QR from '../models/qr.js';
import AccommodationBooking from '../models/accommodationBooking.js';
import { generateEventPassQR } from "./qrController.js";
import { sendFreePassVerifiedEmail, sendAccommodationComplementaryPassEmail } from "../utils/sendEmail.js";

export const givePass = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    //Email validator
    if (!email) {
        return next(new AppError('Email is required', 400));
    }

    //find user from email
    const user = await User.findOne({ email });

    //User validator 
    if (!user) {
        return next(new AppError('User not found !', 404));
    }

    //creating the pass order for college students 
    const passType = "event-pass2";
    const order = await OrderHistory.create({
        userId: user._id,
        userName: user.name,
        items: [
            {
                merchId: "6960e073d4b548636f622990",
                name: "Opening Ceremony Pass",
                size: "N/A",
                quantity: 1,
                pricePerItem: 500
            }
        ],
        totalAmount: 500,
        shippingAddress: null,
        paymentMade: "paid",
        orderStatus: "confirmed",
        paymentVerificationStatus: "Verified",
        expiresAt: null,
        gender: user.gender
    });

    const qrCodeData = {
        orderId: order._id.toString(),
        totalPasses: 1,
        attendeeName: user.name,
        attendeeEmail: user.email,
        passType: passType,
        passPrice: 500,
        collegeName: user.college || 'N/A',
        gender: user.gender || 'N/A',
    };

    // Generate QR code
    const { qrString, qrCodeBuffer } = await generateEventPassQR(qrCodeData);

    // Create QR record in database
    await QR.create({
        userId: user._id,
        orderId: order._id,
        passType: passType,
        passNumber: 1,
        qrCodeData: qrString
    });

    const orderIdShort = order._id.toString().slice(-6) + " -FreePass";
    const paymentUTR = "OpeningCeremony-FreePass";

    const emailQrCodeData = {
        orderId: order._id.toString(),
        attendeeName: user.name,
        attendeeEmail: user.email,
        collegeName: user.college || 'N/A',
        gender: user.gender || 'N/A',
        qrCodesList: [
            {
                passType: passType,
                passNumber: 1,
                totalPasses: 1,
                passPrice: 500,
                qrCodeBuffer: qrCodeBuffer
            }
        ]
    };

    await sendFreePassVerifiedEmail(
        user.email,
        orderIdShort,
        paymentUTR,
        emailQrCodeData
    );

    res.status(201).json({
        status: 'success',
        message: 'Free pass issued successfully',
        data: {
            orderId: order._id,
            orderIdShort: orderIdShort,
            userName: user.name,
            email: user.email,
            passType: passType
        }
    });

});

export const giveAccommodationCulturalEventPass = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    //Email validator
    if (!email) {
        return next(new AppError('Email is required', 400));
    }

    //find user from email
    const user = await User.findOne({ email });

    //User validator 
    if (!user) {
        return next(new AppError('User not found !', 404));
    }

    //Check if user has accommodation booking
    const accommodationBooking = await AccommodationBooking.findOne({ 
        userId: user._id,
        status: 'confirmed'
    });

    if (!accommodationBooking) {
        return next(new AppError('User does not have a confirmed accommodation booking', 400));
    }

    //creating the accommodation cultural event pass for accommodation users
    const passType = "event-pass2";
    const order = await OrderHistory.create({
        userId: user._id,
        userName: user.name,
        items: [
            {
                merchId: "6960e073d4b548636f622990",
                name: "Accommodation-Cultural Event Pass",
                size: "N/A",
                quantity: 1,
                pricePerItem: 0
            }
        ],
        totalAmount: 0,
        shippingAddress: null,
        paymentMade: "paid",
        orderStatus: "confirmed",
        paymentVerificationStatus: "Verified",
        expiresAt: null,
        gender: user.gender
    });

    const qrCodeData = {
        orderId: order._id.toString(),
        totalPasses: 1,
        attendeeName: user.name,
        attendeeEmail: user.email,
        passType: passType,
        passPrice: 'INCLUDED WITH ACCOMMODATION BOOKING',
        collegeName: user.college || 'N/A',
        gender: user.gender || 'N/A',
    };

    // Generate QR code
    const { qrString, qrCodeBuffer } = await generateEventPassQR(qrCodeData);

    // Create QR record in database
    await QR.create({
        userId: user._id,
        orderId: order._id,
        passType: passType,
        passNumber: 1,
        qrCodeData: qrString
    });

    const orderIdShort = order._id.toString().slice(-6) + " -AccommodationPass";
    const paymentUTR = "AccommodationCultural-FreePass";

    const emailQrCodeData = {
        orderId: order._id.toString(),
        attendeeName: user.name,
        attendeeEmail: user.email,
        collegeName: user.college || 'N/A',
        gender: user.gender || 'N/A',
        qrCodesList: [
            {
                passType: passType,
                passNumber: 1,
                totalPasses: 1,
                passPrice: 'INCLUDED WITH ACCOMMODATION BOOKING',
                qrCodeBuffer: qrCodeBuffer
            }
        ]
    };

    await sendAccommodationComplementaryPassEmail(
        user.email,
        orderIdShort,
        paymentUTR,
        emailQrCodeData
    );

    res.status(201).json({
        status: 'success',
        message: 'Accommodation cultural event pass issued successfully',
        data: {
            orderId: order._id,
            orderIdShort: orderIdShort,
            userName: user.name,
            email: user.email,
            passType: passType
        }
    });
});

export const getAccommodationBookingEmails = catchAsync(async (req, res, next) => {
    const { startDate, endDate } = req.query;

    // Validate dates are provided
    if (!startDate || !endDate) {
        return next(new AppError('startDate and endDate query parameters are required', 400));
    }

    let start, end;

    // Check if dates are just day numbers (e.g., "25") or full dates (e.g., "2026-01-25")
    if (/^\d{1,2}$/.test(startDate) && /^\d{1,2}$/.test(endDate)) {
        // Parse as day numbers using current month and year
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        start = new Date(year, month, parseInt(startDate), 0, 0, 0, 0);
        end = new Date(year, month, parseInt(endDate), 23, 59, 59, 999);
    } else {
        // Parse as full YYYY-MM-DD format
        start = new Date(startDate);
        end = new Date(endDate);

        // Ensure end date includes the entire day
        end.setHours(23, 59, 59, 999);
    }

    // Validate dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return next(new AppError('Invalid date format. Use day number (25) or YYYY-MM-DD format', 400));
    }

    // Find accommodation bookings where check-in is on or before endDate and check-out is on or after startDate
    const bookings = await AccommodationBooking.find({
        checkInDate: { $lte: end },
        checkOutDate: { $gte: start },
        status: 'confirmed'
    }).populate('userId', 'email name');

    if (bookings.length === 0) {
        return res.status(200).json({
            status: 'success',
            message: 'No accommodation bookings found for the specified date range',
            count: 0,
            data: []
        });
    }

    // Extract emails from bookings
    const emailList = bookings.map(booking => ({
        email: booking.userId.email,
        userName: booking.userId.name,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate
    }));

    res.status(200).json({
        status: 'success',
        message: `Found ${emailList.length} users with accommodation bookings in the specified date range`,
        count: emailList.length,
        data: emailList
    });
});