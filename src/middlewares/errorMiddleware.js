import { logger } from '../utils/logger.js';

/**
 * Error response helper
 * @param {Error} err - Error object
 * @param {Object} res - Express response object
 */
const errorResponse = (err, res) => {
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

/**
 * Custom error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    err.statusCode = 400;
    err.message = message;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    err.statusCode = 400;
    err.message = `Duplicate field value entered: ${JSON.stringify(err.keyValue)}`;
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    err.statusCode = 400;
    err.message = `Invalid ${err.path}: ${err.value}`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    err.statusCode = 401;
    err.message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    err.statusCode = 401;
    err.message = 'Token expired';
  }

  errorResponse(err, res);
};