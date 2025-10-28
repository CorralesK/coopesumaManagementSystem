/**
 * Cooperative Repository
 * Database layer for cooperative operations
 *
 * @module modules/cooperatives/cooperativeRepository
 */

const db = require('../../config/database');
const logger = require('../../utils/logger');

/**
 * Find cooperative by ID
 *
 * @param {number} cooperativeId - Cooperative ID
 * @returns {Promise<Object|null>} Cooperative object or null
 */
const findById = async (cooperativeId) => {
    try {
        const query = `
            SELECT
                c.cooperative_id,
                c.school_id,
                c.trade_name,
                c.legal_name,
                c.created_at,
                c.updated_at,
                s.name as school_name
            FROM cooperatives c
            INNER JOIN schools s ON c.school_id = s.school_id
            WHERE c.cooperative_id = $1
        `;

        const result = await db.query(query, [cooperativeId]);
        return result.rows[0] || null;
    } catch (error) {
        logger.error('Error finding cooperative by ID:', error);
        throw error;
    }
};

/**
 * Find all cooperatives
 *
 * @returns {Promise<Array>} Array of cooperative objects
 */
const findAll = async () => {
    try {
        const query = `
            SELECT
                c.cooperative_id,
                c.school_id,
                c.trade_name,
                c.legal_name,
                c.created_at,
                c.updated_at,
                s.name as school_name
            FROM cooperatives c
            INNER JOIN schools s ON c.school_id = s.school_id
            ORDER BY c.trade_name
        `;

        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        logger.error('Error finding all cooperatives:', error);
        throw error;
    }
};

/**
 * Find cooperatives by school ID
 *
 * @param {number} schoolId - School ID
 * @returns {Promise<Array>} Array of cooperative objects
 */
const findBySchoolId = async (schoolId) => {
    try {
        const query = `
            SELECT
                c.cooperative_id,
                c.school_id,
                c.trade_name,
                c.legal_name,
                c.created_at,
                c.updated_at,
                s.name as school_name
            FROM cooperatives c
            INNER JOIN schools s ON c.school_id = s.school_id
            WHERE c.school_id = $1
            ORDER BY c.trade_name
        `;

        const result = await db.query(query, [schoolId]);
        return result.rows;
    } catch (error) {
        logger.error('Error finding cooperatives by school ID:', error);
        throw error;
    }
};

module.exports = {
    findById,
    findAll,
    findBySchoolId
};
