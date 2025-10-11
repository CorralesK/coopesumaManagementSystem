/**
 * Assembly Routes
 * Defines assembly endpoints and their middleware chains
 *
 * @module modules/assemblies/assemblyRoutes
 */

const express = require('express');
const router = express.Router();

const assemblyController = require('./assemblyController');
const { createAssemblySchema, updateAssemblySchema } = require('./assemblyValidation');
const { validate } = require('../../middlewares/validationMiddleware');
const authMiddleware = require('../../middlewares/authMiddleware');
const { requireRole } = require('../../middlewares/roleMiddleware');
const { USER_ROLES } = require('../../constants/roles');

// ============================================================================
// Assembly CRUD Routes
// ============================================================================

/**
 * GET /api/assemblies
 * Get all assemblies with optional filtering and pagination
 * Protected: Requires authentication
 * Accessible by: All authenticated users
 */
router.get(
    '/',
    authMiddleware,
    assemblyController.getAllAssemblies
);

/**
 * GET /api/assemblies/active
 * Get currently active assembly
 * Protected: Requires authentication
 * Accessible by: All authenticated users
 *
 * IMPORTANT: This route must be before /:id to avoid conflicts
 */
router.get(
    '/active',
    authMiddleware,
    assemblyController.getActiveAssembly
);

/**
 * GET /api/assemblies/:id
 * Get assembly by ID
 * Protected: Requires authentication
 * Accessible by: All authenticated users
 */
router.get(
    '/:id',
    authMiddleware,
    assemblyController.getAssemblyById
);

/**
 * POST /api/assemblies
 * Create new assembly
 * Protected: Requires authentication
 * Accessible by: Administrator only
 */
router.post(
    '/',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR]),
    validate(createAssemblySchema),
    assemblyController.createAssembly
);

/**
 * PUT /api/assemblies/:id
 * Update assembly
 * Protected: Requires authentication
 * Accessible by: Administrator only
 */
router.put(
    '/:id',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR]),
    validate(updateAssemblySchema),
    assemblyController.updateAssembly
);

/**
 * DELETE /api/assemblies/:id
 * Delete assembly
 * Protected: Requires authentication
 * Accessible by: Administrator only
 * Note: Cannot delete active assembly
 */
router.delete(
    '/:id',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR]),
    assemblyController.deleteAssembly
);

// ============================================================================
// Assembly Activation Routes
// ============================================================================

/**
 * POST /api/assemblies/:id/activate
 * Activate assembly (deactivates all others automatically)
 * Protected: Requires authentication
 * Accessible by: Administrator only
 *
 * IMPORTANT: Only ONE assembly can be active at a time
 * This will automatically deactivate all other assemblies
 */
router.post(
    '/:id/activate',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR]),
    assemblyController.activateAssembly
);

/**
 * POST /api/assemblies/:id/deactivate
 * Deactivate assembly
 * Protected: Requires authentication
 * Accessible by: Administrator only
 */
router.post(
    '/:id/deactivate',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR]),
    assemblyController.deactivateAssembly
);

module.exports = router;
