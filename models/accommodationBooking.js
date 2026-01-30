import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const accommodationBookingSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required']
        },
        userName: {
            type: String,
            required: true
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
        expiresAt: {
            type: Date,
            default: function() {
                // Set expiry to 5 minutes from now for unpaid bookings
                return new Date(Date.now() + 5 * 60 * 1000);
            }
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
    
    // If payment is made (submitted) or verified, remove expiry (prevent auto-deletion)
    if (this.paymentMade === 'paid' || this.paymentVerificationStatus === 'Verified' || this.paymentVerificationStatus === 'rejected') {
        this.expiresAt = null;
    }
    // Only 'unpaid' (no payment submitted) bookings will have expiresAt and auto-delete
    
    next();
});



// Middleware to restore availability when booking is deleted (by cron job or manually)
accommodationBookingSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
    try {
        const AccommodationAvail = mongoose.model('AccommodationAvail');
        
        // Restore availability only if payment was never made (unpaid bookings)
        if (this.paymentMade !== 'paid') {
            const availabilityField = this.gender === 'male' ? 'mensAvailability' : 'womensAvailability';
            
            // Generate date array
            const dateArray = [];
            let currentDate = new Date(this.checkInDate);
            const checkOutDate = new Date(this.checkOutDate);
            
            while (currentDate < checkOutDate) {
                dateArray.push(new Date(currentDate));
                currentDate.setDate(currentDate.getDate() + 1);
            }
            
            // Restore availability for each date
            for (const date of dateArray) {
                await AccommodationAvail.findOneAndUpdate(
                    { date },
                    { $inc: { [availabilityField]: 1 } }
                );
            }
            
            console.log(`✅ Restored accommodation availability for deleted booking ${this._id}`);
        }
        next();
    } catch (error) {
        console.error(`❌ Error restoring availability for booking ${this._id}:`, error.message);
        next(error);
    }
});



const AccommodationBooking = model('AccommodationBooking', accommodationBookingSchema);
export default AccommodationBooking;