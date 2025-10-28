/**
 * Member Repository
 * Database layer for member operations
 *
 * @module modules/members/memberRepository
 */

const db = require('../../config/database');
const logger = require('../../utils/logger');

/**
 * Find member by ID
 *
 * @param {number} memberId - Member ID
 * @returns {Promise<Object|null>} Member object or null
 */
const findById = async (memberId) => {
    try {
        const query = `
            SELECT
                member_id,
                full_name,
                identification,
                grade,
                institutional_email,
                photo_url,
                qr_hash,
                is_active,
                cooperative_id,
                created_at,
                updated_at
            FROM members
            WHERE member_id = $1
        `;

        const result = await db.query(query, [memberId]);
        return result.rows[0] || null;
    } catch (error) {
        logger.error('Error finding member by ID:', error);
        throw error;
    }
};

/**
 * Find member by identification number
 *
 * @param {string} identification - Member identification number
 * @returns {Promise<Object|null>} Member object or null
 */
const findByIdentification = async (identification) => {
    try {
        const query = `
            SELECT
                member_id,
                full_name,
                identification,
                grade,
                institutional_email,
                photo_url,
                qr_hash,
                is_active,
                cooperative_id,
                created_at,
                updated_at
            FROM members
            WHERE identification = $1
        `;

        const result = await db.query(query, [identification]);
        return result.rows[0] || null;
    } catch (error) {
        logger.error('Error finding member by identification:', error);
        throw error;
    }
};

/**
 * Find member by QR hash
 *
 * @param {string} qrHash - QR hash
 * @returns {Promise<Object|null>} Member object or null
 */
const findByQrHash = async (qrHash) => {
    try {
        const query = `
            SELECT
                member_id,
                full_name,
                identification,
                grade,
                institutional_email,
                photo_url,
                qr_hash,
                is_active,
                cooperative_id,
                created_at,
                updated_at
            FROM members
            WHERE qr_hash = $1
        `;

        const result = await db.query(query, [qrHash]);
        return result.rows[0] || null;
    } catch (error) {
        logger.error('Error finding member by QR hash:', error);
        throw error;
    }
};

/**
 * Find all members with optional filters
 *
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Array of member objects
 */
const findAll = async (filters = {}) => {
    try {
        let query = `
            SELECT
                member_id,
                full_name,
                identification,
                grade,
                institutional_email,
                photo_url,
                qr_hash,
                is_active,
                cooperative_id,
                created_at,
                updated_at
            FROM members
            WHERE 1=1
        `;

        const params = [];
        let paramIndex = 1;

        if (filters.grade) {
            query += ` AND grade = $${paramIndex}`;
            params.push(filters.grade);
            paramIndex++;
        }

        if (filters.isActive !== undefined) {
            query += ` AND is_active = $${paramIndex}`;
            params.push(filters.isActive);
            paramIndex++;
        }

        if (filters.search) {
            query += ` AND (
                full_name ILIKE $${paramIndex} OR
                identification ILIKE $${paramIndex}
            )`;
            params.push(`%${filters.search}%`);
            paramIndex++;
        }

        query += ' ORDER BY full_name ASC';

        // Pagination
        if (filters.limit) {
            query += ` LIMIT $${paramIndex}`;
            params.push(filters.limit);
            paramIndex++;
        }

        if (filters.offset) {
            query += ` OFFSET $${paramIndex}`;
            params.push(filters.offset);
            paramIndex++;
        }

        const result = await db.query(query, params);
        return result.rows;
    } catch (error) {
        logger.error('Error finding all members:', error);
        throw error;
    }
};

/**
 * Count members with optional filters
 *
 * @param {Object} filters - Filter criteria
 * @returns {Promise<number>} Count of members
 */
const count = async (filters = {}) => {
    try {
        let query = 'SELECT COUNT(*) as count FROM members WHERE 1=1';

        const params = [];
        let paramIndex = 1;

        if (filters.grade) {
            query += ` AND grade = $${paramIndex}`;
            params.push(filters.grade);
            paramIndex++;
        }

        if (filters.isActive !== undefined) {
            query += ` AND is_active = $${paramIndex}`;
            params.push(filters.isActive);
            paramIndex++;
        }

        if (filters.search) {
            query += ` AND (
                full_name ILIKE $${paramIndex} OR
                identification ILIKE $${paramIndex}
            )`;
            params.push(`%${filters.search}%`);
        }

        const result = await db.query(query, params);
        return parseInt(result.rows[0].count, 10);
    } catch (error) {
        logger.error('Error counting members:', error);
        throw error;
    }
};

/**
 * Create a new member
 *
 * @param {Object} memberData - Member data
 * @returns {Promise<Object>} Created member object
 */
const create = async (memberData) => {
    try {
        const query = `
            INSERT INTO members (
                full_name,
                identification,
                grade,
                institutional_email,
                photo_url,
                qr_hash,
                is_active,
                cooperative_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING
                member_id,
                full_name,
                identification,
                grade,
                institutional_email,
                photo_url,
                qr_hash,
                is_active,
                cooperative_id,
                created_at
        `;

        const values = [
            memberData.fullName,
            memberData.identification,
            memberData.grade,
            memberData.institutionalEmail || null,
            memberData.photoUrl || null,
            memberData.qrHash,
            memberData.isActive !== undefined ? memberData.isActive : true,
            memberData.cooperativeId || 1 // Default to cooperative 1
        ];

        const result = await db.query(query, values);
        return result.rows[0];
    } catch (error) {
        logger.error('Error creating member:', error);
        throw error;
    }
};

/**
 * Update member information
 *
 * @param {number} memberId - Member ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated member object
 */
const update = async (memberId, updates) => {
    try {
        const allowedFields = ['full_name', 'identification', 'grade', 'institutional_email', 'photo_url', 'is_active'];
        const fields = Object.keys(updates).filter(key => allowedFields.includes(key));

        if (fields.length === 0) {
            throw new Error('No valid fields to update');
        }

        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
        const values = [memberId, ...fields.map(field => updates[field])];

        const query = `
            UPDATE members
            SET ${setClause}, updated_at = CURRENT_TIMESTAMP
            WHERE member_id = $1
            RETURNING
                member_id,
                full_name,
                identification,
                grade,
                photo_url,
                qr_hash,
                is_active,
                cooperative_id,
                updated_at
        `;

        const result = await db.query(query, values);
        return result.rows[0];
    } catch (error) {
        logger.error('Error updating member:', error);
        throw error;
    }
};

/**
 * Update member QR hash
 *
 * @param {number} memberId - Member ID
 * @param {string} qrHash - New QR hash
 * @returns {Promise<Object>} Updated member object
 */
const updateQrHash = async (memberId, qrHash) => {
    try {
        const query = `
            UPDATE members
            SET qr_hash = $2, updated_at = CURRENT_TIMESTAMP
            WHERE member_id = $1
            RETURNING
                member_id,
                full_name,
                identification,
                grade,
                photo_url,
                qr_hash,
                is_active,
                cooperative_id,
                updated_at
        `;

        const result = await db.query(query, [memberId, qrHash]);
        return result.rows[0];
    } catch (error) {
        logger.error('Error updating member QR hash:', error);
        throw error;
    }
};

/**
 * Deactivate member (soft delete)
 *
 * @param {number} memberId - Member ID
 * @returns {Promise<Object>} Updated member object
 */
const deactivate = async (memberId) => {
    return update(memberId, { is_active: false });
};

/**
 * Activate member
 *
 * @param {number} memberId - Member ID
 * @returns {Promise<Object>} Updated member object
 */
const activate = async (memberId) => {
    return update(memberId, { is_active: true });
};

/**
 * Get members by grade
 *
 * @param {string} grade - Grade (1-6)
 * @returns {Promise<Array>} Array of member objects
 */
const findByGrade = async (grade) => {
    return findAll({ grade, isActive: true });
};


module.exports = {
    findById,
    findByIdentification,
    findByQrHash,
    findAll,
    count,
    create,
    update,
    updateQrHash,
    deactivate,
    activate,
    findByGrade
};
