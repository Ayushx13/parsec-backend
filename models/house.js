import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const houseSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            enum: ['Gryffindor', 'Hufflepuff', 'Ravenclaw', 'Slytherin']
        },
        count: {
            type: Number,
            default: 0,
            min: 0
        },
        points: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

const House = model('House', houseSchema);

export default House;
