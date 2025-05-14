/**
 * Generate HTML for verification email
 * @param {string} name - User's name
 * @param {string} verificationUrl - URL for email verification
 * @returns {string} HTML email content
 */
export const generateVerificationEmail = (name, verificationUrl) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to Artisan Platform!</h2>
      <p>Hello ${name},</p>
      <p>Thank you for registering with us. Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Verify Email</a>
      </div>
      <p>If the button doesn't work, you can also click on the link below or copy it into your browser:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>Best regards,<br>The Artisan Platform Team</p>
    </div>
  `;
};

/**
 * Generate HTML for password reset email
 * @param {string} name - User's name
 * @param {string} resetUrl - URL for password reset
 * @returns {string} HTML email content
 */
export const generatePasswordResetEmail = (name, resetUrl) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Hello ${name},</p>
      <p>You recently requested to reset your password. Click the button below to reset it:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset Password</a>
      </div>
      <p>If the button doesn't work, you can also click on the link below or copy it into your browser:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
      <p>Best regards,<br>The Artisan Platform Team</p>
    </div>
  `;
};

/**
 * Generate HTML for password change notification
 * @param {string} name - User's name
 * @returns {string} HTML email content
 */
export const generatePasswordChangedEmail = (name) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Changed</h2>
      <p>Hello ${name},</p>
      <p>Your password was recently changed. If you made this change, you can disregard this email.</p>
      <p>If you did not change your password, please contact our support team immediately as your account may have been compromised.</p>
      <p>Best regards,<br>The Artisan Platform Team</p>
    </div>
  `;
};