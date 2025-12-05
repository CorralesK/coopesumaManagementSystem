/**
 * Surplus Routes
 * Define routes for surplus distribution operations
 */

const express = require('express');
const router = express.Router();
const surplusController = require('./surplusController');
const authenticate = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/permissionMiddleware');

/**
 * @route GET /api/surplus/preview
 * @desc Get preview of surplus distribution
 * @query fiscalYear, totalAmount
 * @access Private - Manager/Administrator only
 */
router.get(
    '/preview',
    authenticate,
    checkPermission('manage_surplus'),
    surplusController.getDistributionPreview
);

/**
 * @route POST /api/surplus/distribute
 * @desc Execute surplus distribution
 * @body fiscalYear, totalDistributableAmount, notes
 * @access Private - Manager/Administrator only
 */
router.post(
    '/distribute',
    authenticate,
    checkPermission('manage_surplus'),
    surplusController.distributeSurplus
);

/**
 * @route GET /api/surplus/history
 * @desc Get distribution history
 * @query fiscalYear (optional)
 * @access Private - Manager/Administrator only
 */
router.get(
    '/history',
    authenticate,
    checkPermission('manage_surplus'),
    surplusController.getDistributionHistory
);

module.exports = router;