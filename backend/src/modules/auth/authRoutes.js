/**
 * Authentication Routes
 * Defines authentication endpoints and their middleware chains
 * Uses Microsoft OAuth 2.0 authentication only
 *
 * @module modules/auth/authRoutes
 */

const express = require('express');
const router = express.Router();

const authController = require('./authController');
const authMiddleware = require('../../middlewares/authMiddleware');

// ============================================================================
// Microsoft OAuth Routes
// ============================================================================

/**
 * GET /api/auth/microsoft
 * Initiate Microsoft OAuth login flow
 * Public endpoint - no authentication required
 * Redirects user to Microsoft login page
 */
router.get(
    '/microsoft',
    authController.initiateMicrosoftLogin
);

/**
 * GET /api/auth/callback
 * Microsoft OAuth callback endpoint
 * Public endpoint - no authentication required
 * Receives authorization code from Microsoft and completes authentication
 * Redirects to frontend with token or error
 */
router.get(
    '/callback',
    authController.handleMicrosoftCallback
);

// ============================================================================
// Token Verification Route
// ============================================================================

/**
 * POST /api/auth/verify
 * Verify JWT token and return user data
 * Protected endpoint - requires valid JWT token
 * Returns user information
 */
router.post(
    '/verify',
    authMiddleware,              // Verify token and attach user to req
    authController.verifyToken   // Return user data
);

// ============================================================================
// Logout Route
// ============================================================================

/**
 * POST /api/auth/logout
 * Logout user (audit trail only, token invalidation is client-side)
 * Protected endpoint - requires valid JWT token
 * Returns success message
 */
router.post(
    '/logout',
    authMiddleware,         // Verify token
    authController.logout   // Log logout and return success
);

module.exports = router;
