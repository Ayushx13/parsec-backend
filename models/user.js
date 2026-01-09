import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
    {
        // Google / OAuth identifier (only present for OAuth users)
        googleId: { type: String, index: true, unique: true, sparse: true },

        // Which provider created/owns this account
        provider: {
            type: String,
            default: "google",
        },

        // Primary contact — use sparse unique so local or other-provider-only docs still allowed
        email: { type: String, lowercase: true, trim: true },

        // Display/full name
        name: { type: String },
        givenName: { type: String },
        familyName: { type: String },

        // Avatar/photo URL from provider
        avatar: { type: String },

        // Has the provider verified the user's email?
        emailVerified: { type: Boolean, default: false },

        // House assignment (Sorting Hat)
        house: {
            type: String,
            enum: ['Gryffindor', 'Hufflepuff', 'Ravenclaw', 'Slytherin'],
            default: null
        },

        // Points earned by the user
        points: {
            type: Number,
            default: 0,
            min: 0
        },

        // Last login and other small metadata
        lastLogin: Date,

        // Onboarding questions (filled after initial Google auth)
        college: { type: String },
        batch: { type: Number },
        gender: {
            type: String,
            enum: ['male', 'female', 'other']
        },
        contactNumber: { type: String },
        aadharOrCollegeId: { type: String },
        
        // Merch size
        merchSize: {
            type: String,
            enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
            uppercase: true
        }
    },


    {
        timestamps: true,
    }
);

// Useful indexes
userSchema.index({ email: 1 }, { unique: true, sparse: true });

// Hide sensitive/internal fields when converting to JSON
userSchema.set("toJSON", {
    transform(doc, ret) {
        delete ret.__v;
        return ret;
    },
});

export default model("User", userSchema);