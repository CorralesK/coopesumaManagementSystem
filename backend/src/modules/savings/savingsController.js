/**
 * Savings Controller
 * Handle HTTP requests for savings operations
 *
 * @module modules/savings/savingsController
 */

const savingsService = require('./savingsService');
const logger = require('../../utils/logger');

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
            message: 'Datos de ahorros obtenidos successfully',
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
                message: 'Member ID y monto are required',
                error: 'VALIDATION_ERROR'
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El monto debe ser mayor a cero',
                error: 'VALIDATION_ERROR'
            });
        }

        const depositData = {
            memberId: parseInt(memberId),
            amount: parseFloat(amount),
            transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
            description,
            createdBy: req.user.userId
        };

        const result = await savingsService.registerDeposit(depositData);

        res.status(201).json({
            success: true,
            message: 'Depósito registrado successfully',
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
            message: 'Libro de ahorros obtenido successfully',
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
            message: 'Resumen de ahorros obtenido successfully',
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
            message: 'Inventario de ahorros obtenido exitosamente',
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
            message: 'Inventario mensual obtenido exitosamente',
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
                message: 'Member ID y monto son requeridos',
                error: 'VALIDATION_ERROR'
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El monto debe ser mayor a cero',
                error: 'VALIDATION_ERROR'
            });
        }

        const withdrawalData = {
            memberId: parseInt(memberId),
            amount: parseFloat(amount),
            transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
            description,
            createdBy: req.user.userId
        };

        const result = await savingsService.registerWithdrawal(withdrawalData);

        res.status(201).json({
            success: true,
            message: 'Retiro registrado exitosamente',
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
            message: 'Transacciones de ahorros obtenidas exitosamente',
            data: transactions
        });
    } catch (error) {
        logger.error('Controller error - getMemberSavingsTransactions:', error);
        next(error);
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
    getMemberSavingsTransactions
};