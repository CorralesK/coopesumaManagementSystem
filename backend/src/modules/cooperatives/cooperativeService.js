/**
 * Cooperative Service
 * Business logic for cooperative operations
 *
 * @module modules/cooperatives/cooperativeService
 */

const cooperativeRepository = require('./cooperativeRepository');
const logger = require('../../utils/logger');

/**
 * Get cooperative by ID
 *
 * @param {number} cooperativeId - Cooperative ID
 * @returns {Promise<Object>} Cooperative object
 * @throws {Error} If cooperative not found
 */
const getCooperativeById = async (cooperativeId) => {
    try {
        const cooperative = await cooperativeRepository.findById(cooperativeId);

        if (!cooperative) {
            const error = new Error('Cooperative not found');
            error.code = 'COOPERATIVE_NOT_FOUND';
            error.statusCode = 404;
            throw error;
        }

        return cooperative;
    } catch (error) {
        logger.error(`Error getting cooperative ${cooperativeId}:`, error);
        throw error;
    }
};

/**
 * Get all cooperatives
 *
 * @returns {Promise<Array>} Array of cooperative objects
 */
const getAllCooperatives = async () => {
    try {
        return await cooperativeRepository.findAll();
    } catch (error) {
        logger.error('Error getting all cooperatives:', error);
        throw error;
    }
};

/**
 * Get cooperatives by school ID
 *
 * @param {number} schoolId - School ID
 * @returns {Promise<Array>} Array of cooperative objects
 */
const getCooperativesBySchoolId = async (schoolId) => {
    try {
        return await cooperativeRepository.findBySchoolId(schoolId);
    } catch (error) {
        logger.error(`Error getting cooperatives for school ${schoolId}:`, error);
        throw error;
    }
};

module.exports = {
    getCooperativeById,
    getAllCooperatives,
    getCooperativesBySchoolId
};
