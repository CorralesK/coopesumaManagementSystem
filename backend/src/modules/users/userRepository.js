/**
 * User Repository
 * Database layer for user operations
 *
 * @module modules/users/userRepository
 */

const db = require('../../config/database');
const logger = require('../../utils/logger');

/**
 * Find user by ID
 *
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
const findById = async (userId) => {
    try {
        const query = `
            SELECT
                user_id,
                full_name,
                role,
                is_active,
                microsoft_id,
                email,
                created_at,
                updated_at
            FROM users
            WHERE user_id = $1
        `;

        const result = await db.query(query, [userId]);
        return result.rows[0] || null;
    } catch (error) {
        logger.error('Error finding user by ID:', error);
        throw error;
    }
};

// NOTE: findByUsername was removed as traditional login is no longer supported
// Authentication is only available through Microsoft OAuth 2.0

/**
 * Find user by Microsoft ID (for OAuth login)
 *
 * @param {string} microsoftId - Microsoft user ID
 * @returns {Promise<Object|null>} User object or null
 */
const findByMicrosoftId = async (microsoftId) => {
    try {
        const query = `
            SELECT
                user_id,
                full_name,
                role,
                is_active,
                microsoft_id,
                email,
                created_at,
                updated_at
            FROM users
            WHERE microsoft_id = $1
        `;

        const result = await db.query(query, [microsoftId]);
        return result.rows[0] || null;
    } catch (error) {
        logger.error('Error finding user by Microsoft ID:', error);
        throw error;
    }
};

/**
 * Find user by email
 *
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User object or null
 */
const findByEmail = async (email) => {
    try {
        const query = `
            SELECT
                user_id,
                full_name,
                role,
                is_active,
                microsoft_id,
                email,
                created_at,
                updated_at
            FROM users
            WHERE email = $1
        `;

        const result = await db.query(query, [email]);
        return result.rows[0] || null;
    } catch (error) {
        logger.error('Error finding user by email:', error);
        throw error;
    }
};

/**
 * Create a new user
 *
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user object
 */
const create = async (userData) => {
    try {
        const query = `
            INSERT INTO users (
                full_name,
                role,
                is_active,
                microsoft_id,
                email
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING
                user_id,
                full_name,
                role,
                is_active,
                microsoft_id,
                email,
                created_at
        `;

        const values = [
            userData.fullName,
            userData.role,
            userData.isActive !== undefined ? userData.isActive : true,
            userData.microsoftId || null,
            userData.email || null
        ];

        const result = await db.query(query, values);
        return result.rows[0];
    } catch (error) {
        logger.error('Error creating user:', error);
        throw error;
    }
};

/**
 * Update user information
 *
 * @param {number} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated user object
 */
const update = async (userId, updates) => {
    try {
        const allowedFields = ['full_name', 'role', 'is_active', 'microsoft_id', 'email'];
        const fields = Object.keys(updates).filter(key => allowedFields.includes(key));

        if (fields.length === 0) {
            throw new Error('No valid fields to update');
        }

        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
        const values = [userId, ...fields.map(field => updates[field])];

        const query = `
            UPDATE users
            SET ${setClause}, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $1
            RETURNING
                user_id,
                full_name,
                role,
                is_active,
                microsoft_id,
                email,
                updated_at
        `;

        const result = await db.query(query, values);
        return result.rows[0];
    } catch (error) {
        logger.error('Error updating user:', error);
        throw error;
    }
};

/**
 * Link Microsoft account to existing user
 *
 * @param {number} userId - User ID
 * @param {string} microsoftId - Microsoft user ID
 * @param {string} email - User email
 * @returns {Promise<Object>} Updated user object
 */
const linkMicrosoftAccount = async (userId, microsoftId, email) => {
    try {
        const query = `
            UPDATE users
            SET
                microsoft_id = $2,
                email = $3,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $1
            RETURNING
                user_id,
                full_name,
                role,
                is_active,
                microsoft_id,
                email,
                updated_at
        `;

        const result = await db.query(query, [userId, microsoftId, email]);
        return result.rows[0];
    } catch (error) {
        logger.error('Error linking Microsoft account:', error);
        throw error;
    }
};

/**
 * Get all users with optional filters and pagination
 *
 * @param {Object} filters - Filter criteria
 * @param {number} limit - Number of items per page
 * @param {number} offset - Number of items to skip
 * @returns {Promise<Object>} Object with users array and total count
 */
const findAll = async (filters = {}, limit = 20, offset = 0) => {
    try {
        let baseQuery = `
            FROM users
            WHERE 1=1
        `;

        const params = [];
        let paramIndex = 1;

        if (filters.role) {
            baseQuery += ` AND role = $${paramIndex}`;
            params.push(filters.role);
            paramIndex++;
        }

        if (filters.isActive !== undefined) {
            baseQuery += ` AND is_active = $${paramIndex}`;
            params.push(filters.isActive);
            paramIndex++;
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
        const countResult = await db.query(countQuery, params);
        const total = parseInt(countResult.rows[0].total, 10);

        // Get paginated results
        const dataQuery = `
            SELECT
                user_id,
                full_name,
                role,
                is_active,
                microsoft_id,
                email,
                created_at,
                updated_at
            ${baseQuery}
            ORDER BY created_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        const dataResult = await db.query(dataQuery, [...params, limit, offset]);

        return {
            users: dataResult.rows,
            total
        };
    } catch (error) {
        logger.error('Error finding all users:', error);
        throw error;
    }
};

/**
 * Deactivate user (soft delete)
 *
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Updated user object
 */
const deactivate = async (userId) => {
    return update(userId, { is_active: false });
};

/**
 * Activate user
 *
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Updated user object
 */
const activate = async (userId) => {
    return update(userId, { is_active: true });
};

/**
 * Count active administrators
 *
 * @returns {Promise<number>} Count of active administrators
 */
const countActiveAdministrators = async () => {
    try {
        const query = `
            SELECT COUNT(*) as count
            FROM users
            WHERE role = 'administrator' AND is_active = true
        `;

        const result = await db.query(query);
        return parseInt(result.rows[0].count, 10);
    } catch (error) {
        logger.error('Error counting active administrators:', error);
        throw error;
    }
};

module.exports = {
    findById,
    findByMicrosoftId,
    findByEmail,
    create,
    update,
    linkMicrosoftAccount,
    findAll,
    deactivate,
    activate,
    countActiveAdministrators
};
