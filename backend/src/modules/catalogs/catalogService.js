/**
 * Catalog Service
 * Business logic for catalog operations
 *
 * @module modules/catalogs/catalogService
 */

const catalogRepository = require('./catalogRepository');
const logger = require('../../utils/logger');

/**
 * Get all member qualities
 *
 * @returns {Promise<Array>} Array of quality objects
 */
const getAllQualities = async () => {
    try {
        return await catalogRepository.getAllQualities();
    } catch (error) {
        logger.error('Error in getAllQualities service:', error);
        throw new Error('Failed to retrieve member qualities');
    }
};

/**
 * Get quality by ID
 *
 * @param {number} qualityId - Quality ID
 * @returns {Promise<Object>} Quality object
 */
const getQualityById = async (qualityId) => {
    try {
        const quality = await catalogRepository.getQualityById(qualityId);

        if (!quality) {
            throw new Error(`Quality with ID ${qualityId} not found`);
        }

        return quality;
    } catch (error) {
        logger.error('Error in getQualityById service:', error);
        throw error;
    }
};

/**
 * Get all member levels
 *
 * @param {string} qualityCode - Optional: Filter by quality code (student, employee)
 * @returns {Promise<Array>} Array of level objects
 */
const getAllLevels = async (qualityCode = null) => {
    try {
        return await catalogRepository.getAllLevels(qualityCode);
    } catch (error) {
        logger.error('Error in getAllLevels service:', error);
        throw new Error('Failed to retrieve member levels');
    }
};

/**
 * Get level by ID
 *
 * @param {number} levelId - Level ID
 * @returns {Promise<Object>} Level object
 */
const getLevelById = async (levelId) => {
    try {
        const level = await catalogRepository.getLevelById(levelId);

        if (!level) {
            throw new Error(`Level with ID ${levelId} not found`);
        }

        return level;
    } catch (error) {
        logger.error('Error in getLevelById service:', error);
        throw error;
    }
};

/**
 * Get all account types
 *
 * @returns {Promise<Array>} Array of account type objects
 */
const getAllAccountTypes = async () => {
    try {
        return await catalogRepository.getAllAccountTypes();
    } catch (error) {
        logger.error('Error in getAllAccountTypes service:', error);
        throw new Error('Failed to retrieve account types');
    }
};

/**
 * Validate quality and level combination
 *
 * @param {number} qualityId - Quality ID
 * @param {number} levelId - Level ID
 * @returns {Promise<boolean>} True if valid, throws error otherwise
 */
const validateQualityLevel = async (qualityId, levelId) => {
    try {
        const quality = await getQualityById(qualityId);
        const level = await getLevelById(levelId);

        // Check if level applies to quality
        if (level.applies_to_quality_code !== quality.quality_code) {
            throw new Error(
                `Level "${level.level_name}" does not apply to quality "${quality.quality_name}"`
            );
        }

        return true;
    } catch (error) {
        logger.error('Error in validateQualityLevel service:', error);
        throw error;
    }
};

module.exports = {
    getAllQualities,
    getQualityById,
    getAllLevels,
    getLevelById,
    getAllAccountTypes,
    validateQualityLevel
};