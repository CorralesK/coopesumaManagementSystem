/**
 * JWT Token Generation and Verification Utilities
 */

const jwt = require('jsonwebtoken');
const config = require('../config/environment');

/**
 * Generate JWT token
 * @param {Object} payload - Data to encode in token
 * @returns {string} - JWT token
 */
const generateToken = (payload) => {
    return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn
    });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} - Decoded token payload
 * @throws {Error} - If token is invalid or expired
 */
const verifyToken = (token) => {
    return jwt.verify(token, config.jwt.secret);
};

/**
 * Decode JWT token without verification
 * @param {string} token - JWT token to decode
 * @returns {Object} - Decoded token payload
 */
const decodeToken = (token) => {
    return jwt.decode(token);
};

module.exports = {
    generateToken,
    verifyToken,
    decodeToken
};