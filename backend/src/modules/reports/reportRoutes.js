/**
 * Report Routes
 * Defines report generation endpoints and their middleware chains
 *
 * @module modules/reports/reportRoutes
 */

const express = require('express');
const router = express.Router();

const reportController = require('./reportController');
const {
    assemblyIdParamSchema,
    attendanceReportQuerySchema
} = require('./reportValidation');
const { validateParams, validateQuery } = require('../../middlewares/validationMiddleware');
const authMiddleware = require('../../middlewares/authMiddleware');
const { requireRole } = require('../../middlewares/roleMiddleware');
const { USER_ROLES } = require('../../constants/roles');

// ============================================================================
// Attendance Report Routes
// ============================================================================

/**
 * GET /api/reports/attendance/:assemblyId
 * Generate and download attendance report PDF with signature spaces
 * Protected: Requires authentication
 * Accessible by: Administrator only
 *
 * Query parameters:
 * - includePhotos: "true" | "false" (optional, default: false)
 *
 * Response: PDF file download
 * Content-Type: application/pdf
 * Content-Disposition: attachment; filename="asistencia-asamblea-{id}.pdf"
 *
 * The PDF includes:
 * - Assembly information (title, date, time, location)
 * - Attendance statistics (total attendees, percentage)
 * - Attendee list with columns:
 *   - Number
 *   - Full name
 *   - Identification
 *   - Grade
 *   - Section
 *   - Signature space (blank box for physical signature)
 */
router.get(
    '/attendance/:assemblyId',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR]),
    validateParams(assemblyIdParamSchema),
    validateQuery(attendanceReportQuerySchema),
    reportController.generateAttendanceReport
);

/**
 * GET /api/reports/attendance-stats/:assemblyId
 * Generate and download attendance statistics report PDF
 * Protected: Requires authentication
 * Accessible by: Administrator only
 *
 * Response: PDF file download
 * Content-Type: application/pdf
 * Content-Disposition: attachment; filename="estadisticas-asamblea-{id}.pdf"
 *
 * The PDF includes:
 * - Assembly information
 * - Overall statistics (total members, attendees, percentage)
 * - Registration method breakdown (QR vs manual)
 * - Statistics by grade
 */
router.get(
    '/attendance-stats/:assemblyId',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR]),
    validateParams(assemblyIdParamSchema),
    reportController.generateAttendanceStatsReport
);

/**
 * GET /api/reports/stats/:assemblyId
 * Get attendance statistics as JSON
 * Protected: Requires authentication
 * Accessible by: Administrator, Registrar
 *
 * Response: JSON with statistics
 * {
 *   "assembly": { "assemblyId", "title", "scheduledDate" },
 *   "stats": {
 *     "totalMembers": number,
 *     "totalAttendees": number,
 *     "attendanceRate": number,
 *     "byGrade": { "grade": { "total", "attended", "rate" } },
 *     "byRegistrationMethod": { "qr_scan", "manual" }
 *   }
 * }
 */
router.get(
    '/stats/:assemblyId',
    authMiddleware,
    requireRole([USER_ROLES.ADMINISTRATOR, USER_ROLES.REGISTRAR]),
    validateParams(assemblyIdParamSchema),
    reportController.getAttendanceStats
);

module.exports = router;
