/**
 * Receipt Controller
 * Handle HTTP requests for receipt operations
 */

const receiptService = require('./receiptService');
const logger = require('../../utils/logger');
const path = require('path');
const fs = require('fs');

/**
 * Get receipt by ID
 * GET /api/receipts/:receiptId
 */
const getReceiptById = async (req, res, next) => {
    try {
        const { receiptId } = req.params;

        const receipt = await receiptService.getReceiptById(parseInt(receiptId));

        res.status(200).json({
            success: true,
            message: 'Receipt retrieved successfully',
            data: receipt
        });
    } catch (error) {
        logger.error('Controller error - getReceiptById:', error);
        next(error);
    }
};

/**
 * Get receipts for a member
 * GET /api/receipts/member/:memberId
 */
const getMemberReceipts = async (req, res, next) => {
    try {
        const { memberId } = req.params;
        const { receiptType, limit } = req.query;

        const receipts = await receiptService.getMemberReceipts(parseInt(memberId), {
            receiptType,
            limit: limit ? parseInt(limit) : 50
        });

        res.status(200).json({
            success: true,
            message: 'Receipts retrieved successfully',
            data: receipts
        });
    } catch (error) {
        logger.error('Controller error - getMemberReceipts:', error);
        next(error);
    }
};

/**
 * Download receipt PDF
 * GET /api/receipts/:receiptId/download
 */
const downloadReceipt = async (req, res, next) => {
    try {
        const { receiptId } = req.params;

        const receipt = await receiptService.getReceiptById(parseInt(receiptId));

        if (!receipt.pdf_url) {
            return res.status(404).json({
                success: false,
                message: 'Receipt PDF not found',
                error: 'PDF_NOT_FOUND'
            });
        }

        const filename = path.basename(receipt.pdf_url);
        const receiptsDir = path.join(__dirname, '../../../receipts');
        const filepath = path.join(receiptsDir, filename);

        const normalizedPath = path.normalize(filepath);
        const normalizedDir = path.normalize(receiptsDir);

        if (!normalizedPath.startsWith(normalizedDir)) {
            logger.warn('Path traversal attempt detected', {
                receiptId,
                requestedPath: receipt.pdf_url,
                userId: req.user?.userId
            });

            return res.status(403).json({
                success: false,
                message: 'Invalid file path',
                error: 'FORBIDDEN'
            });
        }

        if (!fs.existsSync(filepath)) {
            return res.status(404).json({
                success: false,
                message: 'PDF file not found on server',
                error: 'FILE_NOT_FOUND'
            });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="receipt-${receipt.receipt_number}.pdf"`);

        const fileStream = fs.createReadStream(filepath);
        fileStream.pipe(res);

    } catch (error) {
        logger.error('Controller error - downloadReceipt:', error);
        next(error);
    }
};

/**
 * Generate receipt for transaction
 * POST /api/receipts/generate-transaction
 * Body: { transactionId, previousBalance?, tractInfo?, ... }
 */
const generateTransactionReceipt = async (req, res, next) => {
    try {
        const transactionData = req.body;

        if (!transactionData.transactionId) {
            return res.status(400).json({
                success: false,
                message: 'Transaction ID is required',
                error: 'VALIDATION_ERROR'
            });
        }

        const receipt = await receiptService.generateReceiptForTransaction(transactionData);

        res.status(201).json({
            success: true,
            message: 'Receipt generated successfully',
            data: receipt
        });
    } catch (error) {
        logger.error('Controller error - generateTransactionReceipt:', error);
        next(error);
    }
};

/**
 * Generate receipt for liquidation
 * POST /api/receipts/generate-liquidation
 * Body: { liquidationId }
 */
const generateLiquidationReceipt = async (req, res, next) => {
    try {
        const { liquidationId } = req.body;

        if (!liquidationId) {
            return res.status(400).json({
                success: false,
                message: 'Liquidation ID is required',
                error: 'VALIDATION_ERROR'
            });
        }

        const receipt = await receiptService.generateReceiptForLiquidation({ liquidationId });

        res.status(201).json({
            success: true,
            message: 'Liquidation receipt generated successfully',
            data: receipt
        });
    } catch (error) {
        logger.error('Controller error - generateLiquidationReceipt:', error);
        next(error);
    }
};

module.exports = {
    getReceiptById,
    getMemberReceipts,
    downloadReceipt,
    generateTransactionReceipt,
    generateLiquidationReceipt
};