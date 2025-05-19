
import { body } from 'express-validator';

/**
 * Validation rules for user registration
 */
export const registerValidator = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
    
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
    
  body('dateOfBirth')
    .notEmpty()
    .withMessage('Date of birth is required')
    .isISO8601()
    .withMessage('Please provide a valid date')
    .custom(value => {
      const date = new Date(value);
      const now = new Date();
      const minimumAge = 13;
      
      // Calculate age
      let age = now.getFullYear() - date.getFullYear();
      const monthDiff = now.getMonth() - date.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) {
        age--;
      }
      
      if (age < minimumAge) {
        throw new Error(`You must be at least ${minimumAge} years old`);
      }
      
      if (date > now) {
        throw new Error('Date of birth cannot be in the future');
      }
      
      return true;
    }),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage(
      'Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character'
    ),
    
  body('confirmPassword')
    .trim()
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  
  body('address.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
    
  body('address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
    
  body('address.postalCode')
    .trim()
    .notEmpty()
    .withMessage('Postal code is required'),
    
  body('address.country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
    
  body('address.coordinates')
    .optional(),
    
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[0-9]{8,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['artisan', 'client'])
    .withMessage('Role must be either artisan or client'),
    
  body('category')
    .custom((value, { req }) => {
      if (req.body.role === 'artisan' && !value) {
        throw new Error('Category is required for artisans');
      }
      
      if (req.body.role === 'artisan') {
        const validCategories = ['Couture', 'Cuisine', 'Peinture', 'Electricite'];
        if (!validCategories.includes(value)) {
          throw new Error('Invalid category selected');
        }
      }
      
      return true;
    }),
];

/**
 * Validation rules for user login
 */
export const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Validation rules for forgot password
 */
export const forgotPasswordValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
];

/**
 * Validation rules for reset password
 */
export const resetPasswordValidator = [
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage(
      'Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character'
    ),
  
  body('confirmPassword')
    .trim()
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];