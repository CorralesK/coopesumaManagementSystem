/**
 * Contributions Routes
 * Define routes for contributions operations
 *
 * @module modules/contributions/contributionsRoutes
 */

const express = require('express');
const router = express.Router();
const contributionsController = require('./contributionsController');
const authenticate = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/permissionMiddleware');
const { checkMemberOwnership } = require('../../middlewares/ownershipMiddleware');

/**
 * @route GET /api/contributions/periods
 * @desc Get contribution periods for a fiscal year
 * @access Private - Manager/Administrator only
 */
router.get(
    '/periods',
    authenticate,
    checkPermission('manage_contributions'),
    contributionsController.getContributionPeriods
);

/**
 * @route POST /api/contributions/periods
 * @desc Create contribution periods for a fiscal year
 * @access Private - Administrator only
 */
router.post(
    '/periods',
    authenticate,
    checkPermission('manage_contributions'),
    contributionsController.createContributionPeriods
);

/**
 * @route POST /api/contributions/register
 * @desc Register a contribution payment
 * @access Private - Manager/Administrator only
 */
router.post(
    '/register',
    authenticate,
    checkPermission('manage_contributions'),
    contributionsController.registerContribution
);

/**
 * @route GET /api/contributions/report
 * @desc Get contributions report for all members
 * @access Private - Manager/Administrator only
 */
router.get(
    '/report',
    authenticate,
    checkPermission('manage_contributions'),
    contributionsController.getContributionsReport
);

/**
 * @route GET /api/contributions/:memberId
 * @desc Get contribution status for a specific member
 * @access Private - Member can view own data, Manager/Administrator can view all
 */
router.get(
    '/:memberId',
    authenticate,
    checkMemberOwnership,
    contributionsController.getMemberContributions
);

module.exports = router;