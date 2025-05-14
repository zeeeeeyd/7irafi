import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../utils/logger.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file to Cloudinary
 * @param {string} filePath - Path to the file to upload
 * @returns {Promise<string>} Cloudinary URL
 */
export const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'artisan-platform',
      use_filename: true,
      unique_filename: true,
    });
    return result.secure_url;
  } catch (error) {
    logger.error(`Error uploading to Cloudinary: ${error.message}`);
    throw new Error('Failed to upload image');
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID of the file
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    logger.error(`Error deleting from Cloudinary: ${error.message}`);
    throw new Error('Failed to delete image');
  }
}
