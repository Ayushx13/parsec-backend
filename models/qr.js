import mongoose from "mongoose";

const { Schema, model } = mongoose;

const qrSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'OrderHistory',
        required: true
    },
    passType: {
        type: String,
        required: true,
        enum: ['event-pass1', 'event-pass2']
    },
    qrCodeData: {
        type: String,
        required: true
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    usedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster lookups during verification
qrSchema.index({ userId: 1, orderId: 1 });
qrSchema.index({ qrCodeData: 1 });

const QR = model('QR', qrSchema);

export default QR;
