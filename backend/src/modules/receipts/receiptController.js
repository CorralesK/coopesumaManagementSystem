/**
 * Receipt Controller
 * Handle HTTP requests for receipt operations
 */

const receiptService = require('./receiptService');
const { generateReceiptPDF } = require('./receiptGenerator');
const logger = require('../../utils/logger');

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
 * Generates PDF dynamically in memory and streams it to the client
 */
const downloadReceipt = async (req, res, next) => {
    try {
        const { receiptId } = req.params;

        // Get receipt data from database
        const receipt = await receiptService.getReceiptById(parseInt(receiptId));

        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: 'Receipt not found',
                error: 'RECEIPT_NOT_FOUND'
            });
        }

        // Prepare data for PDF generation
        const pdfData = {
            receiptNumber: receipt.receipt_number,
            memberName: receipt.member_name || receipt.memberName || 'N/A',
            identification: receipt.identification || 'N/A',
            memberCode: receipt.member_code || receipt.memberCode || 'N/A',
            amount: parseFloat(receipt.amount) || 0,
            date: receipt.created_at || new Date(),
            fiscalYear: new Date(receipt.created_at || new Date()).getFullYear(),
            previousBalance: parseFloat(receipt.previous_balance) || 0,
            newBalance: parseFloat(receipt.new_balance) || 0,
            accountType: receipt.account_type || 'savings',
            reason: receipt.liquidation_type || 'exit',
            savingsAmount: parseFloat(receipt.savings_liquidated) || parseFloat(receipt.amount) || 0,
            totalAmount: parseFloat(receipt.total_liquidated) || parseFloat(receipt.amount) || 0,
            tractInfo: receipt.tract_info || '',
            surplusPrevBalance: parseFloat(receipt.surplus_prev_balance) || 0,
            surplusNewBalance: parseFloat(receipt.surplus_new_balance) || 0,
            savingsPrevBalance: parseFloat(receipt.savings_prev_balance) || 0,
            savingsNewBalance: parseFloat(receipt.savings_new_balance) || 0
        };

        // Generate PDF in memory
        const pdfDoc = generateReceiptPDF(receipt.receipt_type, pdfData);

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="receipt-${receipt.receipt_number}.pdf"`);

        // Pipe PDF to response
        pdfDoc.pipe(res);

        logger.info('Receipt PDF generated and sent', {
            receiptId: receipt.receipt_id,
            receiptNumber: receipt.receipt_number,
            receiptType: receipt.receipt_type
        });

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