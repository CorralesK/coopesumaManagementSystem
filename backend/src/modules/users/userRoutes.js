/**
 * User Routes
 * Defines user management endpoints and their middleware chains
 *
 * @module modules/users/userRoutes
 */

const express = require('express');
const router = express.Router();

const userController = require('./userController');
const {
    createUserSchema,
    updateUserSchema,
    userFiltersSchema
} = require('./userValidation');
const { validate, validateQuery } = require('../../middlewares/validationMiddleware');
const authMiddleware = require('../../middlewares/authMiddleware');
const { requireRole } = require('../../middlewares/roleMiddleware');
const { USER_ROLES } = require('../../constants/roles');

// ============================================================================
// User CRUD Routes
// ============================================================================

/**
 * GET /api/users
 * Get all users with optional filtering
 * Protected: Requires authentication
 * Accessible by: Administrator only
 *
 * Query parameters:
 * - role: "administrator" | "registrar" | "manager" | "member" (optional)
 * - isActive: "true" | "false" (optional)
 *
 * Response: List of users
 */
router.get(
    '/',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR]),
    validateQuery(userFiltersSchema),
    userController.getAllUsers
);

/**
 * GET /api/users/:id
 * Get user by ID
 * Protected: Requires authentication
 * Accessible by: Administrator only
 *
 * Response: User object
 */
router.get(
    '/:id',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR]),
    userController.getUserById
);

/**
 * POST /api/users
 * Create new user
 * Protected: Requires authentication
 * Accessible by: Administrator only
 *
 * Request body:
 * {
 *   "fullName": "string" (required, 3-100 chars),
 *   "username": "string" (required, 3-50 chars, alphanumeric + underscore),
 *   "password": "string" (optional, min 8 chars, must contain uppercase, lowercase, number),
 *   "email": "string" (optional, valid email),
 *   "role": "administrator" | "registrar" | "manager" | "member" (required),
 *   "isActive": boolean (optional, default: true),
 *   "microsoftId": "string" (optional)
 * }
 *
 * Note: At least one authentication method (password or microsoftId) is required
 *
 * Response: Created user object
 */
router.post(
    '/',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR]),
    validate(createUserSchema),
    userController.createUser
);

/**
 * PUT /api/users/:id
 * Update user
 * Protected: Requires authentication
 * Accessible by: Administrator only
 *
 * Request body:
 * {
 *   "fullName": "string" (optional, 3-100 chars),
 *   "username": "string" (optional, 3-50 chars, alphanumeric + underscore),
 *   "password": "string" (optional, min 8 chars, must contain uppercase, lowercase, number),
 *   "email": "string" (optional, valid email),
 *   "role": "administrator" | "registrar" | "manager" | "member" (optional)
 * }
 *
 * Note: At least one field must be provided
 *
 * Response: Updated user object
 */
router.put(
    '/:id',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR]),
    validate(updateUserSchema),
    userController.updateUser
);

// ============================================================================
// User Activation Routes
// ============================================================================

/**
 * POST /api/users/:id/deactivate
 * Deactivate user (soft delete)
 * Protected: Requires authentication
 * Accessible by: Administrator only
 *
 * Note: Cannot deactivate the last active administrator
 *
 * Response: Deactivated user object
 */
router.post(
    '/:id/deactivate',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR]),
    userController.deactivateUser
);

/**
 * POST /api/users/:id/activate
 * Activate user
 * Protected: Requires authentication
 * Accessible by: Administrator only
 *
 * Response: Activated user object
 */
router.post(
    '/:id/activate',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR]),
    userController.activateUser
);

module.exports = router;
