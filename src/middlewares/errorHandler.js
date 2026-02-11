import { AppError, ValidationError } from '../utils/errors.js';
import { HTTP_STATUS } from '../utils/constants.js';
import env from '../config/env.js';

const handleCastError = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, HTTP_STATUS.BAD_REQUEST);
};

const handleDuplicateFieldsError = (error) => {
  const field = Object.keys(error.keyValue)[0];
  const message = `Duplicate value for field: ${field}`;
  return new AppError(message, HTTP_STATUS.CONFLICT);
};

const handleValidationError = (error) => {
  const errors = Object.values(error.errors).map((err) => ({
    field: err.path,
    message: err.message,
  }));
  return new ValidationError('Validation failed', errors);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    errors: err.errors || null,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || null,
    });
  } else {
    console.error('❌ ERROR:', err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  err.status = err.status || 'error';

  if (env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') error = handleCastError(err);
    if (err.code === 11000) error = handleDuplicateFieldsError(err);
    if (err.name === 'ValidationError') error = handleValidationError(err);

    sendErrorProd(error, res);
  }
};

export const notFound = (req, res, next) => {
  const error = new AppError(`Route not found: ${req.originalUrl}`, HTTP_STATUS.NOT_FOUND);
  next(error);
};
