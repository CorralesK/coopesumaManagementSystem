/**
 * Cooperative Controller
 * Handles HTTP requests for cooperative operations
 *
 * @module modules/cooperatives/cooperativeController
 */

const cooperativeService = require('./cooperativeService');
const logger = require('../../utils/logger');

/**
 * Get cooperative by ID
 * GET /api/cooperatives/:id
 */
const getCooperativeById = async (req, res) => {
    try {
        const cooperativeId = parseInt(req.params.id, 10);

        if (isNaN(cooperativeId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid cooperative ID'
            });
        }

        const cooperative = await cooperativeService.getCooperativeById(cooperativeId);

        return res.status(200).json({
            success: true,
            data: cooperative
        });
    } catch (error) {
        logger.error('Error in getCooperativeById:', error);

        if (error.code === 'COOPERATIVE_NOT_FOUND') {
            return res.status(404).json({
                success: false,
                error: 'Cooperative not found'
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

/**
 * Get all cooperatives
 * GET /api/cooperatives
 */
const getAllCooperatives = async (req, res) => {
    try {
        const cooperatives = await cooperativeService.getAllCooperatives();

        return res.status(200).json({
            success: true,
            data: cooperatives,
            count: cooperatives.length
        });
    } catch (error) {
        logger.error('Error in getAllCooperatives:', error);

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

module.exports = {
    getCooperativeById,
    getAllCooperatives
};
