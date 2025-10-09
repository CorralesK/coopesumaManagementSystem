/**
 * Authentication Middleware
 * Verifies JWT token and attaches user info to request
 */

const { verifyToken } = require('../utils/jwtUtils');
const { errorResponse } = require('../utils/responseFormatter');
const ERROR_CODES = require('../constants/errorCodes');
const MESSAGES = require('../constants/messages');
const db = require('../config/database');
const logger = require('../utils/logger');

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(
                res,
                MESSAGES.UNAUTHORIZED,
                ERROR_CODES.UNAUTHORIZED,
                401
            );
        }

        // Extract token
        const token = authHeader.substring(7);

        // Verify token
        const decoded = verifyToken(token);

        // Fetch user from database to ensure user still exists and is active
        const query = `
            SELECT
                user_id,
                full_name,
                username,
                role,
                is_active
            FROM users
            WHERE user_id = $1
        `;

        const result = await db.query(query, [decoded.userId]);

        // If user not found
        if (result.rows.length === 0) {
            logger.warn('Token verification failed: user not found in database', {
                userId: decoded.userId
            });
            return errorResponse(
                res,
                MESSAGES.USER_NOT_FOUND,
                ERROR_CODES.USER_NOT_FOUND,
                404
            );
        }

        const user = result.rows[0];

        // Check if user is still active
        if (!user.is_active) {
            logger.warn('Token verification failed: user is inactive', {
                userId: user.user_id,
                username: user.username
            });
            return errorResponse(
                res,
                MESSAGES.USER_INACTIVE,
                ERROR_CODES.USER_INACTIVE,
                401
            );
        }

        // Attach user info to request (excluding password_hash)
        req.user = {
            userId: user.user_id,
            fullName: user.full_name,
            username: user.username,
            role: user.role,
            isActive: user.is_active
        };

        next();
    } catch (error) {
        // Handle JWT specific errors
        if (error.name === 'TokenExpiredError') {
            return errorResponse(
                res,
                MESSAGES.TOKEN_EXPIRED,
                ERROR_CODES.TOKEN_EXPIRED,
                401
            );
        }

        if (error.name === 'JsonWebTokenError') {
            return errorResponse(
                res,
                MESSAGES.UNAUTHORIZED,
                ERROR_CODES.TOKEN_INVALID,
                401
            );
        }

        // Log unexpected errors
        logger.error('Unexpected error in authMiddleware', {
            error: error.message,
            stack: error.stack
        });

        return errorResponse(
            res,
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

module.exports = authMiddleware;