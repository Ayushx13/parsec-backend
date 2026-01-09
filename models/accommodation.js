import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const accommodationAvailSchema = new Schema(
    {
        date: {
            type: Date,
            required: [true, 'Date is required'],
            unique: true
        },
        mensAvailability: {
            type: Number,
            required: [true, 'Men\'s availability is required'],
            min: [0, 'Availability cannot be negative'],
            default: 0
        },
        womensAvailability: {
            type: Number,
            required: [true, 'Women\'s availability is required'],
            min: [0, 'Availability cannot be negative'],
            default: 0
        }
    },
    { timestamps: true }
);

const AccommodationAvail = model('AccommodationAvail', accommodationAvailSchema);
export default AccommodationAvail;
