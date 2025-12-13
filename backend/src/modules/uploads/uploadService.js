/**
 * Upload Service
 * Handles image uploads to Cloudinary
 */

const cloudinary = require('../../config/cloudinary');

/**
 * Upload image buffer to Cloudinary
 * @param {Buffer} buffer - Image buffer from multer
 * @param {string} folder - Cloudinary folder name
 * @param {string} publicId - Optional public ID for the image
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadToCloudinary = (buffer, folder = 'coopesuma/members', publicId = null) => {
    return new Promise((resolve, reject) => {
        const uploadOptions = {
            folder,
            resource_type: 'image',
            transformation: [
                { width: 500, height: 500, crop: 'limit' }, // Resize max 500x500
                { quality: 'auto:good' }, // Auto quality optimization
                { fetch_format: 'auto' } // Auto format (webp when supported)
            ]
        };

        if (publicId) {
            uploadOptions.public_id = publicId;
            uploadOptions.overwrite = true;
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        uploadStream.end(buffer);
    });
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID of the image
 * @returns {Promise<Object>} Cloudinary deletion result
 */
const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        throw error;
    }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} Public ID or null
 */
const extractPublicIdFromUrl = (url) => {
    if (!url || !url.includes('cloudinary.com')) {
        return null;
    }

    try {
        // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.ext
        const parts = url.split('/upload/');
        if (parts.length < 2) return null;

        const pathWithVersion = parts[1];
        // Remove version (v1234567890/) if present
        const pathWithoutVersion = pathWithVersion.replace(/^v\d+\//, '');
        // Remove file extension
        const publicId = pathWithoutVersion.replace(/\.[^.]+$/, '');

        return publicId;
    } catch (error) {
        console.error('Error extracting public ID:', error);
        return null;
    }
};

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary,
    extractPublicIdFromUrl
};
