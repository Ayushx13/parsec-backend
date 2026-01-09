import AppError from "./../utils/appError.js";


// Handle invalid MongoDB ObjectId
const handleCastErrorDB = (err) => {
  // Provide context-specific error messages
  const fieldMessages = {
    'orderId': 'Invalid Order ID provided. Please check and try again.',
    'bookingId': 'Invalid Booking ID provided. Please check and try again.',
    'userId': 'Invalid User ID provided.',
    'merchId': 'Invalid Merchandise ID provided.',
    '_id': 'Invalid ID provided. Please check and try again.'
  };
  
  const message = fieldMessages[err.path] || `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};


// Handle duplicate email or unique fields
const handleDuplicateFieldsDB = (err) => {
  // Handle payment-specific duplicate errors
  if (err.keyValue) {
    if (err.keyValue.paymentUTR) {
      return new AppError('This payment UTR has already been used. Please check if payment was already recorded.', 400);
    }
    if (err.keyValue.referenceId) {
      return new AppError('Payment for this order has already been recorded.', 400);
    }
    if (err.keyValue.email) {
      return new AppError('Email already exists. Please use another email.', 400);
    }
    // Generic duplicate error for other fields
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return new AppError(`${field} '${value}' already exists. Please use another value.`, 400);
  }
  
  const value = err.keyValue ? JSON.stringify(err.keyValue) : '';
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};


// Handle validation errors (schema rules)
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};


// Handle JWT invalid token error
const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again.', 401);
};


// Handle JWT expired token error
const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please log in again.', 401);
};


// Send error response in development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};


// Send error response in production
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // Programming or unknown error: don't leak error details
    console.error('❌ ERROR:', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }
};


// Main Global error middleware
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if ((process.env.NODE_ENV || '').trim() === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err, message: err.message, name: err.name, code: err.code, keyValue: err.keyValue };

    // Handle specific error types
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

export default globalErrorHandler;
