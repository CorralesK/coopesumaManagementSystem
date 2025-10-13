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
const { isEmailAuthorized, getRoleByEmail, getFullNameByEmail } = require('../../config/authorizedUsers');
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

        // Step 2: Check if email is authorized
        const authorizedUser = isEmailAuthorized(microsoftProfile.email);

        if (!authorizedUser) {
            logger.warn('Unauthorized email attempted to login', {
                email: microsoftProfile.email
            });

            throw new AuthError(
                'No tiene autorización para acceder al sistema. Contacte al administrador.',
                ERROR_CODES.FORBIDDEN,
                403
            );
        }

        logger.info('Email is authorized', {
            email: microsoftProfile.email,
            role: authorizedUser.role
        });

        // Step 3: Check if user exists in database
        let user = await userRepository.findByMicrosoftId(microsoftProfile.microsoftId);

        if (!user) {
            // Check if user exists by email (for linking existing accounts)
            user = await userRepository.findByEmail(microsoftProfile.email);

            if (user) {
                // User exists but doesn't have Microsoft account linked
                logger.info('Linking Microsoft account to existing user', {
                    userId: user.user_id,
                    email: microsoftProfile.email
                });

                user = await userRepository.linkMicrosoftAccount(
                    user.user_id,
                    microsoftProfile.microsoftId,
                    microsoftProfile.email
                );
            } else {
                // User doesn't exist, create new user
                logger.info('Creating new user from Microsoft OAuth', {
                    email: microsoftProfile.email,
                    role: authorizedUser.role
                });

                user = await userRepository.create({
                    fullName: microsoftProfile.displayName || authorizedUser.fullName,
                    role: authorizedUser.role,
                    isActive: true,
                    microsoftId: microsoftProfile.microsoftId,
                    email: microsoftProfile.email
                });

                logger.info('New user created successfully', {
                    userId: user.user_id,
                    email: user.email,
                    role: user.role
                });
            }
        }

        // Step 4: Check if user is active
        if (!user.is_active) {
            logger.warn('Inactive user attempted to login', {
                userId: user.user_id,
                email: user.email
            });

            throw new AuthError(
                MESSAGES.USER_INACTIVE,
                ERROR_CODES.USER_INACTIVE,
                401
            );
        }

        // Step 5: Generate internal JWT token
        const tokenPayload = {
            userId: user.user_id,
            email: user.email,
            role: user.role
        };

        const token = generateToken(tokenPayload);

        // Step 6: Prepare user data for response
        const userData = {
            userId: user.user_id,
            fullName: user.full_name,
            email: user.email,
            role: user.role
        };

        logger.info('Microsoft OAuth authentication successful', {
            userId: user.user_id,
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
        if (!user.is_active) {
            logger.warn('Token verification failed: user is inactive', {
                userId: user.user_id
            });

            throw new AuthError(
                MESSAGES.USER_INACTIVE,
                ERROR_CODES.USER_INACTIVE,
                401
            );
        }

        // Return user data
        return {
            userId: user.user_id,
            fullName: user.full_name,
            email: user.email,
            role: user.role,
            isActive: user.is_active
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
