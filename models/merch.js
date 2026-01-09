import mongoose from "mongoose";

const { Schema, model } = mongoose;  

const merchSchema = new Schema({
    type:{
        type: String,
        required: true,
        enum: ['wearable', 'non-wearable', 'event-pass1', 'event-pass2']
    },
    name:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true,
        min: 0
    },
    stockQuantity:{
        type: Number,
        required: true, 
        min: 0
    },
    sizesAvailable:{ // Only for wearable merch
        type: [String],
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
    }
});

const Merch = model('Merch' , merchSchema);

export default Merch;