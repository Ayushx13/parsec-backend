import User from "../models/user.js";
import PaymentHistory from "../models/paymentHistory.js";
import OrderHistory from "../models/orderHistory.js";
import AccommodationBooking from "../models/accommodationBooking.js";
import QR from "../models/qr.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import catchAsyncWithCleanup from "../utils/catchAsyncWithCleanup.js";
import { sendOrderUnderReviewEmail, sendPaymentVerifiedEmail, sendEventPassVerifiedEmail, sendAccommodationPaymentUnderReviewEmail, sendAccommodationConfirmedEmail, sendOrderRejectedEmail, sendAccommodationRejectedEmail } from "../utils/sendEmail.js";
import { generateEventPassQR } from "./qrController.js";
import { validateObjectIds } from "../utils/validators.js";



// Record a new payment (handles both merch orders and accommodation bookings)
export const recordPayment = catchAsyncWithCleanup(async (req, res, next) => {
    const { amount, paymentUTR, orderId, bookingId } = req.body;

    // Validate required fields
    if (!amount || !paymentUTR) {
        throw new AppError('Amount and Payment UTR are required.', 400);
    }

    // Must provide either orderId or bookingId
    if (!orderId && !bookingId) {
        throw new AppError('Either Order ID or Booking ID is required.', 400);
    }

    if (orderId && bookingId) {
        throw new AppError('Provide either Order ID or Booking ID, not both.', 400);
    }

    // Validate MongoDB ObjectId format
    validateObjectIds({ 
        'Order ID': orderId, 
        'Booking ID': bookingId 
    });

    // Get payment screenshot URL from uploaded file (if provided)
    let paymentScreenshot = null;
    if (req.file) {
        // Cloudinary URL is stored in req.file.path when using multer-storage-cloudinary
        paymentScreenshot = req.file.path;
    }

    // Get user details from the request 
    const user = await User.findById(req.user.id);
    if (!user) {
        throw new AppError('User not found.', 404);
    }

    let referenceType, referenceId, metadata = {};

    // Handle merch order payment
    if (orderId) {
        const order = await OrderHistory.findOne({ _id: orderId, userId: user._id })
            .populate('items.merchId');
        if (!order) {
            throw new AppError('Order not found or does not belong to you.', 404);
        }

        // Determine the merch type from the order (use first item's type)
        const merchType = order.items[0]?.merchId?.type;
        if (!merchType) {
            throw new AppError('Unable to determine merch type from order.', 400);
        }

        referenceType = merchType;
        referenceId = orderId;
    }
    // Handle accommodation booking payment
    else if (bookingId) {
        const booking = await AccommodationBooking.findOne({ _id: bookingId, userId: user._id });
        if (!booking) {
            throw new AppError('Booking not found or does not belong to you.', 404);
        }

        referenceType = 'AccommodationBooking';
        referenceId = bookingId;
        metadata = {
            checkInDate: booking.checkInDate,
            checkOutDate: booking.checkOutDate,
            numberOfNights: booking.numberOfNights
        };
    }

    // Check if payment already exists for this reference
    const existingPayment = await PaymentHistory.findOne({ referenceId });
    if (existingPayment) {
        throw new AppError('Payment already recorded for this order/booking.', 400);
    }

    // Create payment history record
    const paymentHistory = await PaymentHistory.create({
        userId: user._id,
        referenceType,
        referenceId,
        name: user.name,
        email: user.email,
        contactNumber: user.contactNumber,
        amount,
        paymentUTR,
        paymentScreenshot,
        metadata
    });

    // Send "Under Review" email
    const idShort = referenceId.toString().slice(-6);
    if (referenceType === 'AccommodationBooking') {
        await sendAccommodationPaymentUnderReviewEmail(user.email, idShort, paymentUTR, amount, metadata);
    } else {
        await sendOrderUnderReviewEmail(user.email, idShort, paymentUTR, amount);
    }

    res.status(201).json({
        status: 'success',
        data: {
            payment: {
                _id: paymentHistory._id,
                userId: paymentHistory.userId,
                referenceType: paymentHistory.referenceType,
                referenceId: paymentHistory.referenceId,
                amount: paymentHistory.amount,
                paymentUTR: paymentHistory.paymentUTR,
                paymentScreenshot: paymentHistory.paymentScreenshot,
                status: paymentHistory.status,
                createdAt: paymentHistory.createdAt
            }
        }
    });
});



//payment history retrieval for user 
export const getPaymentHistory = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return next(new AppError('User not found.', 404));
    }

    const paymentHistory = await PaymentHistory.find({ userId: user._id });
    res.status(200).json({
        status: 'success',
        data: {
            paymentHistory
        }
    });
});



//-------------------------------------------- admin related controllers -------------------------------------------------//

//payment history retrieval for admin
export const getAllPaymentHistories = catchAsync(async (req, res, next) => {
    const paymentHistories = await PaymentHistory.find().populate('userId', 'name email contactNumber');

    res.status(200).json({
        status: 'success',
        data: { paymentHistories }
    });
});


//verify payment by admin
export const verifyPayment = catchAsync(async (req, res, next) => {
    const paymentId = req.params.id;

    const payment = await PaymentHistory.findById(paymentId);
    if (!payment) {
        return next(new AppError('Payment not found.', 404));
    }

    payment.status = 'verified';
    payment.verifiedAt = new Date();
    await payment.save();

    // Handle verification based on referenceType
    if (payment.referenceType === 'AccommodationBooking') {
        // Handle accommodation booking payment
        const booking = await AccommodationBooking.findById(payment.referenceId);
        if (booking) {
            booking.paymentStatus = 'paid';
            booking.status = 'confirmed';
            await booking.save();
        }

        // Send confirmation email
        const bookingIdShort = payment.referenceId.toString().slice(-6);
        await sendAccommodationConfirmedEmail(
            payment.email,
            bookingIdShort,
            payment.paymentUTR,
            payment.amount,
            payment.metadata
        );
    } else {
        // Handle merch order payment (wearable, non-wearable, event-pass1, event-pass2)
        const order = await OrderHistory.findById(payment.referenceId)
            .populate('items.merchId');
        
        if (!order) {
            return next(new AppError('Associated order not found.', 404));
        }

        let qrCodeData = null;

        // Create QR record if event-pass is purchased
        if (payment.referenceType === 'event-pass1' || payment.referenceType === 'event-pass2') {
            const user = await User.findById(payment.userId);
            const eventPassItem = order.items.find(item => 
                item.merchId.type === payment.referenceType
            );
            
            qrCodeData = {
                orderId: order._id.toString(),
                attendeeName: user.name,
                attendeeEmail: user.email,
                passType: payment.referenceType,
                passPrice: eventPassItem?.merchId.price || 0,
                collegeName: user.collegeName || 'N/A',
                gender: user.gender || 'N/A',
                isUsed: false
            };

            // Generate QR code
            const { qrString, qrCodeBuffer } = await generateEventPassQR(qrCodeData);

            // Create QR record in database
            await QR.create({
                userId: payment.userId,
                orderId: order._id,
                passType: payment.referenceType,
                qrCodeData: qrString
            });

            qrCodeData.qrCodeBuffer = qrCodeBuffer;
        }

        // Send "Payment Verified" email
        const orderIdShort = order._id.toString().slice(-6);
        
        if (qrCodeData) {
            await sendEventPassVerifiedEmail(
                payment.email,
                orderIdShort,
                payment.paymentUTR,
                qrCodeData,
                qrCodeData.qrCodeBuffer
            );
        } else {
            await sendPaymentVerifiedEmail(
                payment.email,
                orderIdShort,
                payment.paymentUTR,
                payment.amount
            );
        }
    }

    res.status(200).json({
        status: 'success',
        data: {
            payment
        }
    });
});

//reject payment by admin
export const rejectPayment = catchAsync(async (req, res, next) => {
    const paymentId = req.params.id;            

    const payment = await PaymentHistory.findById(paymentId);
    if (!payment) {
        return next(new AppError('Payment not found.', 404));
    }

    payment.status = 'rejected';
    await payment.save();

    // Send rejection email based on referenceType
    const idShort = payment.referenceId.toString().slice(-6);
    
    if (payment.referenceType === 'AccommodationBooking') {
        await sendAccommodationRejectedEmail(
            payment.email,
            idShort,
            payment.paymentUTR,
            payment.amount,
            payment.metadata
        );
    } else {
        // For merch orders (wearable, non-wearable, event-pass1, event-pass2)
        await sendOrderRejectedEmail(
            payment.email,
            idShort,
            payment.paymentUTR,
            payment.amount
        );
    }

    res.status(200).json({
        status: 'success',
        data: {
            payment
        }
    });
});


//get admin statistics
export const getAdminStats = catchAsync(async (req, res, next) => {
    const totalPayments = await PaymentHistory.countDocuments();
    const verifiedPayments = await PaymentHistory.countDocuments({ status: 'verified' });
    const rejectedPayments = await PaymentHistory.countDocuments({ status: 'rejected' });
    const pendingPayments = await PaymentHistory.countDocuments({ status: 'pending' });

    res.status(200).json({
        status: 'success',
        data: {
            totalPayments,
            verifiedPayments,
            rejectedPayments,
            pendingPayments
        }
    });
});
