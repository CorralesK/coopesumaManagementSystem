/**
 * QR Code Generation Utilities
 */

const QRCode = require('qrcode');
const crypto = require('crypto');

/**
 * Generate a unique QR hash for a member
 * @param {string} identification - Member identification
 * @param {string} fullName - Member full name
 * @returns {string} - Unique QR hash
 */
const generateQrHash = (identification, fullName = '') => {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(16).toString('hex');
    const data = `${identification}_${fullName}_${timestamp}_${randomString}`;

    return crypto
        .createHash('sha256')
        .update(data)
        .digest('hex');
};

/**
 * Generate verification URL for QR code
 * @param {string} qrHash - QR hash
 * @returns {string} - Full verification URL
 */
const generateVerificationUrl = (qrHash) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return `${frontendUrl}/verify?qr=${qrHash}`;
};

/**
 * Generate QR code image as Data URL
 * @param {string} data - Data to encode in QR
 * @returns {Promise<string>} - QR code as Data URL
 */
const generateQrCodeDataUrl = async (data) => {
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(data, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            quality: 0.95,
            margin: 1,
            width: 300
        });
        return qrCodeDataUrl;
    } catch (error) {
        throw new Error('Error generating QR code');
    }
};

/**
 * Generate QR code as buffer
 * @param {string} data - Data to encode in QR
 * @returns {Promise<Buffer>} - QR code as buffer
 */
const generateQrCodeBuffer = async (data) => {
    try {
        const qrCodeBuffer = await QRCode.toBuffer(data, {
            errorCorrectionLevel: 'H',
            type: 'png',
            quality: 0.95,
            margin: 1,
            width: 300
        });
        return qrCodeBuffer;
    } catch (error) {
        throw new Error('Error generating QR code buffer');
    }
};

module.exports = {
    generateQrHash,
    generateQrCodeDataUrl,
    generateQrCodeBuffer,
    generateVerificationUrl
};