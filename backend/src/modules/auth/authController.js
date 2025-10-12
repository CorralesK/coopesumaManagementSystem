/**
 * Authentication Controller
 * Handles HTTP requests for authentication endpoints
 * Supports Microsoft OAuth 2.0 and traditional username/password login
 *
 * @module modules/auth/authController
 */

const authService = require('./authService');
const { successResponse, errorResponse } = require('../../utils/responseFormatter');
const { generateAuthorizationUrl, validateState } = require('../../utils/microsoftOAuthUtils');
const { microsoftConfig } = require('../../config/microsoftConfig');
const MESSAGES = require('../../constants/messages');
const ERROR_CODES = require('../../constants/errorCodes');
const logger = require('../../utils/logger');

/**
 * Initiate Microsoft OAuth login
 * Generates authorization URL and redirects user to Microsoft login page
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Redirect} Redirects to Microsoft authorization page
 */
const initiateMicrosoftLogin = async (req, res) => {
    try {
        logger.info('Initiating Microsoft OAuth login');

        // Generate authorization URL with state for CSRF protection
        const { authorizationUrl, state } = generateAuthorizationUrl();

        // Store state in session/cookie for validation on callback
        // Using cookie with httpOnly and secure flags
        res.cookie('oauth_state', state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'lax',
            maxAge: 10 * 60 * 1000 // 10 minutes
        });

        logger.debug('Generated OAuth authorization URL', { state });

        // Redirect user to Microsoft login page
        return res.redirect(authorizationUrl);
    } catch (error) {
        logger.error('Error initiating Microsoft OAuth login', {
            error: error.message,
            stack: error.stack
        });

        // Redirect to frontend with error
        return res.redirect(`${microsoftConfig.frontendUrl}/login?error=oauth_init_failed`);
    }
};

/**
 * Handle Microsoft OAuth callback
 * Receives authorization code from Microsoft and completes authentication
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Redirect} Redirects to frontend with token or error
 */
const handleMicrosoftCallback = async (req, res) => {
    try {
        const { code, state, error, error_description } = req.query;

        logger.info('Received Microsoft OAuth callback', {
            hasCode: !!code,
            hasError: !!error,
            state: state
        });

        // Check if Microsoft returned an error
        if (error) {
            logger.warn('Microsoft OAuth error', { error, error_description });
            return res.redirect(
                `${microsoftConfig.frontendUrl}/login?error=oauth_error&message=${encodeURIComponent(error_description || error)}`
            );
        }

        // Validate authorization code presence
        if (!code) {
            logger.warn('Missing authorization code in callback');
            return res.redirect(
                `${microsoftConfig.frontendUrl}/login?error=missing_code`
            );
        }

        // Validate state parameter (CSRF protection)
        const storedState = req.cookies.oauth_state;

        if (!validateState(state, storedState)) {
            logger.warn('State validation failed - possible CSRF attack', {
                receivedState: state,
                storedState: storedState
            });

            return res.redirect(
                `${microsoftConfig.frontendUrl}/login?error=state_mismatch`
            );
        }

        // Clear state cookie
        res.clearCookie('oauth_state');

        // Complete authentication with Microsoft
        const result = await authService.authenticateWithMicrosoft(code);

        logger.info('Microsoft OAuth authentication completed successfully', {
            userId: result.user.userId,
            email: result.user.email
        });

        // Redirect to frontend with token
        // Frontend will store token in memory (React state)
        return res.redirect(
            `${microsoftConfig.frontendUrl}/auth/success?token=${result.token}`
        );
    } catch (error) {
        // Handle operational errors
        if (error.isOperational) {
            logger.warn('OAuth authentication failed', {
                error: error.message,
                errorCode: error.errorCode
            });

            return res.redirect(
                `${microsoftConfig.frontendUrl}/login?error=${error.errorCode}&message=${encodeURIComponent(error.message)}`
            );
        }

        // Log unexpected errors
        logger.error('Unexpected error in Microsoft OAuth callback', {
            error: error.message,
            stack: error.stack
        });

        // Redirect to frontend with generic error
        return res.redirect(
            `${microsoftConfig.frontendUrl}/login?error=oauth_failed`
        );
    }
};

/**
 * Verify token endpoint
 * Verifies JWT token and returns user data
 * Note: Token is already verified by authMiddleware
 * User data is already attached to req.user by middleware
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user data
 */
const verifyToken = async (req, res) => {
    try {
        // User data is already available in req.user (set by authMiddleware)
        // No need to query database again

        if (!req.user) {
            return errorResponse(
                res,
                MESSAGES.UNAUTHORIZED,
                ERROR_CODES.UNAUTHORIZED,
                401
            );
        }

        // Return user data
        return successResponse(
            res,
            'Token válido',
            req.user,
            200
        );
    } catch (error) {
        // Log unexpected errors
        logger.error('Unexpected error in verifyToken controller', {
            error: error.message,
            stack: error.stack
        });

        // Return generic error response
        return errorResponse(
            res,
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Logout endpoint
 * Logs audit trail for logout (token invalidation handled client-side)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
const logout = async (req, res) => {
    try {
        // Log logout for audit purposes
        if (req.user) {
            logger.info('User logged out', {
                userId: req.user.userId,
                email: req.user.email
            });
        }

        // Return success response
        // Note: Token invalidation is handled client-side by removing token from memory
        return successResponse(
            res,
            MESSAGES.LOGOUT_SUCCESS,
            null,
            200
        );
    } catch (error) {
        logger.error('Error in logout controller', {
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

module.exports = {
    initiateMicrosoftLogin,
    handleMicrosoftCallback,
    verifyToken,
    logout
};
