import { v2 as cloudinary } from 'cloudinary';
import logger from './logger.js';


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file to Cloudinary
 * @param {string} filePath - Path to the file to upload
 * @param {Object} options - Additional upload options
 * @returns {Promise<string>} Cloudinary URL
 */
export const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    // Determine resource type based on file extension
    const fileExtension = filePath.split('.').pop().toLowerCase();
    const videoExtensions = ['mp4', 'mov', 'avi', 'webm'];
    const resourceType = videoExtensions.includes(fileExtension) ? 'video' : 'image';

    const uploadOptions = {
      folder: 'artisan-platform',
      use_filename: true,
      unique_filename: true,
      resource_type: resourceType,
      ...options
    };

    const result = await cloudinary.uploader.upload(filePath, uploadOptions);
    return result.secure_url;
  } catch (error) {
    logger.error(`Error uploading to Cloudinary: ${error.message}`);
    throw new Error('Failed to upload media file');
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID of the file
 * @param {string} resourceType - Resource type (image or video)
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    logger.error(`Error deleting from Cloudinary: ${error.message}`);
    throw new Error('Failed to delete media file');
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string} Public ID
 */
export const getPublicIdFromUrl = (url) => {
  try {
    // Extract the public ID from the URL
    const urlParts = url.split('/');
    const publicIdWithExtension = urlParts.slice(-1)[0];
    const publicId = publicIdWithExtension.split('.')[0];
    const folder = urlParts.slice(-2)[0];
    
    return `${folder}/${publicId}`;
  } catch (error) {
    logger.error(`Error extracting public ID from URL: ${error.message}`);
    return null;
  }
};

export default {
  uploadToCloudinary,
  deleteFromCloudinary,
  getPublicIdFromUrl
};