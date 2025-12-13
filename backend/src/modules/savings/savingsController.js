/**
 * Savings Controller
 * Handle HTTP requests for savings operations
 *
 * @module modules/savings/savingsController
 */

const savingsService = require('./savingsService');
const logger = require('../../utils/logger');
const { getNow, toCostaRicaTime } = require('../../utils/dateUtils');
const { createSavingsReceiptPDF } = require('../../utils/pdfUtils');

/**
 * Get savings for a specific member
 * GET /api/savings/:memberId
 */
const getMemberSavings = async (req, res, next) => {
    try {
        const { memberId } = req.params;

        const data = await savingsService.getMemberSavings(parseInt(memberId));

        res.status(200).json({
            success: true,
            message: 'Savings data retrieved successfully',
            data
        });
    } catch (error) {
        logger.error('Controller error - getMemberSavings:', error);
        next(error);
    }
};

/**
 * Register a deposit
 * POST /api/savings/deposits
 * Body: { memberId, amount, transactionDate?, description? }
 */
const registerDeposit = async (req, res, next) => {
    try {
        const { memberId, amount, transactionDate, description } = req.body;

        // Validate required fields
        if (!memberId || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Member ID and amount are required',
                error: 'VALIDATION_ERROR'
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be greater than zero',
                error: 'VALIDATION_ERROR'
            });
        }

        const depositData = {
            memberId: parseInt(memberId),
            amount: parseFloat(amount),
            transactionDate: transactionDate ? toCostaRicaTime(transactionDate) : getNow(),
            description,
            createdBy: req.user.userId
        };

        const result = await savingsService.registerDeposit(depositData);

        res.status(201).json({
            success: true,
            message: 'Deposit registered successfully',
            data: result
        });
    } catch (error) {
        logger.error('Controller error - registerDeposit:', error);
        next(error);
    }
};

/**
 * Get savings ledger for a member
 * GET /api/savings/:memberId/ledger
 * Query params: fiscalYear?, startDate?, endDate?, limit?, offset?
 */
const getSavingsLedger = async (req, res, next) => {
    try {
        const { memberId } = req.params;
        const { fiscalYear, startDate, endDate, limit, offset } = req.query;

        const filters = {
            fiscalYear: fiscalYear ? parseInt(fiscalYear) : undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            limit: limit ? parseInt(limit) : 100,
            offset: offset ? parseInt(offset) : 0
        };

        const data = await savingsService.getSavingsLedger(parseInt(memberId), filters);

        res.status(200).json({
            success: true,
            message: 'Savings ledger retrieved successfully',
            data
        });
    } catch (error) {
        logger.error('Controller error - getSavingsLedger:', error);
        next(error);
    }
};

/**
 * Get savings summary for all members
 * GET /api/savings/summary
 */
const getSavingsSummary = async (req, res, next) => {
    try {
        const cooperativeId = req.user.cooperativeId || 1;

        const result = await savingsService.getAllMembersSavingsSummary(cooperativeId);

        logger.info('📊 Sending savings summary:', {
            membersCount: result.members.length,
            firstMember: result.members[0],
            summary: result.summary
        });

        res.status(200).json({
            success: true,
            message: 'Savings summary retrieved successfully',
            ...result
        });
    } catch (error) {
        logger.error('Controller error - getSavingsSummary:', error);
        next(error);
    }
};

/**
 * Get savings inventory by fiscal year
 * GET /api/savings/inventory/:fiscalYear
 */
const getSavingsInventoryByYear = async (req, res, next) => {
    try {
        const { fiscalYear } = req.params;
        const cooperativeId = req.user.cooperativeId || 1;

        const data = await savingsService.getSavingsInventoryByYear(
            cooperativeId,
            parseInt(fiscalYear)
        );

        res.status(200).json({
            success: true,
            message: 'Savings inventory retrieved successfully',
            data
        });
    } catch (error) {
        logger.error('Controller error - getSavingsInventoryByYear:', error);
        next(error);
    }
};

/**
 * Get savings inventory by month
 * GET /api/savings/inventory/:fiscalYear/:month
 */
const getSavingsInventoryByMonth = async (req, res, next) => {
    try {
        const { fiscalYear, month } = req.params;
        const cooperativeId = req.user.cooperativeId || 1;

        const data = await savingsService.getSavingsInventoryByMonth(
            cooperativeId,
            parseInt(fiscalYear),
            parseInt(month)
        );

        res.status(200).json({
            success: true,
            message: 'Monthly inventory retrieved successfully',
            data
        });
    } catch (error) {
        logger.error('Controller error - getSavingsInventoryByMonth:', error);
        next(error);
    }
};

/**
 * Register a withdrawal
 * POST /api/savings/withdrawals
 * Body: { memberId, amount, transactionDate?, description? }
 */
const registerWithdrawal = async (req, res, next) => {
    try {
        const { memberId, amount, transactionDate, description } = req.body;

        // Validate required fields
        if (!memberId || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Member ID and amount are required',
                error: 'VALIDATION_ERROR'
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be greater than zero',
                error: 'VALIDATION_ERROR'
            });
        }

        const withdrawalData = {
            memberId: parseInt(memberId),
            amount: parseFloat(amount),
            transactionDate: transactionDate ? toCostaRicaTime(transactionDate) : getNow(),
            description,
            createdBy: req.user.userId
        };

        const result = await savingsService.registerWithdrawal(withdrawalData);

        res.status(201).json({
            success: true,
            message: 'Withdrawal registered successfully',
            data: result
        });
    } catch (error) {
        logger.error('Controller error - registerWithdrawal:', error);
        next(error);
    }
};

/**
 * Get all savings transactions for a member
 * GET /api/savings/:memberId/transactions
 */
const getMemberSavingsTransactions = async (req, res, next) => {
    try {
        const { memberId } = req.params;

        const transactions = await savingsService.getMemberSavingsTransactions(parseInt(memberId));

        res.status(200).json({
            success: true,
            message: 'Savings transactions retrieved successfully',
            data: transactions
        });
    } catch (error) {
        logger.error('Controller error - getMemberSavingsTransactions:', error);
        next(error);
    }
};

/**
 * Download savings receipt as PDF
 * POST /api/savings/receipt/pdf
 */
const downloadReceiptPDF = async (req, res, next) => {
    try {
        const receiptData = req.body;

        // Log received data for debugging
        logger.info('Receipt PDF request received:', {
            transactionType: receiptData.transactionType,
            hasMember: !!receiptData.member,
            memberKeys: receiptData.member ? Object.keys(receiptData.member) : []
        });

        // Validate required fields
        if (!receiptData.transactionType || !receiptData.member) {
            logger.warn('Missing required receipt data');
            return res.status(400).json({
                success: false,
                message: 'Missing required receipt data'
            });
        }

        // Create PDF
        const pdfDoc = createSavingsReceiptPDF(receiptData);

        // Set headers for PDF download
        const filename = `recibo-${receiptData.transactionType}-${Date.now()}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Handle PDF stream errors
        pdfDoc.on('error', (err) => {
            logger.error('PDF generation error:', err);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: 'Error generating PDF'
                });
            }
        });

        // Pipe the PDF to response
        pdfDoc.pipe(res);
    } catch (error) {
        logger.error('Controller error - downloadReceiptPDF:', error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Error generating PDF: ' + error.message
            });
        }
    }
};

module.exports = {
    getMemberSavings,
    registerDeposit,
    registerWithdrawal,
    getSavingsLedger,
    getSavingsSummary,
    getSavingsInventoryByYear,
    getSavingsInventoryByMonth,
    getMemberSavingsTransactions,
    downloadReceiptPDF
};