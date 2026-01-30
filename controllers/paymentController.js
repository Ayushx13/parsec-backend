import User from "../models/user.js";
import PaymentHistory from "../models/paymentHistory.js";
import OrderHistory from "../models/orderHistory.js";
import AccommodationBooking from "../models/accommodationBooking.js";
import AccommodationAvail from "../models/accommodation.js";
import Merch from "../models/merch.js";
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

    // Get payment screenshot URL from uploaded file (required)
    if (!req.file) {
        throw new AppError('Payment screenshot is required. Please upload a valid image.', 400);
    }
    
    // Cloudinary URL is stored in req.file.path when using multer-storage-cloudinary
    const paymentScreenshot = req.file.path;

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

        // Mark payment as made (middleware will automatically clear expiry)
        order.paymentMade = 'paid';
        await order.save();

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

        // Mark payment as made (middleware will automatically clear expiry)
        booking.paymentMade = 'paid';
        await booking.save();

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
            booking.paymentVerificationStatus = 'Verified';
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

        // Update order verification status (payment already marked as 'paid' when submitted)
        order.paymentVerificationStatus = 'Verified';
        order.orderStatus = 'confirmed';
        await order.save();

        let qrCodesData = null;

        // Check if ANY item in the order is an event pass (regardless of referenceType)
        const eventPassItems = order.items.filter(item => 
            item.merchId.type === 'event-pass1' || item.merchId.type === 'event-pass2'
        );

        console.log('DEBUG - Order items:', JSON.stringify(order.items, null, 2));
        console.log('DEBUG - Event pass items found:', eventPassItems.length);
        
        // Create QR records for all event passes in the order (handle both pass types)
        if (eventPassItems.length > 0) {
            const user = await User.findById(payment.userId);
            const allQRCodes = [];

            // Process each event pass item
            for (const eventPassItem of eventPassItems) {
                const passType = eventPassItem.merchId.type;
                const quantity = eventPassItem.quantity;

                console.log(`DEBUG - Processing ${passType} with quantity ${quantity}`);

                for (let i = 0; i < quantity; i++) {
                    const qrCodeData = {
                        orderId: order._id.toString(),
                        passNumber: i + 1,
                        totalPasses: quantity,
                        attendeeName: user.name,
                        attendeeEmail: user.email,
                        passType: passType,
                        passPrice: eventPassItem.merchId.price || 0,
                        collegeName: user.college || 'N/A',
                        gender: user.gender || 'N/A',
                    };

                    // Generate QR code
                    const { qrString, qrCodeBuffer } = await generateEventPassQR(qrCodeData);

                    console.log(`DEBUG - Creating QR ${i + 1} of ${quantity} for ${passType}`);

                    // Create QR record in database
                    await QR.create({
                        userId: payment.userId,
                        orderId: order._id,
                        passType: passType,
                        passNumber: i + 1,
                        qrCodeData: qrString
                    });

                    allQRCodes.push({
                        passType: passType,
                        passNumber: i + 1,
                        totalPasses: quantity,
                        passPrice: eventPassItem.merchId.price || 0,
                        qrCodeBuffer
                    });
                }
            }

            console.log(`DEBUG - Total QR codes generated: ${allQRCodes.length}`);

            qrCodesData = {
                orderId: order._id.toString(),
                attendeeName: user.name,
                attendeeEmail: user.email,
                collegeName: user.college || 'N/A',
                gender: user.gender || 'N/A',
                qrCodesList: allQRCodes
            };
        }

        // Send "Payment Verified" email
        const orderIdShort = order._id.toString().slice(-6);
        
        if (qrCodesData) {
            await sendEventPassVerifiedEmail(
                payment.email,
                orderIdShort,
                payment.paymentUTR,
                qrCodesData
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

    // Update order/booking paymentVerificationStatus to rejected and restore inventory/availability
    if (payment.referenceType === 'AccommodationBooking') {
        const booking = await AccommodationBooking.findById(payment.referenceId);
        if (booking) {
            // Restore accommodation availability for all dates in the booking range
            const availabilityField = booking.gender === 'male' ? 'mensAvailability' : 'womensAvailability';
            
            // Generate date array
            const dateArray = [];
            let currentDate = new Date(booking.checkInDate);
            const checkOutDate = new Date(booking.checkOutDate);
            
            while (currentDate < checkOutDate) {
                dateArray.push(new Date(currentDate));
                currentDate.setDate(currentDate.getDate() + 1);
            }
            
            // Restore availability for each date
            for (const date of dateArray) {
                await AccommodationAvail.findOneAndUpdate(
                    { date },
                    { $inc: { [availabilityField]: 1 } },
                    { new: true }
                );
            }
            
            booking.paymentVerificationStatus = 'rejected';
            booking.status = 'Rejected';
            await booking.save();
        }
    } else {
        const order = await OrderHistory.findById(payment.referenceId)
            .populate('items.merchId');
        if (order) {
            // Restore inventory for each item in the order
            for (const item of order.items) {
                await Merch.findByIdAndUpdate(
                    item.merchId,
                    { $inc: { stockQuantity: item.quantity } },
                    { new: true }
                );
            }
            
            order.paymentVerificationStatus = 'rejected';
            order.orderStatus = 'Rejected';
            await order.save();
        }
    }

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
