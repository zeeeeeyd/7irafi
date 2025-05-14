import { validationResult } from 'express-validator';

/**
 * Validate request middleware
 * Uses express-validator to validate request
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};