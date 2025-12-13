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
const { handleUpload } = require('../../middlewares/uploadMiddleware');

// ============================================================================
// Member CRUD Routes
// ============================================================================

/**
 * GET /api/members/me/dashboard
 * Get dashboard data for the logged-in member
 * Protected: Requires authentication
 * Accessible by: Member role only
 */
router.get(
    '/me/dashboard',
    authMiddleware,
    requireRole([USER_ROLES.MEMBER]),  // Members with member role
    memberController.getMemberDashboard
);

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
 * POST /api/members/affiliate
 * Affiliate a new member (includes ₡500 affiliation fee + receipt)
 * This is the recommended way to create new members
 * Protected: Requires authentication
 * Accessible by: Administrator only
 * Supports multipart/form-data for photo upload
 */
router.post(
    '/affiliate',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR]),
    handleUpload,
    validate(createMemberSchema),
    memberController.affiliateMember
);

/**
 * POST /api/members
 * Create new member
 * Protected: Requires authentication
 * Accessible by: Administrator only
 * Supports multipart/form-data for photo upload
 */
router.post(
    '/',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR]),
    handleUpload,
    validate(createMemberSchema),
    memberController.createMember
);

/**
 * PUT /api/members/:id
 * Update member
 * Protected: Requires authentication
 * Accessible by: Administrator only
 * Supports multipart/form-data for photo upload
 */
router.put(
    '/:id',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR]),
    handleUpload,
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
 * Accessible by: Administrator only
 */
router.get(
    '/:id/qr',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR]),
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
 * POST /api/members/cards/pdf
 * Generate member cards PDF for batch printing
 * Protected: Requires authentication
 * Accessible by: Administrator only
 *
 * Body: { memberIds: number[] }
 * Response: PDF file download
 */
router.post(
    '/cards/pdf',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR]),
    validate(batchQrSchema),
    memberController.generateMemberCardsPDF
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

/**
 * POST /api/members/receipt/affiliation/pdf
 * Download affiliation receipt as PDF (for mobile)
 * Private: Requires authentication and permission
 */
router.post(
    '/receipt/affiliation/pdf',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR, USER_ROLES.REGISTRAR]),
    memberController.downloadAffiliationReceiptPDF
);

/**
 * POST /api/members/receipt/liquidation/pdf
 * Download liquidation receipt as PDF (for mobile)
 * Private: Requires authentication and permission
 */
router.post(
    '/receipt/liquidation/pdf',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR, USER_ROLES.REGISTRAR]),
    memberController.downloadLiquidationReceiptPDF
);

// ============================================================================
// Public Routes
// ============================================================================

/**
 * GET /api/members/verify
 * Public verification of member by QR hash
 * Used for public QR verification from scanned codes
 * Public: No authentication required
 */
router.get(
    '/verify',
    memberController.publicVerifyMember
);

module.exports = router;
