/**
 * Attendance Routes
 * Defines attendance endpoints and their middleware chains
 *
 * @module modules/attendance/attendanceRoutes
 */

const express = require('express');
const router = express.Router();

const attendanceController = require('./attendanceController');
const {
    registerByQrSchema,
    registerManuallySchema,
    attendanceFiltersSchema
} = require('./attendanceValidation');
const { validate, validateQuery } = require('../../middlewares/validationMiddleware');
const authMiddleware = require('../../middlewares/authMiddleware');
const { requireRole } = require('../../middlewares/roleMiddleware');
const { USER_ROLES } = require('../../constants/roles');

// ============================================================================
// Attendance Registration Routes
// ============================================================================

/**
 * POST /api/attendance/scan
 * Register attendance by QR code scan
 * Protected: Requires authentication
 * Accessible by: Administrator, Registrar
 *
 * Request body:
 * {
 *   "qrHash": "string" (required)
 * }
 *
 * Response: Attendance record with member and assembly info
 */
router.post(
    '/scan',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR, USER_ROLES.REGISTRAR]),
    validate(registerByQrSchema),
    attendanceController.registerByQr
);

/**
 * POST /api/attendance/manual
 * Register attendance manually with visual verification
 * Protected: Requires authentication
 * Accessible by: Administrator, Registrar
 *
 * Request body:
 * {
 *   "memberId": number (required),
 *   "notes": "string" (optional)
 * }
 *
 * Response: Attendance record with member and assembly info
 */
router.post(
    '/manual',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR, USER_ROLES.REGISTRAR]),
    validate(registerManuallySchema),
    attendanceController.registerManually
);

// ============================================================================
// Attendance Query Routes
// ============================================================================

/**
 * GET /api/attendance
 * Get all attendance records with optional filtering and pagination
 * Protected: Requires authentication
 * Accessible by: Administrator only
 *
 * Query parameters:
 * - assemblyId: number (optional)
 * - memberId: number (optional)
 * - registrationMethod: "qr_scan" | "manual" (optional)
 * - registeredBy: number (optional)
 * - fromDate: ISO date string (optional)
 * - toDate: ISO date string (optional)
 * - grade: string (optional)
 * - section: string (optional)
 * - page: number (optional, default: 1)
 * - limit: number (optional, default: 50, max: 100)
 *
 * Response: Paginated list of attendance records
 */
router.get(
    '/',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR]),
    validateQuery(attendanceFiltersSchema),
    attendanceController.getAllAttendance
);

/**
 * GET /api/attendance/assembly/:assemblyId
 * Get attendance records for a specific assembly
 * Protected: Requires authentication
 * Accessible by: All authenticated users
 *
 * Response: List of attendance records for the assembly
 *
 * IMPORTANT: This route must be before /:id to avoid route conflicts
 */
router.get(
    '/assembly/:assemblyId',
    authMiddleware,
    attendanceController.getAssemblyAttendance
);

/**
 * GET /api/attendance/assembly/:assemblyId/stats
 * Get attendance statistics for a specific assembly
 * Protected: Requires authentication
 * Accessible by: All authenticated users
 *
 * Response: Statistics including total, by method, by grade
 *
 * IMPORTANT: This route must be before /:id to avoid route conflicts
 */
router.get(
    '/assembly/:assemblyId/stats',
    authMiddleware,
    attendanceController.getAssemblyStats
);

/**
 * GET /api/attendance/member/:memberId/history
 * Get attendance history for a specific member
 * Protected: Requires authentication
 * Accessible by: All authenticated users
 *
 * Query parameters:
 * - limit: number (optional, default: 10)
 *
 * Response: List of recent attendance records for member
 *
 * IMPORTANT: This route must be before /:id to avoid route conflicts
 */
router.get(
    '/member/:memberId/history',
    authMiddleware,
    attendanceController.getMemberHistory
);

/**
 * GET /api/attendance/:id
 * Get attendance record by ID
 * Protected: Requires authentication
 * Accessible by: Administrator only
 *
 * Response: Single attendance record with full details
 */
router.get(
    '/:id',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR]),
    attendanceController.getAttendanceById
);

/**
 * DELETE /api/attendance/:id
 * Delete attendance record (for correction of mistakes)
 * Protected: Requires authentication
 * Accessible by: Administrator only
 *
 * Response: Success message
 */
router.delete(
    '/:id',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR]),
    attendanceController.deleteAttendance
);

module.exports = router;
