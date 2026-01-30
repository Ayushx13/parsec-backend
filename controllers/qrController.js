import QRCode from 'qrcode';
import QR from '../models/qr.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

// Generate QR code for event pass
export const generateEventPassQR = async (qrData) => {
    // Create QR data string
    const qrString = JSON.stringify({ 
        orderId: qrData.orderId,
        attendeeName: qrData.attendeeName,
        attendeeEmail: qrData.attendeeEmail,
        passType: qrData.passType,
        passPrice: qrData.passPrice,
        collegeName: qrData.collegeName,
        gender: qrData.gender,
        // isUsed: qrData.isUsed   // Exclude isUsed from QR data for security
    });
    
    // Generate QR code as buffer
    const qrCodeBuffer = await QRCode.toBuffer(qrString);
    
    return {
        qrString,
        qrCodeBuffer
    };
};



// Verify QR code at event venue
export const verifyEventPassQR = catchAsync(async (req, res, next) => {
    const { qrData } = req.body;

    if (!qrData) {
        return next(new AppError('QR data is required', 400));
    }

    // Parse QR data
    let parsedData;
    try {
        parsedData = JSON.parse(qrData);
    } catch (error) {
        return next(new AppError('Invalid QR code format', 400));
    }

    // Find QR record in database
    const qrRecord = await QR.findOne({
        orderId: parsedData.orderId,
        passType: parsedData.passType
    }).populate('userId', 'name email');

    if (!qrRecord) {
        return next(new AppError('Invalid QR code', 404));
    }

    // Check if already used
    if (qrRecord.isUsed) {
        return res.status(400).json({
            status: 'fail',
            message: 'QR code has already been used',
            usedAt: qrRecord.usedAt
        });
    }

    // Mark as used
    qrRecord.isUsed = true;
    qrRecord.usedAt = new Date();
    await qrRecord.save();

    res.status(200).json({
        status: 'success',
        message: 'QR code verified successfully',
        data: {
            attendeeName: parsedData.attendeeName,
            attendeeEmail: parsedData.attendeeEmail,
            passType: parsedData.passType,
            collegeName: parsedData.collegeName,
            verifiedAt: qrRecord.usedAt
        }
    });
});


// Get QR record and check if used (for frontend QR scan check)
export const getQR = catchAsync(async (req, res, next) => {
    const { qrData } = req.body;

    if (!qrData) {
        return next(new AppError('QR data is required', 400));
    }

    let parsedData;
    try {
        parsedData = JSON.parse(qrData);
    } catch (error) {
        return next(new AppError('Invalid QR data format', 400));
    }

    const qrRecord = await QR.findOne({
        orderId: parsedData.orderId,
        passType: parsedData.passType
    }).populate('userId', 'name email');

    if (!qrRecord) {
        return next(new AppError('QR record not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            attendeeName: parsedData.attendeeName,
            attendeeEmail: parsedData.attendeeEmail,
            passType: parsedData.passType,
            collegeName: parsedData.collegeName,
            isUsed: qrRecord.isUsed,
            usedAt: qrRecord.usedAt,
            user: qrRecord.userId
        }
    });
});



