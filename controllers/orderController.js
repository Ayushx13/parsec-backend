import OrderHistory from '../models/orderHistory.js';
import Merch from '../models/merch.js';
import User from '../models/user.js';
import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';


// Create a new order
export const createOrder = catchAsync(async (req, res, next) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const { items, shippingAddress } = req.body;

        // 1️⃣ Validate items array
        if (!items || !Array.isArray(items) || items.length === 0) {
            return next(new AppError('Items array is required and must not be empty.', 400));
        }

        // Fetch user details
        const user = await User.findById(req.user.id).session(session);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        let calculatedTotal = 0;
        const processedItems = [];

        // 2️⃣ Calculate total event passes already purchased by user
        const existingOrders = await OrderHistory.find({ 
            userId: req.user.id,
            orderStatus: { $ne: 'cancelled' } // Exclude cancelled orders
        }).session(session);

        let eventPass1Count = 0;
        let eventPass2Count = 0;

        // Count event passes from existing orders
        for (const order of existingOrders) {
            for (const orderItem of order.items) {
                const existingMerch = await Merch.findById(orderItem.merchId).session(session);
                if (existingMerch) {
                    if (existingMerch.type === 'event-pass1') {
                        eventPass1Count += orderItem.quantity;
                    } else if (existingMerch.type === 'event-pass2') {
                        eventPass2Count += orderItem.quantity;
                    }
                }
            }
        }

        // Count event passes in current order request
        let newEventPass1Count = 0;
        let newEventPass2Count = 0;

        for (const item of items) {
            const merch = await Merch.findById(item.merchId).session(session);
            if (merch) {
                if (merch.type === 'event-pass1') {
                    newEventPass1Count += item.quantity;
                } else if (merch.type === 'event-pass2') {
                    newEventPass2Count += item.quantity;
                }
            }
        }

        // Check limits: max 3 event-pass1 and max 2 event-pass2
        if (eventPass1Count + newEventPass1Count > 3) {
            throw new AppError(
                `You can only purchase up to 3 Event Pass-1. You have already purchased ${eventPass1Count}, and you're trying to purchase ${newEventPass1Count} more.`,
                400
            );
        }

        if (eventPass2Count + newEventPass2Count > 2) {
            throw new AppError(
                `You can only purchase up to 2 Event Pass-2. You have already purchased ${eventPass2Count}, and you're trying to purchase ${newEventPass2Count} more.`,
                400
            );
        }

        // 3️⃣ Loop through each item
        for (const item of items) {

            // 4️⃣ Validate item structure
            if (!item.merchId || !item.quantity) {
                throw new AppError('Each item must have merchId and quantity.', 400);
            }

            // 5️⃣ Fetch merch details for validation
            const merch = await Merch.findById(item.merchId).session(session);

            if (!merch) {
                throw new AppError(`Merchandise with ID ${item.merchId} not found.`, 404);
            }

            // 6️⃣ Validate size for wearable items (before stock check)
            if (merch.type === 'wearable') {
                if (!item.size) {
                    throw new AppError(`Size is required for wearable item: ${merch.name}`, 400);
                }

                if (!merch.sizesAvailable.includes(item.size)) {
                    throw new AppError(`Size ${item.size} is not available for ${merch.name}`, 400);
                }
            }

            // 7️⃣ ATOMIC UPDATE: Check stock availability AND decrement in ONE operation
            // This prevents race conditions where two users try to buy the last item simultaneously
            const updateResult = await Merch.findOneAndUpdate(
                { 
                    _id: item.merchId,
                    stockQuantity: { $gte: item.quantity } // Only update if stock >= requested quantity
                },
                { 
                    $inc: { stockQuantity: -item.quantity } // Atomically decrement stock
                },
                { 
                    new: true,      // Return updated document
                    session         // Use transaction session
                }
            );

            // 8️⃣ If updateResult is null, stock was insufficient (another user bought it)
            if (!updateResult) {
                throw new AppError(
                    `Insufficient stock for ${merch.name}. Available: ${merch.stockQuantity}, Requested: ${item.quantity}`,
                    400
                );
            }

            // 9️⃣ Prepare order item with verified data
            processedItems.push({
                merchId: merch._id,
                name: merch.name,
                size: item.size || 'N/A',
                quantity: item.quantity,
                pricePerItem: merch.price
            });

            calculatedTotal += merch.price * item.quantity;
        }

        // 🔟 Create order inside transaction
        const order = await OrderHistory.create(
            [{
                userId: req.user.id,
                userName: user.name,
                items: processedItems,
                totalAmount: calculatedTotal,
                shippingAddress,
                gender: user.gender
            }],
            { session }
        );

        // 1️⃣1️⃣ Commit transaction
        await session.commitTransaction();
        session.endSession();

        // 1️⃣2️⃣ Send response
        res.status(201).json({
            status: 'success',
            data: {
                order: order[0]
            }
        });

    } catch (error) {
        // ❌ Rollback everything
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
});



// Get order history for user
export const getOrderByMe = catchAsync(async (req, res, next) => {
    const userId = req.user.id; 
    const orders = await OrderHistory.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: {
            orders
        }
    });
});


// Admin: Bulk update all orders with gender from user data
export const bulkUpdateOrdersWithGender = catchAsync(async (req, res, next) => {
    // Fetch all orders that don't have gender yet
    const orders = await OrderHistory.find({ gender: null });

    let updatedCount = 0;

    for (const order of orders) {
        // Fetch user to get gender
        const user = await User.findById(order.userId);

        if (user && user.gender) {
            // Update the order with user's gender
            order.gender = user.gender;
            await order.save();
            updatedCount++;
        }
    }

    res.status(200).json({
        status: 'success',
        message: `Successfully updated ${updatedCount} orders with gender information`,
        data: {
            updatedCount,
            totalOrdersChecked: orders.length
        }
    });
});