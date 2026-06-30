import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Test connection
const testConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connected successfully');
    return result;
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
    return null;
  }
};

// Upload image
export const uploadImage = async (file, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: 'gym-app/images',
      resource_type: 'image',
      transformation: [
        { width: 500, height: 500, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ],
      ...options
    });
    return result;
  } catch (error) {
    console.error('❌ Image upload error:', error);
    throw new Error('Failed to upload image');
  }
};

// Upload video
export const uploadVideo = async (file, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: 'gym-app/videos',
      resource_type: 'video',
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ],
      ...options
    });
    return result;
  } catch (error) {
    console.error('❌ Video upload error:', error);
    throw new Error('Failed to upload video');
  }
};

// Delete file
export const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('❌ Delete file error:', error);
    throw new Error('Failed to delete file');
  }
};

// Get optimized URL
export const getOptimizedUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    quality: 'auto',
    fetch_format: 'auto',
    ...options
  });
};

// Get thumbnail URL
export const getThumbnailUrl = (publicId, width = 300, height = 300) => {
  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto'
  });
};

// Get video thumbnail
export const getVideoThumbnail = (publicId) => {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    format: 'jpg',
    width: 400,
    height: 300,
    crop: 'fill'
  });
};

export default cloudinary;
