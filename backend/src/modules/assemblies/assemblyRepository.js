/**
 * Assembly Repository
 * Database layer for assembly operations
 *
 * @module modules/assemblies/assemblyRepository
 */

const db = require('../../config/database');
const logger = require('../../utils/logger');

/**
 * Find assembly by ID
 *
 * @param {number} assemblyId - Assembly ID
 * @returns {Promise<Object|null>} Assembly object or null
 */
const findById = async (assemblyId) => {
    try {
        const query = `
            SELECT
                assembly_id,
                title,
                scheduled_date,
                start_time,
                end_time,
                is_active,
                concluded_at,
                created_by,
                created_at,
                updated_at
            FROM assemblies
            WHERE assembly_id = $1
        `;

        const result = await db.query(query, [assemblyId]);
        return result.rows[0] || null;
    } catch (error) {
        logger.error('Error finding assembly by ID:', error);
        throw error;
    }
};

/**
 * Find active assembly
 * Returns the currently active assembly (only one can be active)
 *
 * @returns {Promise<Object|null>} Active assembly object or null
 */
const findActive = async () => {
    try {
        const query = `
            SELECT
                assembly_id,
                title,
                scheduled_date,
                start_time,
                end_time,
                is_active,
                concluded_at,
                created_by,
                created_at,
                updated_at
            FROM assemblies
            WHERE is_active = true
            LIMIT 1
        `;

        const result = await db.query(query);
        return result.rows[0] || null;
    } catch (error) {
        logger.error('Error finding active assembly:', error);
        throw error;
    }
};

/**
 * Find all assemblies with optional filters
 *
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Array of assembly objects
 */
const findAll = async (filters = {}) => {
    try {
        let query = `
            SELECT
                a.assembly_id,
                a.title,
                a.scheduled_date,
                a.start_time,
                a.end_time,
                a.is_active,
                a.concluded_at,
                a.created_by,
                a.created_at,
                a.updated_at,
                COUNT(ar.attendance_id) as attendance_count
            FROM assemblies a
            LEFT JOIN attendance_records ar ON a.assembly_id = ar.assembly_id
            WHERE 1=1
        `;

        const params = [];
        let paramIndex = 1;

        if (filters.isActive !== undefined) {
            query += ` AND a.is_active = $${paramIndex}`;
            params.push(filters.isActive);
            paramIndex++;
        }

        if (filters.fromDate) {
            query += ` AND a.scheduled_date >= $${paramIndex}`;
            params.push(filters.fromDate);
            paramIndex++;
        }

        if (filters.toDate) {
            query += ` AND a.scheduled_date <= $${paramIndex}`;
            params.push(filters.toDate);
            paramIndex++;
        }

        if (filters.createdBy) {
            query += ` AND a.created_by = $${paramIndex}`;
            params.push(filters.createdBy);
            paramIndex++;
        }

        query += ` GROUP BY a.assembly_id
                   ORDER BY
                   CASE
                       WHEN a.is_active = true THEN 1
                       WHEN a.is_active = false AND a.concluded_at IS NULL THEN 2
                       ELSE 3
                   END,
                   a.title ASC`;

        // Pagination
        if (filters.limit) {
            query += ` LIMIT $${paramIndex}`;
            params.push(filters.limit);
            paramIndex++;
        }

        if (filters.offset) {
            query += ` OFFSET $${paramIndex}`;
            params.push(filters.offset);
        }

        const result = await db.query(query, params);
        return result.rows;
    } catch (error) {
        logger.error('Error finding all assemblies:', error);
        throw error;
    }
};

/**
 * Count assemblies with optional filters
 *
 * @param {Object} filters - Filter criteria
 * @returns {Promise<number>} Count of assemblies
 */
const count = async (filters = {}) => {
    try {
        let query = 'SELECT COUNT(*) as count FROM assemblies WHERE 1=1';

        const params = [];
        let paramIndex = 1;

        if (filters.isActive !== undefined) {
            query += ` AND is_active = $${paramIndex}`;
            params.push(filters.isActive);
            paramIndex++;
        }

        if (filters.fromDate) {
            query += ` AND scheduled_date >= $${paramIndex}`;
            params.push(filters.fromDate);
            paramIndex++;
        }

        if (filters.toDate) {
            query += ` AND scheduled_date <= $${paramIndex}`;
            params.push(filters.toDate);
            paramIndex++;
        }

        if (filters.createdBy) {
            query += ` AND created_by = $${paramIndex}`;
            params.push(filters.createdBy);
        }

        const result = await db.query(query, params);
        return parseInt(result.rows[0].count, 10);
    } catch (error) {
        logger.error('Error counting assemblies:', error);
        throw error;
    }
};

/**
 * Create a new assembly
 *
 * @param {Object} assemblyData - Assembly data
 * @returns {Promise<Object>} Created assembly object
 */
const create = async (assemblyData) => {
    try {
        const query = `
            INSERT INTO assemblies (
                title,
                scheduled_date,
                start_time,
                end_time,
                is_active,
                created_by,
                cooperative_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING
                assembly_id,
                title,
                scheduled_date,
                start_time,
                end_time,
                is_active,
                created_by,
                cooperative_id,
                created_at
        `;

        const values = [
            assemblyData.title,
            assemblyData.scheduledDate,
            assemblyData.startTime || null,
            assemblyData.endTime || null,
            assemblyData.isActive !== undefined ? assemblyData.isActive : false,
            assemblyData.createdBy,
            assemblyData.cooperativeId || 1 // Default to cooperative 1
        ];

        const result = await db.query(query, values);
        return result.rows[0];
    } catch (error) {
        logger.error('Error creating assembly:', error);
        throw error;
    }
};

/**
 * Update assembly information
 *
 * @param {number} assemblyId - Assembly ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated assembly object
 */
const update = async (assemblyId, updates) => {
    try {
        const allowedFields = [
            'title',
            'scheduled_date',
            'start_time',
            'end_time',
            'is_active',
            'concluded_at'
        ];
        const fields = Object.keys(updates).filter(key => allowedFields.includes(key));

        if (fields.length === 0) {
            throw new Error('No valid fields to update');
        }

        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
        const values = [assemblyId, ...fields.map(field => updates[field])];

        const query = `
            UPDATE assemblies
            SET ${setClause}, updated_at = CURRENT_TIMESTAMP
            WHERE assembly_id = $1
            RETURNING
                assembly_id,
                title,
                scheduled_date,
                start_time,
                end_time,
                is_active,
                concluded_at,
                created_by,
                updated_at
        `;

        const result = await db.query(query, values);
        return result.rows[0];
    } catch (error) {
        logger.error('Error updating assembly:', error);
        throw error;
    }
};

/**
 * Activate assembly (deactivates all others automatically via trigger)
 *
 * @param {number} assemblyId - Assembly ID
 * @returns {Promise<Object>} Activated assembly object
 */
const activate = async (assemblyId) => {
    try {
        // The database trigger will automatically deactivate other assemblies
        // Set start_time to current time in Costa Rica timezone when activating
        const query = `
            UPDATE assemblies
            SET is_active = true,
                start_time = (CURRENT_TIMESTAMP AT TIME ZONE 'America/Costa_Rica')::TIME,
                updated_at = CURRENT_TIMESTAMP
            WHERE assembly_id = $1
            RETURNING
                assembly_id,
                title,
                scheduled_date,
                start_time,
                end_time,
                is_active,
                concluded_at,
                created_by,
                updated_at
        `;

        const result = await db.query(query, [assemblyId]);
        return result.rows[0];
    } catch (error) {
        logger.error('Error activating assembly:', error);
        throw error;
    }
};

/**
 * Deactivate assembly
 *
 * @param {number} assemblyId - Assembly ID
 * @returns {Promise<Object>} Deactivated assembly object
 */
const deactivate = async (assemblyId) => {
    try {
        // Use PostgreSQL to get Costa Rica timezone (UTC-6)
        const query = `
            UPDATE assemblies
            SET is_active = false,
                concluded_at = (CURRENT_TIMESTAMP AT TIME ZONE 'America/Costa_Rica'),
                updated_at = CURRENT_TIMESTAMP
            WHERE assembly_id = $1
            RETURNING
                assembly_id,
                title,
                scheduled_date,
                start_time,
                end_time,
                is_active,
                concluded_at,
                created_by,
                updated_at
        `;

        const result = await db.query(query, [assemblyId]);
        return result.rows[0];
    } catch (error) {
        logger.error('Error deactivating assembly:', error);
        throw error;
    }
};

/**
 * Delete assembly (hard delete)
 *
 * @param {number} assemblyId - Assembly ID
 * @returns {Promise<boolean>} True if deleted
 */
const deleteAssembly = async (assemblyId) => {
    try {
        const query = 'DELETE FROM assemblies WHERE assembly_id = $1';
        await db.query(query, [assemblyId]);
        return true;
    } catch (error) {
        logger.error('Error deleting assembly:', error);
        throw error;
    }
};

/**
 * Get assembly with attendance count
 *
 * @param {number} assemblyId - Assembly ID
 * @returns {Promise<Object|null>} Assembly with attendance stats
 */
const findByIdWithStats = async (assemblyId) => {
    try {
        const query = `
            SELECT
                a.assembly_id,
                a.title,
                a.scheduled_date,
                a.start_time,
                a.end_time,
                a.is_active,
                a.concluded_at,
                a.created_by,
                a.created_at,
                a.updated_at,
                COUNT(ar.attendance_id) as attendance_count
            FROM assemblies a
            LEFT JOIN attendance_records ar ON a.assembly_id = ar.assembly_id
            WHERE a.assembly_id = $1
            GROUP BY a.assembly_id
        `;

        const result = await db.query(query, [assemblyId]);
        return result.rows[0] || null;
    } catch (error) {
        logger.error('Error finding assembly with stats:', error);
        throw error;
    }
};

/**
 * Get active assembly with attendance count
 *
 * @returns {Promise<Object|null>} Active assembly with attendance stats
 */
const findActiveWithStats = async () => {
    try {
        const query = `
            SELECT
                a.assembly_id,
                a.title,
                a.scheduled_date,
                a.start_time,
                a.end_time,
                a.is_active,
                a.concluded_at,
                a.created_by,
                a.created_at,
                a.updated_at,
                COUNT(ar.attendance_id) as attendance_count
            FROM assemblies a
            LEFT JOIN attendance_records ar ON a.assembly_id = ar.assembly_id
            WHERE a.is_active = true
            GROUP BY a.assembly_id
            LIMIT 1
        `;

        const result = await db.query(query);
        return result.rows[0] || null;
    } catch (error) {
        logger.error('Error finding active assembly with stats:', error);
        throw error;
    }
};

module.exports = {
    findById,
    findActive,
    findAll,
    count,
    create,
    update,
    activate,
    deactivate,
    deleteAssembly,
    findByIdWithStats,
    findActiveWithStats
};
