import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const orderHistorySchema = new Schema(
    {
        userId: { 
            type: Schema.Types.ObjectId, 
            ref: 'User',
            required: true
        },
        items: [
            {
                merchId: { 
                    type: Schema.Types.ObjectId, 
                    ref: 'Merch',
                    required: true
                },
                name: { 
                    type: String, 
                    required: true
                },
                size: {
                    type: String,
                    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'N/A']
                },
                quantity: { 
                    type: Number, 
                    required: true,
                    min: 1
                },
                pricePerItem: { 
                    type: Number, 
                    required: true,
                    min: 0
                }
            }
        ],
        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },
        orderStatus: {
            type: String,
            enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
            default: 'pending'
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending'
        },
        shippingAddress: {
            hostel: String,
            roomNumber: String,
            additionalInfo: String
        },
        deliveredAt: Date
    },
    { timestamps: true }
);

const OrderHistory = model('OrderHistory', orderHistorySchema);

export default OrderHistory;