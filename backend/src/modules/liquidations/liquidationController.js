/**
 * Liquidation Controller
 * Handle HTTP requests for liquidation operations
 */

const liquidationService = require('./liquidationService');
const logger = require('../../utils/logger');

/**
 * Get members pending liquidation
 * GET /api/liquidations/pending
 */
const getPendingLiquidations = async (req, res, next) => {
    try {
        const cooperativeId = req.user.cooperativeId || 1;

        const members = await liquidationService.getMembersPendingLiquidation(cooperativeId);

        res.status(200).json({
            success: true,
            message: 'Members pending liquidation retrieved successfully',
            data: {
                count: members.length,
                members
            }
        });
    } catch (error) {
        logger.error('Controller error - getPendingLiquidations:', error);
        next(error);
    }
};

/**
 * Get liquidation preview for a member
 * GET /api/liquidations/preview/:memberId
 */
const getLiquidationPreview = async (req, res, next) => {
    try {
        const { memberId } = req.params;

        const preview = await liquidationService.getLiquidationPreview(parseInt(memberId));

        res.status(200).json({
            success: true,
            message: 'Liquidation preview retrieved successfully',
            data: preview
        });
    } catch (error) {
        logger.error('Controller error - getLiquidationPreview:', error);
        next(error);
    }
};

/**
 * Execute liquidation
 * POST /api/liquidations/execute
 * Body: { memberIds: [1,2,3], liquidationType: 'periodic'|'exit', memberContinues: true|false, notes? }
 */
const executeLiquidation = async (req, res, next) => {
    try {
        const { memberIds, liquidationType, memberContinues, notes } = req.body;

        // Validation
        if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one member ID must be provided',
                error: 'VALIDATION_ERROR'
            });
        }

        if (!liquidationType || !['periodic', 'exit'].includes(liquidationType)) {
            return res.status(400).json({
                success: false,
                message: 'Liquidation type must be "periodic" or "exit"',
                error: 'VALIDATION_ERROR'
            });
        }

        if (typeof memberContinues !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'Must specify if member continues in cooperative',
                error: 'VALIDATION_ERROR'
            });
        }

        const liquidationData = {
            memberIds: memberIds.map(id => parseInt(id)),
            liquidationType,
            memberContinues,
            notes,
            processedBy: req.user.userId
        };

        const results = await liquidationService.executeLiquidation(liquidationData);

        res.status(201).json({
            success: true,
            message: `${results.length} liquidation(s) executed successfully`,
            data: results
        });
    } catch (error) {
        logger.error('Controller error - executeLiquidation:', error);
        next(error);
    }
};

/**
 * Get liquidation by ID
 * GET /api/liquidations/:liquidationId
 */
const getLiquidationById = async (req, res, next) => {
    try {
        const { liquidationId } = req.params;

        const liquidation = await liquidationService.getLiquidationById(parseInt(liquidationId));

        res.status(200).json({
            success: true,
            message: 'Liquidation retrieved successfully',
            data: liquidation
        });
    } catch (error) {
        logger.error('Controller error - getLiquidationById:', error);
        next(error);
    }
};

/**
 * Get liquidation history
 * GET /api/liquidations/history?memberId=1&liquidationType=periodic
 */
const getLiquidationHistory = async (req, res, next) => {
    try {
        const { memberId, liquidationType, startDate, endDate, limit } = req.query;
        const cooperativeId = req.user.cooperativeId || 1;

        if (startDate && isNaN(Date.parse(startDate))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid startDate format',
                error: 'VALIDATION_ERROR'
            });
        }

        if (endDate && isNaN(Date.parse(endDate))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid endDate format',
                error: 'VALIDATION_ERROR'
            });
        }

        if (memberId && (isNaN(parseInt(memberId)) || parseInt(memberId) <= 0)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid member ID',
                error: 'VALIDATION_ERROR'
            });
        }

        if (liquidationType && !['periodic', 'exit'].includes(liquidationType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid liquidation type. Must be "periodic" or "exit"',
                error: 'VALIDATION_ERROR'
            });
        }

        const filters = {
            cooperativeId,
            memberId: memberId ? parseInt(memberId) : undefined,
            liquidationType,
            startDate,
            endDate,
            limit: limit ? parseInt(limit) : 100
        };

        const liquidations = await liquidationService.getLiquidationHistory(filters);

        res.status(200).json({
            success: true,
            message: 'Liquidation history retrieved successfully',
            data: liquidations
        });
    } catch (error) {
        logger.error('Controller error - getLiquidationHistory:', error);
        next(error);
    }
};

module.exports = {
    getPendingLiquidations,
    getLiquidationPreview,
    executeLiquidation,
    getLiquidationById,
    getLiquidationHistory
};