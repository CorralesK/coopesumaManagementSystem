/**
 * Savings Routes
 * Define routes for savings operations
 *
 * @module modules/savings/savingsRoutes
 */

const express = require('express');
const router = express.Router();
const savingsController = require('./savingsController');
const authenticate = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/permissionMiddleware');
const { checkMemberOwnership } = require('../../middlewares/ownershipMiddleware');

/**
 * @route POST /api/savings/deposits
 * @desc Register a savings deposit
 * @access Private - Manager/Administrator only
 */
router.post(
    '/deposits',
    authenticate,
    checkPermission('manage_savings'),
    savingsController.registerDeposit
);

/**
 * @route POST /api/savings/withdrawals
 * @desc Register a savings withdrawal
 * @access Private - Manager/Administrator only
 */
router.post(
    '/withdrawals',
    authenticate,
    checkPermission('manage_savings'),
    savingsController.registerWithdrawal
);

/**
 * @route GET /api/savings/inventory/:fiscalYear
 * @desc Get savings inventory for a fiscal year (Excel-like view)
 * @access Private - Manager/Administrator only
 */
router.get(
    '/inventory/:fiscalYear',
    authenticate,
    checkPermission('manage_savings'),
    savingsController.getSavingsInventoryByYear
);

/**
 * @route GET /api/savings/inventory/:fiscalYear/:month
 * @desc Get savings inventory for a specific month
 * @access Private - Manager/Administrator only
 */
router.get(
    '/inventory/:fiscalYear/:month',
    authenticate,
    checkPermission('manage_savings'),
    savingsController.getSavingsInventoryByMonth
);

/**
 * @route GET /api/savings/summary
 * @desc Get savings summary for all members
 * @access Private - Manager/Administrator only
 */
router.get(
    '/summary',
    authenticate,
    checkPermission('manage_savings'),
    savingsController.getSavingsSummary
);

/**
 * @route GET /api/savings/:memberId
 * @desc Get savings account for a specific member
 * @access Private - Member can view own data, Manager/Administrator can view all
 */
router.get(
    '/:memberId',
    authenticate,
    checkMemberOwnership,
    savingsController.getMemberSavings
);

/**
 * @route GET /api/savings/:memberId/ledger
 * @desc Get savings ledger (all transactions) for a member
 * @access Private - Member can view own data, Manager/Administrator can view all
 */
router.get(
    '/:memberId/ledger',
    authenticate,
    checkMemberOwnership,
    savingsController.getSavingsLedger
);

/**
 * @route GET /api/savings/:memberId/transactions
 * @desc Get all savings transactions (deposits and withdrawals) for a member
 * @access Private - Member can view own data, Manager/Administrator can view all
 */
router.get(
    '/:memberId/transactions',
    authenticate,
    checkMemberOwnership,
    savingsController.getMemberSavingsTransactions
);

/**
 * @route POST /api/savings/receipt/pdf
 * @desc Download savings receipt as PDF (for mobile)
 * @access Private - Manager/Administrator only
 */
router.post(
    '/receipt/pdf',
    authenticate,
    checkPermission('manage_savings'),
    savingsController.downloadReceiptPDF
);

module.exports = router;