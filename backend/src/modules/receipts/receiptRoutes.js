/**
 * Receipt Routes
 * Define routes for receipt operations
 */

const express = require('express');
const router = express.Router();
const receiptController = require('./receiptController');
const authenticate = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/permissionMiddleware');
const { checkReceiptOwnership, checkMemberOwnership } = require('../../middlewares/ownershipMiddleware');

/**
 * @route GET /api/receipts/:receiptId
 * @desc Get receipt by ID
 * @access Private - Member can view own receipts, Manager/Administrator can view all
 */
router.get(
    '/:receiptId',
    authenticate,
    checkReceiptOwnership,
    receiptController.getReceiptById
);

/**
 * @route GET /api/receipts/member/:memberId
 * @desc Get all receipts for a member
 * @access Private - Member can view own receipts, Manager/Administrator can view all
 */
router.get(
    '/member/:memberId',
    authenticate,
    checkMemberOwnership,
    receiptController.getMemberReceipts
);

/**
 * @route GET /api/receipts/:receiptId/download
 * @desc Download receipt PDF
 * @access Private - Member can download own receipts, Manager/Administrator can download all
 */
router.get(
    '/:receiptId/download',
    authenticate,
    checkReceiptOwnership,
    receiptController.downloadReceipt
);

/**
 * @route POST /api/receipts/generate-transaction
 * @desc Generate receipt for a transaction
 * @access Private - Manager/Administrator only
 */
router.post(
    '/generate-transaction',
    authenticate,
    checkPermission('generate_receipts'),
    receiptController.generateTransactionReceipt
);

/**
 * @route POST /api/receipts/generate-liquidation
 * @desc Generate receipt for a liquidation
 * @access Private - Administrator only
 */
router.post(
    '/generate-liquidation',
    authenticate,
    checkPermission('execute_liquidations'),
    receiptController.generateLiquidationReceipt
);

module.exports = router;