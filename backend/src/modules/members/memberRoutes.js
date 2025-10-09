/**
 * Member Routes
 * Defines member endpoints and their middleware chains
 *
 * @module modules/members/memberRoutes
 */

const express = require('express');
const router = express.Router();

const memberController = require('./memberController');
const { createMemberSchema, updateMemberSchema, batchQrSchema, verifyQrSchema } = require('./memberValidation');
const { validate } = require('../../middlewares/validationMiddleware');
const authMiddleware = require('../../middlewares/authMiddleware');
const { requireRole } = require('../../middlewares/roleMiddleware');
const { USER_ROLES } = require('../../constants/roles');

// ============================================================================
// Member CRUD Routes
// ============================================================================

/**
 * GET /api/members
 * Get all members with optional filtering and pagination
 * Protected: Requires authentication
 * Accessible by: All authenticated users
 */
router.get(
    '/',
    authMiddleware,
    memberController.getAllMembers
);

/**
 * GET /api/members/:id
 * Get member by ID
 * Protected: Requires authentication
 * Accessible by: All authenticated users
 */
router.get(
    '/:id',
    authMiddleware,
    memberController.getMemberById
);

/**
 * POST /api/members
 * Create new member
 * Protected: Requires authentication
 * Accessible by: Administrator only
 */
router.post(
    '/',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR]),
    validate(createMemberSchema),
    memberController.createMember
);

/**
 * PUT /api/members/:id
 * Update member
 * Protected: Requires authentication
 * Accessible by: Administrator only
 */
router.put(
    '/:id',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR]),
    validate(updateMemberSchema),
    memberController.updateMember
);

/**
 * DELETE /api/members/:id
 * Delete member (soft delete)
 * Protected: Requires authentication
 * Accessible by: Administrator only
 */
router.delete(
    '/:id',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR]),
    memberController.deleteMember
);

// ============================================================================
// QR Code Routes
// ============================================================================

/**
 * GET /api/members/:id/qr
 * Generate QR code for member
 * Protected: Requires authentication
 * Accessible by: All authenticated users
 */
router.get(
    '/:id/qr',
    authMiddleware,
    memberController.generateQrCode
);

/**
 * POST /api/members/:id/qr/regenerate
 * Regenerate QR code for member
 * Protected: Requires authentication
 * Accessible by: Administrator only
 */
router.post(
    '/:id/qr/regenerate',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR]),
    memberController.regenerateQrCode
);

/**
 * POST /api/members/qr/batch
 * Generate QR codes for multiple members (batch)
 * Protected: Requires authentication
 * Accessible by: Administrator only
 */
router.post(
    '/qr/batch',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR]),
    validate(batchQrSchema),
    memberController.generateBatchQrCodes
);

/**
 * POST /api/members/qr/verify
 * Verify member by QR hash
 * Used during attendance scanning
 * Protected: Requires authentication
 * Accessible by: Administrator, Registrar
 */
router.post(
    '/qr/verify',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR, USER_ROLES.REGISTRAR]),
    validate(verifyQrSchema),
    memberController.verifyMemberByQr
);

module.exports = router;
