/**
 * Authentication Service
 * Business logic for authentication operations
 * Uses Microsoft OAuth 2.0 authentication only
 *
 * @module modules/auth/authService
 */

const userRepository = require('../users/userRepository');
const { generateToken, verifyToken } = require('../../utils/jwtUtils');
const { completeOAuthFlow } = require('../../utils/microsoftOAuthUtils');
const ERROR_CODES = require('../../constants/errorCodes');
const MESSAGES = require('../../constants/messages');
const logger = require('../../utils/logger');

/**
 * Custom error class for operational errors
 */
class AuthError extends Error {
    constructor(message, errorCode, statusCode) {
        super(message);
        this.errorCode = errorCode;
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}

/**
 * Authenticate user with Microsoft OAuth
 * Complete flow: exchange code for token, get user profile, create/update user
 *
 * @param {string} code - Authorization code from Microsoft
 * @returns {Promise<Object>} - Token and user data
 * @throws {AuthError} - If authentication fails
 */
const authenticateWithMicrosoft = async (code) => {
    try {
        logger.info('Starting Microsoft OAuth authentication');

        // Step 1: Complete OAuth flow (exchange code + get user profile)
        const microsoftProfile = await completeOAuthFlow(code);

        logger.debug('Microsoft profile obtained', {
            email: microsoftProfile.email,
            microsoftId: microsoftProfile.microsoftId
        });

        // Step 2: Check if user exists in database by Microsoft ID
        let user = await userRepository.findByMicrosoftId(microsoftProfile.microsoftId);

        if (!user) {
            // Check if user exists by email (for linking existing accounts)
            user = await userRepository.findByEmail(microsoftProfile.email);

            if (user) {
                // User exists in database but doesn't have Microsoft account linked
                logger.info('Linking Microsoft account to existing user', {
                    userId: user.userId,
                    email: microsoftProfile.email
                });

                user = await userRepository.linkMicrosoftAccount(
                    user.userId,
                    microsoftProfile.microsoftId,
                    microsoftProfile.email
                );
            } else {
                // User doesn't exist in database - deny access
                logger.warn('User not found in database attempted to login', {
                    email: microsoftProfile.email,
                    microsoftId: microsoftProfile.microsoftId
                });

                throw new AuthError(
                    'Usuario no registrado en el sistema. Contacte al administrador para crear su cuenta.',
                    ERROR_CODES.FORBIDDEN,
                    403
                );
            }
        }

        // Step 3: Check if user is active
        if (!user.isActive) {
            logger.warn('Inactive user attempted to login', {
                userId: user.userId,
                email: user.email
            });

            throw new AuthError(
                MESSAGES.USER_INACTIVE,
                ERROR_CODES.USER_INACTIVE,
                401
            );
        }

        // Step 4: Generate internal JWT token
        const tokenPayload = {
            userId: user.userId,
            email: user.email,
            role: user.role,
            fullName: user.fullName
        };

        const token = generateToken(tokenPayload);

        // Step 5: Prepare user data for response
        const userData = {
            userId: user.userId,
            fullName: user.fullName,
            email: user.email,
            role: user.role
        };

        logger.info('Microsoft OAuth authentication successful', {
            userId: user.userId,
            email: user.email,
            role: user.role
        });

        return {
            token,
            user: userData
        };
    } catch (error) {
        // Re-throw operational errors
        if (error.isOperational) {
            throw error;
        }

        // Log unexpected errors
        logger.error('Error during Microsoft OAuth authentication', {
            error: error.message,
            stack: error.stack
        });

        // Throw generic error for unexpected issues
        throw new AuthError(
            'Error al autenticar con Microsoft. Por favor, intente nuevamente.',
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};


/**
 * Verify token and retrieve user data
 *
 * @param {string} token - JWT token
 * @returns {Promise<Object>} - User data
 * @throws {AuthError} - If token is invalid or user not found
 */
const verifyTokenAndGetUser = async (token) => {
    try {
        // Verify token and extract payload
        const decoded = verifyToken(token);

        // Query database for user by userId
        const user = await userRepository.findById(decoded.userId);

        // If user not found
        if (!user) {
            logger.warn('Token verification failed: user not found', {
                userId: decoded.userId
            });

            throw new AuthError(
                MESSAGES.USER_NOT_FOUND,
                ERROR_CODES.USER_NOT_FOUND,
                404
            );
        }

        // Check if user is still active
        if (!user.isActive) {
            logger.warn('Token verification failed: user is inactive', {
                userId: user.userId
            });

            throw new AuthError(
                MESSAGES.USER_INACTIVE,
                ERROR_CODES.USER_INACTIVE,
                401
            );
        }

        // Return user data
        return {
            userId: user.userId,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            isActive: user.isActive
        };
    } catch (error) {
        // Handle JWT specific errors
        if (error.name === 'TokenExpiredError') {
            throw new AuthError(
                MESSAGES.TOKEN_EXPIRED,
                ERROR_CODES.TOKEN_EXPIRED,
                401
            );
        }

        if (error.name === 'JsonWebTokenError') {
            throw new AuthError(
                MESSAGES.UNAUTHORIZED,
                ERROR_CODES.TOKEN_INVALID,
                401
            );
        }

        // Re-throw operational errors
        if (error.isOperational) {
            throw error;
        }

        // Log unexpected errors
        logger.error('Error during token verification', {
            error: error.message,
            stack: error.stack
        });

        // Throw generic error for unexpected issues
        throw new AuthError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

module.exports = {
    authenticateWithMicrosoft,
    verifyTokenAndGetUser,
    AuthError
};
