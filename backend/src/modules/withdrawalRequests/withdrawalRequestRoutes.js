/**
 * Withdrawal Request Routes
 */

const express = require('express');
const router = express.Router();
const withdrawalRequestController = require('./withdrawalRequestController');
const authenticate = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/permissionMiddleware');
const { checkWithdrawalOwnership } = require('../../middlewares/ownershipMiddleware');

/**
 * @route POST /api/withdrawal-requests
 * @desc Create a withdrawal request
 * @access Private - Members can request for themselves
 */
router.post(
    '/',
    authenticate,
    withdrawalRequestController.createWithdrawalRequest
);

/**
 * @route GET /api/withdrawal-requests
 * @desc Get all withdrawal requests
 * @access Private - Manager/Administrator only
 */
router.get(
    '/',
    authenticate,
    checkPermission('approve_withdrawals'),
    withdrawalRequestController.getAllWithdrawalRequests
);

/**
 * @route GET /api/withdrawal-requests/:requestId
 * @desc Get withdrawal request by ID
 * @access Private - Member can view own requests, Manager/Administrator can view all
 */
router.get(
    '/:requestId',
    authenticate,
    checkWithdrawalOwnership,
    withdrawalRequestController.getWithdrawalRequestById
);

/**
 * @route PATCH /api/withdrawal-requests/:requestId/approve
 * @desc Approve withdrawal request
 * @access Private - Manager/Administrator only
 */
router.patch(
    '/:requestId/approve',
    authenticate,
    checkPermission('approve_withdrawals'),
    withdrawalRequestController.approveWithdrawalRequest
);

/**
 * @route PATCH /api/withdrawal-requests/:requestId/reject
 * @desc Reject withdrawal request
 * @access Private - Manager/Administrator only
 */
router.patch(
    '/:requestId/reject',
    authenticate,
    checkPermission('approve_withdrawals'),
    withdrawalRequestController.rejectWithdrawalRequest
);

module.exports = router;