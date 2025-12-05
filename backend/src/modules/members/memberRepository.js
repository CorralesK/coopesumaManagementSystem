/**
 * Member Repository
 * Database layer for member operations
 *
 * @module modules/members/memberRepository
 */

const db = require('../../config/database');
const logger = require('../../utils/logger');

/**
 * Find member by ID with quality and level information
 *
 * @param {number} memberId - Member ID
 * @returns {Promise<Object|null>} Member object or null
 */
const findById = async (memberId) => {
    try {
        const query = `
            SELECT
                m.member_id,
                m.cooperative_id,
                m.full_name,
                m.identification,
                m.institutional_email,
                m.photo_url,
                m.qr_hash,
                m.affiliation_date,
                m.last_liquidation_date,
                m.is_active,
                m.user_id,
                m.gender,
                m.member_code,
                m.quality_id,
                m.level_id,
                m.created_at,
                m.updated_at,
                -- Quality information
                mq.quality_code,
                mq.quality_name,
                -- Level information
                ml.level_code,
                ml.level_name
            FROM members m
            JOIN member_qualities mq ON m.quality_id = mq.quality_id
            LEFT JOIN member_levels ml ON m.level_id = ml.level_id
            WHERE m.member_id = $1
        `;

        const result = await db.query(query, [memberId]);
        return result.rows[0] || null;
    } catch (error) {
        logger.error('Error finding member by ID:', error);
        throw error;
    }
};

/**
 * Find member by identification number with quality and level information
 *
 * @param {string} identification - Member identification number
 * @returns {Promise<Object|null>} Member object or null
 */
const findByIdentification = async (identification) => {
    try {
        const query = `
            SELECT
                m.member_id,
                m.cooperative_id,
                m.full_name,
                m.identification,
                m.institutional_email,
                m.photo_url,
                m.qr_hash,
                m.affiliation_date,
                m.last_liquidation_date,
                m.is_active,
                m.user_id,
                m.gender,
                m.member_code,
                m.quality_id,
                m.level_id,
                m.created_at,
                m.updated_at,
                -- Quality information
                mq.quality_code,
                mq.quality_name,
                -- Level information
                ml.level_code,
                ml.level_name
            FROM members m
            JOIN member_qualities mq ON m.quality_id = mq.quality_id
            LEFT JOIN member_levels ml ON m.level_id = ml.level_id
            WHERE m.identification = $1
        `;

        const result = await db.query(query, [identification]);
        return result.rows[0] || null;
    } catch (error) {
        logger.error('Error finding member by identification:', error);
        throw error;
    }
};

/**
 * Find member by QR hash with quality and level information
 *
 * @param {string} qrHash - QR hash
 * @returns {Promise<Object|null>} Member object or null
 */
const findByQrHash = async (qrHash) => {
    try {
        const query = `
            SELECT
                m.member_id,
                m.cooperative_id,
                m.full_name,
                m.identification,
                m.institutional_email,
                m.photo_url,
                m.qr_hash,
                m.affiliation_date,
                m.last_liquidation_date,
                m.is_active,
                m.user_id,
                m.gender,
                m.member_code,
                m.quality_id,
                m.level_id,
                m.created_at,
                m.updated_at,
                -- Quality information
                mq.quality_code,
                mq.quality_name,
                -- Level information
                ml.level_code,
                ml.level_name
            FROM members m
            JOIN member_qualities mq ON m.quality_id = mq.quality_id
            LEFT JOIN member_levels ml ON m.level_id = ml.level_id
            WHERE m.qr_hash = $1
        `;

        const result = await db.query(query, [qrHash]);
        return result.rows[0] || null;
    } catch (error) {
        logger.error('Error finding member by QR hash:', error);
        throw error;
    }
};

/**
 * Find all members with optional filters (includes quality and level information)
 *
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Array of member objects
 */
const findAll = async (filters = {}) => {
    try {
        let query = `
            SELECT
                m.member_id,
                m.cooperative_id,
                m.full_name,
                m.identification,
                m.institutional_email,
                m.photo_url,
                m.qr_hash,
                m.affiliation_date,
                m.last_liquidation_date,
                m.is_active,
                m.user_id,
                m.gender,
                m.member_code,
                m.quality_id,
                m.level_id,
                m.created_at,
                m.updated_at,
                -- Quality information
                mq.quality_code,
                mq.quality_name,
                -- Level information
                ml.level_code,
                ml.level_name
            FROM members m
            JOIN member_qualities mq ON m.quality_id = mq.quality_id
            LEFT JOIN member_levels ml ON m.level_id = ml.level_id
            WHERE 1=1
        `;

        const params = [];
        let paramIndex = 1;

        // Filter by quality_id (replaces grade filter)
        if (filters.qualityId) {
            query += ` AND m.quality_id = $${paramIndex}`;
            params.push(filters.qualityId);
            paramIndex++;
        }

        // Filter by level_id
        if (filters.levelId) {
            query += ` AND m.level_id = $${paramIndex}`;
            params.push(filters.levelId);
            paramIndex++;
        }

        // Filter by active status
        if (filters.isActive !== undefined) {
            query += ` AND m.is_active = $${paramIndex}`;
            params.push(filters.isActive);
            paramIndex++;
        }

        // Search filter
        if (filters.search) {
            query += ` AND (
                m.full_name ILIKE $${paramIndex} OR
                m.identification ILIKE $${paramIndex} OR
                m.member_code ILIKE $${paramIndex}
            )`;
            params.push(`%${filters.search}%`);
            paramIndex++;
        }

        query += ' ORDER BY m.full_name ASC';

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
        let query = 'SELECT COUNT(*) as count FROM members m WHERE 1=1';

        const params = [];
        let paramIndex = 1;

        // Filter by quality_id (replaces grade filter)
        if (filters.qualityId) {
            query += ` AND m.quality_id = $${paramIndex}`;
            params.push(filters.qualityId);
            paramIndex++;
        }

        // Filter by level_id
        if (filters.levelId) {
            query += ` AND m.level_id = $${paramIndex}`;
            params.push(filters.levelId);
            paramIndex++;
        }

        // Filter by active status
        if (filters.isActive !== undefined) {
            query += ` AND m.is_active = $${paramIndex}`;
            params.push(filters.isActive);
            paramIndex++;
        }

        // Search filter
        if (filters.search) {
            query += ` AND (
                m.full_name ILIKE $${paramIndex} OR
                m.identification ILIKE $${paramIndex} OR
                m.member_code ILIKE $${paramIndex}
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
 * Create a new member with new structure (quality_id, level_id, gender, member_code, user_id)
 *
 * @param {Object} memberData - Member data
 * @returns {Promise<Object>} Created member object
 */
const create = async (memberData) => {
    try {
        const query = `
            INSERT INTO members (
                cooperative_id,
                full_name,
                identification,
                quality_id,
                level_id,
                gender,
                member_code,
                user_id,
                institutional_email,
                photo_url,
                qr_hash,
                affiliation_date,
                is_active
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;

        const values = [
            memberData.cooperativeId || 1, // Default to cooperative 1
            memberData.fullName,
            memberData.identification,
            memberData.qualityId || 1, // Default: Estudiante
            memberData.levelId || null, // Can be NULL
            memberData.gender || null, // M/F or NULL
            memberData.memberCode || null, // Código único (ej: 152-2022)
            memberData.userId || null, // FK a users (vincular después)
            memberData.institutionalEmail || null,
            memberData.photoUrl || null,
            memberData.qrHash,
            memberData.affiliationDate || new Date(),
            memberData.isActive !== undefined ? memberData.isActive : true
        ];

        const result = await db.query(query, values);

        // Fetch complete member with quality and level info
        return findById(result.rows[0].member_id);
    } catch (error) {
        logger.error('Error creating member:', error);
        throw error;
    }
};

/**
 * Update member information (adapted to new structure)
 *
 * @param {number} memberId - Member ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated member object
 */
const update = async (memberId, updates) => {
    try {
        const allowedFields = [
            'full_name',
            'identification',
            'quality_id',
            'level_id',
            'gender',
            'member_code',
            'user_id',
            'institutional_email',
            'photo_url',
            'is_active'
        ];
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
            RETURNING *
        `;

        const result = await db.query(query, values);

        // Fetch complete member with quality and level info
        return findById(result.rows[0].member_id);
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
            RETURNING *
        `;

        const result = await db.query(query, [memberId, qrHash]);

        // Fetch complete member with quality and level info
        return findById(result.rows[0].member_id);
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
 * Get members by quality (replaces findByGrade)
 *
 * @param {number} qualityId - Quality ID (1=student, 2=employee)
 * @returns {Promise<Array>} Array of member objects
 */
const findByQuality = async (qualityId) => {
    return findAll({ qualityId, isActive: true });
};

/**
 * Get members by level
 *
 * @param {number} levelId - Level ID (1-6 for students, 7 for employees)
 * @returns {Promise<Array>} Array of member objects
 */
const findByLevel = async (levelId) => {
    return findAll({ levelId, isActive: true });
};

/**
 * @deprecated Use findByQuality or findByLevel instead
 * Get members by grade (DEPRECATED - for backwards compatibility)
 */
const findByGrade = async (grade) => {
    // Map old grade values to level_id
    const gradeToLevelMap = {
        '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6
    };
    const levelId = gradeToLevelMap[grade];
    if (!levelId) {
        return [];
    }
    return findByLevel(levelId);
};

/**
 * Find member by user_id
 * Used to get member info for logged-in users
 *
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} Member object or null
 */
const findByUserId = async (userId) => {
    const query = `
        SELECT
            m.member_id,
            m.cooperative_id,
            m.full_name,
            m.identification,
            m.quality_id,
            m.level_id,
            m.gender,
            m.member_code,
            m.user_id,
            m.institutional_email,
            m.photo_url,
            m.qr_hash,
            m.affiliation_date,
            m.is_active,
            m.created_at,
            m.updated_at,
            -- Quality info
            mq.quality_code,
            mq.quality_name,
            mq.description AS quality_description,
            -- Level info
            ml.level_code,
            ml.level_name
        FROM members m
        JOIN member_qualities mq ON m.quality_id = mq.quality_id
        LEFT JOIN member_levels ml ON m.level_id = ml.level_id
        WHERE m.user_id = $1
    `;

    const result = await db.query(query, [userId]);
    return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Get the next member code consecutive number
 * Extracts the numeric part from all member codes and returns the next consecutive
 *
 * @returns {Promise<number>} Next consecutive number
 */
/**
 * Get next member code consecutive with transaction lock
 * This method should be called within an active transaction to prevent race conditions
 * Uses advisory lock to ensure only one process generates a code at a time
 *
 * @param {Object} client - Database client with active transaction
 * @returns {Promise<number>} Next consecutive number
 */
const getNextMemberCodeConsecutive = async (client = null) => {
    try {
        const dbClient = client || db;

        // Acquire an advisory lock to prevent concurrent access
        // Lock ID: 123456 (arbitrary number for member code generation)
        await dbClient.query('SELECT pg_advisory_xact_lock(123456)');

        // Now safely get the max consecutive
        const query = `
            SELECT
                COALESCE(
                    MAX(
                        CAST(
                            SPLIT_PART(member_code, '-', 1) AS INTEGER
                        )
                    ),
                    0
                ) AS max_consecutive
            FROM members
            WHERE member_code IS NOT NULL
                AND member_code ~ '^[0-9]+-[0-9]{4}$'
        `;

        const result = await dbClient.query(query);
        const maxConsecutive = result.rows[0].max_consecutive || 0;
        const nextConsecutive = maxConsecutive + 1;

        logger.info('Retrieved max member code consecutive', {
            maxConsecutive,
            nextConsecutive
        });

        return nextConsecutive;
    } catch (error) {
        logger.error('Error getting next member code consecutive:', error);
        throw error;
    }
};


module.exports = {
    findById,
    findByIdentification,
    findByQrHash,
    findByUserId,
    findAll,
    count,
    create,
    update,
    updateQrHash,
    deactivate,
    activate,
    findByQuality,
    findByLevel,
    findByGrade, // Deprecated - mantener para compatibilidad
    getNextMemberCodeConsecutive
};
