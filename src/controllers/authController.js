import crypto from 'crypto';
import User from '../models/userModel.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwtUtils.js';
import { sendEmail } from '../utils/sendEmail.js';
import { 
  generateVerificationEmail,
  generatePasswordResetEmail,
  generatePasswordChangedEmail
} from '../utils/emailTemplates.js';
import { logger } from '../utils/logger.js';

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const register = async (req, res, next) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      dateOfBirth,
      address,
      phoneNumber,
      role,
      category
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User already exists',
      });
    }

    let userData = {
      firstName,
      lastName,
      email,
      password,
      dateOfBirth,
      address,
      phoneNumber,
      role
    };
    
    if (role === 'artisan' && category) {
      userData.category = category;
    }

    const user = await User.create(userData);
    const verificationToken = user.generateVerificationToken();
    await user.save();

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Email Verification',
        text: `Please verify your email by clicking on the following link: ${verificationUrl}`,
        html: generateVerificationEmail(user.firstName, verificationUrl),
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email to verify your account.',
      });
    } catch (error) {
      logger.error(`Failed to send verification email: ${error.message}`);
      res.status(201).json({
        success: true,
        message: 'User registered successfully but failed to send verification email. Please contact support.',
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Verify email
 * @route GET /api/auth/verify-email/:token
 * @access Public
 */
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const verificationToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      verificationToken,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    // Update user
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log in user
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }


    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        error: 'Please verify your email before logging in',
      });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
    };
    
    if (user.role === 'artisan') {
      userData.category = user.category;
    }

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: userData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log out user
 * @route POST /api/auth/logout
 * @access Private
 */
export const logout = async (req, res, next) => {
  try {
    // Find user and clear refresh token
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh token
 * @route POST /api/auth/refresh-token
 * @access Public
 */
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required',
      });
    }

    try {
      // Verify refresh token
      const decoded = verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);

      // Find user by ID and check if refresh token matches
      const user = await User.findById(decoded.id);

      if (!user || user.refreshToken !== refreshToken) {
        return res.status(401).json({
          success: false,
          error: 'Invalid refresh token',
        });
      }

      // Generate new tokens
      const accessToken = generateAccessToken(user._id, user.role);
      const newRefreshToken = generateRefreshToken(user._id);

      // Update refresh token in database
      user.refreshToken = newRefreshToken;
      await user.save();

      res.status(200).json({
        success: true,
        accessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password
 * @route POST /api/auth/forgot-password
 * @access Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No user found with that email',
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      // Send email
      await sendEmail({
        to: user.email,
        subject: 'Password Reset',
        text: `You requested a password reset. Please go to: ${resetUrl}`,
        html: generatePasswordResetEmail(user.firstName, resetUrl),
      });

      res.status(200).json({
        success: true,
        message: 'Password reset email sent',
      });
    } catch (error) {
      // If email sending fails, clear reset fields
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      logger.error(`Failed to send reset email: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: 'Email could not be sent',
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password
 * @route PUT /api/auth/reset-password/:token
 * @access Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user by token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    try {
      // Send password changed notification
      await sendEmail({
        to: user.email,
        subject: 'Password Changed',
        text: 'Your password has been changed successfully.',
        html: generatePasswordChangedEmail(user.firstName),
      });
    } catch (error) {
      logger.error(`Failed to send password changed email: ${error.message}`);
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    next(error);
  }
};