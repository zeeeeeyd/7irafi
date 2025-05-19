import httpStatus from 'http-status';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadToCloudinary } from '../config/clouadinary.js';
import catchAsync from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';

// Configure multer storage for temporary file handling
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure file filter to only accept images and videos
const fileFilter = (req, file, cb) => {
  // Define accepted MIME types
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  
  if ([...imageTypes, ...videoTypes].includes(file.mimetype)) {
    if (imageTypes.includes(file.mimetype)) {
      file.mediaType = 'image';
    } else {
      file.mediaType = 'video';
    }
    cb(null, true);
  } else {
    cb(new ApiError(httpStatus.BAD_REQUEST, 'Only image and video files are allowed'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  }
});

// Middleware to handle file uploads
const uploadMedia = upload.array('media', 5); // Max 5 files

const handleMediaUpload = catchAsync(async (req, res, next) => {
  // uploadMedia is used as middleware before this function
  if (!req.files || req.files.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No files uploaded');
  }

  const uploadPromises = req.files.map(async (file) => {
    try {
      const mediaUrl = await uploadToCloudinary(file.path);
      
      // Delete temporary file
      fs.unlinkSync(file.path);
      
      return {
        type: file.mediaType, // This was set in the fileFilter
        url: mediaUrl
      };
    } catch (error) {
      // Ensure we clean up the temporary file even if upload fails
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  });

  try {
    const uploadedMedia = await Promise.all(uploadPromises);
    res.status(httpStatus.OK).send({ media: uploadedMedia });
  } catch (error) {
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error uploading media files'));
  }
});

export { uploadMedia, handleMediaUpload };