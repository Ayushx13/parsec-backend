import mongoose from 'mongoose';

const { Schema, model } = mongoose;
const paymentHistorySchema = new Schema(
    {
        userId: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },

        // Payment type - merch types or accommodation
        referenceType: {
            type: String,
            enum: ['wearable', 'non-wearable', 'event-pass1', 'event-pass2', 'AccommodationBooking'],
            required: true
        },

        // Reference ID - points to OrderHistory (for merch) or AccommodationBooking
        referenceId: {
            type: Schema.Types.ObjectId,
            required: true
            // Manually populate based on referenceType in controllers
            // merch types -> OrderHistory, AccommodationBooking -> AccommodationBooking model
        },

        //User details (for pre-filling and record-keeping)
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true
        },
        contactNumber:{
            type:String,
            required:true
        },
        amount: { 
            type: Number, 
            required: true
        },
        paymentUTR: {
            type: String, 
            required: true,
            unique: true
        },

        // Payment screenshot URL from Cloudinary
        paymentScreenshot: {
            type: String,
            required: false
        },

        // Payment status for admin verification
        status: {
            type: String,
            enum: ['pending', 'verified', 'rejected'],
            default: 'pending'
        },
        verifiedAt: {
            type: Date
        },

        // Metadata for type-specific information
        metadata: {
            type: Schema.Types.Mixed,
            default: {}
        }
    },
    
    { timestamps: true }
);

const PaymentHistory = model('PaymentHistory', paymentHistorySchema);
export default PaymentHistory;
