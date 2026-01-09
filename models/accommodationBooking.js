import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const accommodationBookingSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required']
        },
        checkInDate: {
            type: Date,
            required: [true, 'Check-in date is required']
        },
        checkOutDate: {
            type: Date,
            required: [true, 'Check-out date is required'],
            validate: {
                validator: function(value) {
                    return value > this.checkInDate;
                },
                message: 'Check-out date must be after check-in date'
            }
        },
        gender: {
            type: String,
            required: [true, 'Gender is required'],
            enum: {
                values: ['male', 'female', 'others'],
                message: '{VALUE} is not a valid gender'
            }
        },
        numberOfNights: {
            type: Number,
            required: true
        },
        totalPrice: {
            type: Number,
            required: [true, 'Total price is required'],
            min: [0, 'Price cannot be negative']
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled'],
            default: 'pending'
        },
        paymentStatus: {
            type: String,
            enum: ['unpaid', 'paid', 'refunded'],
            default: 'unpaid'
        },
        specialRequests: {
            type: String,
            maxlength: [500, 'Special requests cannot exceed 500 characters']
        }
    },
    { timestamps: true }
);

// Compound index for user and dates
accommodationBookingSchema.index({ userId: 1, checkInDate: 1 });
accommodationBookingSchema.index({ status: 1 });

// Calculate number of nights before saving
accommodationBookingSchema.pre('save', function(next) {
    if (this.checkInDate && this.checkOutDate) {
        const diffTime = Math.abs(this.checkOutDate - this.checkInDate);
        this.numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    next();
});

const AccommodationBooking = model('AccommodationBooking', accommodationBookingSchema);
export default AccommodationBooking;