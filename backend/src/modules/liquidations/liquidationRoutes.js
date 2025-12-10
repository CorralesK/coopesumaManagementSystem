/**
 * Liquidation Routes
 * Define routes for liquidation operations
 */

const express = require('express');
const router = express.Router();
const liquidationController = require('./liquidationController');
const authenticate = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/permissionMiddleware');

/**
 * @route GET /api/liquidations/pending
 * @desc Get members pending liquidation (6+ years)
 * @access Private - Administrator only
 */
router.get(
    '/pending',
    authenticate,
    checkPermission('execute_liquidations'),
    liquidationController.getPendingLiquidations
);

/**
 * @route GET /api/liquidations/preview/:memberId
 * @desc Get liquidation preview for a member
 * @access Private - Administrator only
 */
router.get(
    '/preview/:memberId',
    authenticate,
    checkPermission('execute_liquidations'),
    liquidationController.getLiquidationPreview
);

/**
 * @route POST /api/liquidations/execute
 * @desc Execute liquidation for one or multiple members
 * @access Private - Administrator only
 */
router.post(
    '/execute',
    authenticate,
    checkPermission('execute_liquidations'),
    liquidationController.executeLiquidation
);

/**
 * @route GET /api/liquidations/stats
 * @desc Get liquidation statistics for dashboard
 * @access Private - Administrator only
 */
router.get(
    '/stats',
    authenticate,
    checkPermission('execute_liquidations'),
    liquidationController.getLiquidationStats
);

/**
 * @route GET /api/liquidations/history
 * @desc Get liquidation history
 * @access Private - Administrator only
 */
router.get(
    '/history',
    authenticate,
    checkPermission('execute_liquidations'),
    liquidationController.getLiquidationHistory
);

/**
 * @route GET /api/liquidations/:liquidationId
 * @desc Get liquidation by ID
 * @access Private - Administrator only
 */
router.get(
    '/:liquidationId',
    authenticate,
    checkPermission('execute_liquidations'),
    liquidationController.getLiquidationById
);

module.exports = router;