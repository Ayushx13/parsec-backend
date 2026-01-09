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

        // 2️⃣ Loop through each item
        for (const item of items) {

            // 3️⃣ Validate item structure
            if (!item.merchId || !item.quantity) {
                throw new AppError('Each item must have merchId and quantity.', 400);
            }

            // 4️⃣ Fetch merch details for validation
            const merch = await Merch.findById(item.merchId).session(session);

            if (!merch) {
                throw new AppError(`Merchandise with ID ${item.merchId} not found.`, 404);
            }

            // 5️⃣ Validate size for wearable items (before stock check)
            if (merch.type === 'wearable') {
                if (!item.size) {
                    throw new AppError(`Size is required for wearable item: ${merch.name}`, 400);
                }

                if (!merch.sizesAvailable.includes(item.size)) {
                    throw new AppError(`Size ${item.size} is not available for ${merch.name}`, 400);
                }
            }

            // 6️⃣ ATOMIC UPDATE: Check stock availability AND decrement in ONE operation
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

            // 7️⃣ If updateResult is null, stock was insufficient (another user bought it)
            if (!updateResult) {
                throw new AppError(
                    `Insufficient stock for ${merch.name}. Available: ${merch.stockQuantity}, Requested: ${item.quantity}`,
                    400
                );
            }

            // 8️⃣ Prepare order item with verified data
            processedItems.push({
                merchId: merch._id,
                name: merch.name,
                size: item.size || 'N/A',
                quantity: item.quantity,
                pricePerItem: merch.price
            });

            calculatedTotal += merch.price * item.quantity;
        }

        // 9️⃣ Create order inside transaction
        const order = await OrderHistory.create(
            [{
                userId: req.user.id,
                userName: user.name,
                items: processedItems,
                totalAmount: calculatedTotal,
                shippingAddress
            }],
            { session }
        );

        // 🔟 Commit transaction
        await session.commitTransaction();
        session.endSession();

        // 1️⃣1️⃣ Send response
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