import mongoose from 'mongoose';
import AppError from './appError.js';

// Validate MongoDB ObjectId
export const validateObjectId = (id, fieldName = 'ID') => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError(`Invalid ${fieldName} provided. Please check and try again.`, 400);
    }
    return true;
};

// Validate multiple ObjectIds
export const validateObjectIds = (ids) => {
    for (const [fieldName, id] of Object.entries(ids)) {
        if (id) {
            validateObjectId(id, fieldName);
        }
    }
    return true;
};
