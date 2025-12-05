/**
 * Surplus Controller
 * Handle HTTP requests for surplus distribution operations
 */

const surplusService = require('./surplusService');
const logger = require('../../utils/logger');

/**
 * Get distribution preview
 * GET /api/surplus/preview?fiscalYear=2024&totalAmount=50000
 */
const getDistributionPreview = async (req, res, next) => {
    try {
        const cooperativeId = req.user.cooperativeId || 1;
        const { fiscalYear, totalAmount } = req.query;

        if (!fiscalYear || !totalAmount) {
            return res.status(400).json({
                success: false,
                message: 'Año fiscal y monto total are required',
                error: 'VALIDATION_ERROR'
            });
        }

        const parsedAmount = parseFloat(totalAmount);

        if (parsedAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El monto debe ser mayor a cero',
                error: 'VALIDATION_ERROR'
            });
        }

        const preview = await surplusService.getDistributionPreview(
            cooperativeId,
            parseInt(fiscalYear),
            parsedAmount
        );

        res.status(200).json({
            success: true,
            message: 'Preview de distribución obtenido successfully',
            data: preview
        });
    } catch (error) {
        logger.error('Controller error - getDistributionPreview:', error);
        next(error);
    }
};

/**
 * Execute surplus distribution
 * POST /api/surplus/distribute
 * Body: { fiscalYear, totalDistributableAmount, notes? }
 */
const distributeSurplus = async (req, res, next) => {
    try {
        const cooperativeId = req.user.cooperativeId || 1;
        const { fiscalYear, totalDistributableAmount, notes } = req.body;

        if (!fiscalYear || !totalDistributableAmount) {
            return res.status(400).json({
                success: false,
                message: 'Año fiscal y monto total are required',
                error: 'VALIDATION_ERROR'
            });
        }

        if (totalDistributableAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El monto debe ser mayor a cero',
                error: 'VALIDATION_ERROR'
            });
        }

        const distributionData = {
            cooperativeId,
            fiscalYear: parseInt(fiscalYear),
            totalDistributableAmount: parseFloat(totalDistributableAmount),
            notes,
            createdBy: req.user.userId
        };

        const result = await surplusService.distributeSurplus(distributionData);

        res.status(201).json({
            success: true,
            message: `Excedentes distribuidos successfully a ${result.membersReceiving} miembros`,
            data: result
        });
    } catch (error) {
        logger.error('Controller error - distributeSurplus:', error);
        next(error);
    }
};

/**
 * Get distribution history
 * GET /api/surplus/history?fiscalYear=2024
 */
const getDistributionHistory = async (req, res, next) => {
    try {
        const cooperativeId = req.user.cooperativeId || 1;
        const { fiscalYear } = req.query;

        const filters = {
            fiscalYear: fiscalYear ? parseInt(fiscalYear) : undefined
        };

        const history = await surplusService.getDistributionHistory(cooperativeId, filters);

        res.status(200).json({
            success: true,
            message: 'Historial de distribuciones obtenido successfully',
            data: history
        });
    } catch (error) {
        logger.error('Controller error - getDistributionHistory:', error);
        next(error);
    }
};

module.exports = {
    getDistributionPreview,
    distributeSurplus,
    getDistributionHistory
};