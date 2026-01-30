import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const orderHistorySchema = new Schema(
    {
        userId: { 
            type: Schema.Types.ObjectId, 
            ref: 'User',
            required: true
        },
        userName: {
            type: String,
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
            enum: ['pending', 'confirmed', 'Rejected'],
            default: 'pending'
        },
        paymentMade:{
            type: String,
            enum:['unpaid' , 'paid'],
            default: 'unpaid'
        },
        paymentVerificationStatus: {
            type: String,
            enum: ['unverified', 'Verified', 'rejected'],
            default: 'unverified'
        },
        shippingAddress: {
            hostel: String,
            roomNumber: String,
            additionalInfo: String
        },
        gender: {
            type: String,
            enum: ['male', 'female'],
            default: null
        },
        deliveredAt: Date,
        expiresAt: {
            type: Date,
            default: function() {
                // Set expiry to 5 minutes from now for unpaid orders
                return new Date(Date.now() + 5 * 60 * 1000);
            }
        }
    },
    { timestamps: true }
);



// Middleware to clear expiry when payment is submitted or verified
orderHistorySchema.pre('save', function(next) {
    // If payment is made (submitted) or verified, remove expiry (prevent auto-deletion)
    if (this.paymentMade === 'paid' || this.paymentVerificationStatus === 'Verified' || this.paymentVerificationStatus === 'rejected') {
        this.expiresAt = null;
    }
    // Only 'unpaid' (no payment submitted) orders will have expiresAt and auto-delete
    next();
});



// Middleware to restore inventory when order is deleted (by cron job or manually)
orderHistorySchema.pre('deleteOne', { document: true, query: false }, async function(next) {
    try {
        const Merch = mongoose.model('Merch');
        
        // Restore inventory only if payment was never made (unpaid orders)
        if (this.paymentMade !== 'paid') {
            for (const item of this.items) {
                await Merch.findByIdAndUpdate(
                    item.merchId,
                    { $inc: { stockQuantity: item.quantity } }
                );
            }
            console.log(`✅ Restored inventory for deleted order ${this._id}`);
        }
        next();
    } catch (error) {
        console.error(`❌ Error restoring inventory for order ${this._id}:`, error.message);
        next(error);
    }
});



const OrderHistory = model('OrderHistory', orderHistorySchema);
export default OrderHistory;