import Merch from "../models/merch.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

export const addMerch = catchAsync(async (req, res, next) => {
    const { type, name, description, sizesAvailable, price, stock } = req.body;

    // validate required fields
    if (!type || !name || !description || !price || !stock) {
        return next(new AppError('All merch fields are required.', 400));
    };

    // validate sizesAvailable for wearable type
    if (type === 'wearable' && !sizesAvailable) {
        return next(new AppError('sizesAvailable is required for wearable type.', 400));
    };

    // validate sizesAvailable is not provided for non-wearable types
    if (type !== 'wearable' && sizesAvailable) {
        return next(new AppError('sizesAvailable should not be provided for non-wearable types.', 400));
    };

    // create new merch item
    const merchData = {
        type,
        name,
        description,
        price,
        stockQuantity: stock
    };

    // add sizesAvailable only for wearable type
    if (type === 'wearable') {
        merchData.sizesAvailable = sizesAvailable;
    }

    const newMerch = new Merch(merchData);

    // save to database
    await newMerch.save();

    // send response
    res.status(201).json({
        success: true,
        message: 'Merch item added successfully',
        data: {
            merch: newMerch
        }
    });
});




export const getAllMerch = catchAsync(async (req, res, next) => {

    // fetch all merch items from database
    const merchItems = await Merch.find();

    // send response
    res.status(200).json({
        success: true,
        results: merchItems.length,
        data: {
            merch: merchItems
        }
    });

});




export const getMerchById = catchAsync(async (req, res, next) => {
    //get merch id from params
    const merchId = req.params.id;

    //fetch the merch item from database
    const merchItem = await Merch.findById(merchId);

    //handle case where merch item is not found
    if (!merchItem) {
        return next(new AppError('Merch item not found', 404));
    };

    //send response
    res.status(200).json({
        success: true,
        data: {
            merch: merchItem
        }
    });

});



export const updateMerchStock = catchAsync(async (req, res, next) => {
    const merchId = req.params.id;
    const { type, name, description, sizesAvailable, price, stock } = req.body;

    const merchItem = await Merch.findById(merchId);

    if (!merchItem) {
        return next(new AppError('Merch item not found', 404));
    };

    // update fields if provided
    if (type !== undefined) {
        // validate sizesAvailable when changing to wearable type
        if (type === 'wearable' && !merchItem.sizesAvailable && !sizesAvailable) {
            return next(new AppError('sizesAvailable is required for wearable type.', 400));
        }
        merchItem.type = type;
    }

    if (name !== undefined) merchItem.name = name;
    if (description !== undefined) merchItem.description = description;
    if (price !== undefined) merchItem.price = price;
    if (stock !== undefined) merchItem.stockQuantity = stock;

    // handle sizesAvailable based on type
    if (sizesAvailable !== undefined) {
        const currentType = merchItem.type;
        if (currentType !== 'wearable') {
            return next(new AppError('sizesAvailable should not be provided for non-wearable types.', 400));
        }
        merchItem.sizesAvailable = sizesAvailable;
    }

    // remove sizesAvailable if type changed from wearable to non-wearable
    if (type !== undefined && type !== 'wearable') {
        merchItem.sizesAvailable = undefined;
    }

    // save updated merch item
    await merchItem.save();

    //send response
    res.status(200).json({
        success: true,
        message: 'Merch item updated successfully',
        data: {
            merch: merchItem
        }
    });

});



export const deleteMerch = catchAsync(async (req, res, next) => {
    const merchId = req.params.id;  

    const merchItem = await Merch.findByIdAndDelete(merchId);

    if (!merchItem) {
        return next(new AppError('Merch item not found', 404));
    };

    //send response
    res.status(200).json({
        success: true,
        message: 'Merch item deleted successfully'
    });

});