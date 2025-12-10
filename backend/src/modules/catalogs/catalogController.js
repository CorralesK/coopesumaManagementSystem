/**
 * Catalog Controller
 * Handle HTTP requests for catalog operations
 *
 * @module modules/catalogs/catalogController
 */

const catalogService = require('./catalogService');
const { successResponse, errorResponse } = require('../../utils/responseFormatter');
const logger = require('../../utils/logger');

/**
 * Get all member qualities
 *
 * @route GET /api/catalogs/qualities
 */
const getAllQualities = async (req, res) => {
    try {
        const qualities = await catalogService.getAllQualities();
        return successResponse(res, 'Member qualities retrieved successfully', qualities);
    } catch (error) {
        logger.error('Error in getAllQualities controller:', error);
        return errorResponse(res, 'Failed to retrieve member qualities', 'CATALOG_ERROR', 500);
    }
};

/**
 * Get quality by ID
 *
 * @route GET /api/catalogs/qualities/:id
 */
const getQualityById = async (req, res) => {
    try {
        const { id } = req.params;
        const quality = await catalogService.getQualityById(parseInt(id, 10));

        return successResponse(res, 'Quality retrieved successfully', quality);
    } catch (error) {
        logger.error('Error in getQualityById controller:', error);

        if (error.message.includes('not found')) {
            return errorResponse(res, error.message, 'NOT_FOUND', 404);
        }

        return errorResponse(res, 'Failed to retrieve quality', 'CATALOG_ERROR', 500);
    }
};

/**
 * Get all member levels
 *
 * @route GET /api/catalogs/levels
 * @query {string} qualityCode - Optional: Filter by quality code (student, employee)
 */
const getAllLevels = async (req, res) => {
    try {
        const { qualityCode } = req.query;
        const levels = await catalogService.getAllLevels(qualityCode);
        return successResponse(res, 'Member levels retrieved successfully', levels);
    } catch (error) {
        logger.error('Error in getAllLevels controller:', error);
        return errorResponse(res, 'Failed to retrieve member levels', 'CATALOG_ERROR', 500);
    }
};

/**
 * Get level by ID
 *
 * @route GET /api/catalogs/levels/:id
 */
const getLevelById = async (req, res) => {
    try {
        const { id } = req.params;
        const level = await catalogService.getLevelById(parseInt(id, 10));

        return successResponse(res, 'Level retrieved successfully', level);
    } catch (error) {
        logger.error('Error in getLevelById controller:', error);

        if (error.message.includes('not found')) {
            return errorResponse(res, error.message, 'NOT_FOUND', 404);
        }

        return errorResponse(res, 'Failed to retrieve level', 'CATALOG_ERROR', 500);
    }
};

/**
 * Get all account types
 *
 * @route GET /api/catalogs/account-types
 */
const getAllAccountTypes = async (req, res) => {
    try {
        const accountTypes = await catalogService.getAllAccountTypes();

        return successResponse(res, 'Account types retrieved successfully', accountTypes);
    } catch (error) {
        logger.error('Error in getAllAccountTypes controller:', error);
        return errorResponse(res, 'Failed to retrieve account types', 'CATALOG_ERROR', 500);
    }
};

module.exports = {
    getAllQualities,
    getQualityById,
    getAllLevels,
    getLevelById,
    getAllAccountTypes
};