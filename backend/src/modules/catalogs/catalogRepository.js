/**
 * Catalog Repository
 * Database layer for catalog operations (qualities, levels, account types, etc.)
 *
 * @module modules/catalogs/catalogRepository
 */

const db = require('../../config/database');
const logger = require('../../utils/logger');

/**
 * Get all member qualities
 *
 * @returns {Promise<Array>} Array of quality objects
 */
const getAllQualities = async () => {
    try {
        const query = `
            SELECT
                quality_id,
                quality_code,
                quality_name,
                description
            FROM member_qualities
            ORDER BY quality_id
        `;

        const result = await db.query(query);

        return result.rows;
    } catch (error) {
        logger.error('Error getting all qualities:', error);
        throw error;
    }
};

/**
 * Get quality by ID
 *
 * @param {number} qualityId - Quality ID
 * @returns {Promise<Object|null>} Quality object or null
 */
const getQualityById = async (qualityId) => {
    try {
        const query = `
            SELECT
                quality_id,
                quality_code,
                quality_name,
                description
            FROM member_qualities
            WHERE quality_id = $1
        `;

        const result = await db.query(query, [qualityId]);
        const row = result.rows[0];
        if (!row) return null;

        return {
            qualityId: row.quality_id,
            qualityCode: row.quality_code,
            qualityName: row.quality_name,
            description: row.description
        };
    } catch (error) {
        logger.error('Error getting quality by ID:', error);
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
        let query = `
            SELECT
                level_id,
                level_code,
                level_name,
                applies_to_quality_code
            FROM member_levels
        `;

        const params = [];

        if (qualityCode) {
            query += ' WHERE applies_to_quality_code = $1';
            params.push(qualityCode);
        }

        query += ' ORDER BY display_order, level_id';

        const result = await db.query(query, params);

        return result.rows;
    } catch (error) {
        logger.error('Error getting all levels:', error);
        throw error;
    }
};

/**
 * Get level by ID
 *
 * @param {number} levelId - Level ID
 * @returns {Promise<Object|null>} Level object or null
 */
const getLevelById = async (levelId) => {
    try {
        const query = `
            SELECT
                level_id,
                level_code,
                level_name,
                applies_to_quality_code
            FROM member_levels
            WHERE level_id = $1
        `;

        const result = await db.query(query, [levelId]);
        const row = result.rows[0];
        if (!row) return null;

        return {
            levelId: row.level_id,
            levelCode: row.level_code,
            levelName: row.level_name,
            appliesToQualityCode: row.applies_to_quality_code
        };
    } catch (error) {
        logger.error('Error getting level by ID:', error);
        throw error;
    }
};

/**
 * Get account types
 *
 * @returns {Promise<Array>} Array of account type objects
 */
const getAllAccountTypes = async () => {
    try {
        const query = `
            SELECT
                account_type_code,
                display_name,
                description,
                is_visible_to_member,
                display_order
            FROM account_types
            ORDER BY display_order
        `;

        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        logger.error('Error getting all account types:', error);
        throw error;
    }
};

module.exports = {
    getAllQualities,
    getQualityById,
    getAllLevels,
    getLevelById,
    getAllAccountTypes
};