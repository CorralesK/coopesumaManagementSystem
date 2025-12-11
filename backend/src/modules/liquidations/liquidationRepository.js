/**
 * Liquidation Repository
 * Database layer for liquidation operations
 */

const db = require('../../config/database');
const logger = require('../../utils/logger');

/**
 * Transform snake_case keys to camelCase
 */
const toCamelCase = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(toCamelCase);

    return Object.keys(obj).reduce((acc, key) => {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        acc[camelKey] = obj[key];
        return acc;
    }, {});
};

/**
 * Get members pending liquidation (6+ years)
 * Usa tabla existente: members (affiliation_date, last_liquidation_date)
 */
const getMembersPendingLiquidation = async (cooperativeId) => {
    try {
        const query = `
            SELECT
                m.member_id,
                m.full_name,
                m.identification,
                m.member_code,
                m.affiliation_date,
                m.last_liquidation_date,
                mq.quality_name,
                ml.level_name,
                CASE
                    WHEN m.last_liquidation_date IS NULL THEN
                        EXTRACT(YEAR FROM AGE(CURRENT_DATE, m.affiliation_date))
                    ELSE
                        EXTRACT(YEAR FROM AGE(CURRENT_DATE, m.last_liquidation_date))
                END AS years_since_last_liquidation
            FROM members m
            JOIN member_qualities mq ON m.quality_id = mq.quality_id
            LEFT JOIN member_levels ml ON m.level_id = ml.level_id
            WHERE m.cooperative_id = $1
                AND m.is_active = true
                AND (
                    (m.last_liquidation_date IS NULL AND
                     EXTRACT(YEAR FROM AGE(CURRENT_DATE, m.affiliation_date)) >= 6)
                    OR
                    (m.last_liquidation_date IS NOT NULL AND
                     EXTRACT(YEAR FROM AGE(CURRENT_DATE, m.last_liquidation_date)) >= 6)
                )
            ORDER BY years_since_last_liquidation DESC
        `;

        const result = await db.query(query, [cooperativeId]);
        return toCamelCase(result.rows);
    } catch (error) {
        logger.error('Error getting pending liquidations:', error);
        throw error;
    }
};

/**
 * Get account balances for a member
 */
const getAccountBalances = async (memberId, client = db) => {
    try {
        const query = `
            SELECT
                account_type,
                account_id,
                current_balance
            FROM accounts
            WHERE member_id = $1
                AND account_type IN ('savings', 'contributions', 'surplus')
        `;

        const result = await client.query(query, [memberId]);
        const rows = toCamelCase(result.rows);

        const balances = {
            savings: { accountId: null, balance: 0 },
            contributions: { accountId: null, balance: 0 },
            surplus: { accountId: null, balance: 0 }
        };

        rows.forEach(row => {
            balances[row.accountType] = {
                accountId: row.accountId,
                balance: parseFloat(row.currentBalance)
            };
        });

        return balances;
    } catch (error) {
        logger.error('Error getting account balances:', error);
        throw error;
    }
};

/**
 * Create liquidation record
 * Tabla existente: liquidations
 */
const createLiquidation = async (liquidationData, client = db) => {
    try {
        const query = `
            INSERT INTO liquidations (
                member_id,
                cooperative_id,
                liquidation_type,
                liquidation_date,
                total_savings,
                total_contributions,
                total_surplus,
                total_amount,
                member_continues,
                notes,
                processed_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `;

        const values = [
            liquidationData.memberId,
            liquidationData.cooperativeId,
            liquidationData.liquidationType,
            liquidationData.liquidationDate || new Date(),
            liquidationData.totalSavings,
            liquidationData.totalContributions,
            liquidationData.totalSurplus,
            liquidationData.totalAmount,
            liquidationData.memberContinues,
            liquidationData.notes || null,
            liquidationData.processedBy
        ];

        const result = await client.query(query, values);
        return toCamelCase(result.rows[0]);
    } catch (error) {
        logger.error('Error creating liquidation:', error);
        throw error;
    }
};

/**
 * Get liquidation by ID
 */
const findById = async (liquidationId) => {
    try {
        const query = `
            SELECT
                l.*,
                m.full_name as member_name,
                m.identification,
                m.member_code,
                u.full_name as processed_by_name
            FROM liquidations l
            JOIN members m ON l.member_id = m.member_id
            LEFT JOIN users u ON l.processed_by = u.user_id
            WHERE l.liquidation_id = $1
        `;

        const result = await db.query(query, [liquidationId]);
        return result.rows[0] ? toCamelCase(result.rows[0]) : null;
    } catch (error) {
        logger.error('Error finding liquidation by ID:', error);
        throw error;
    }
};

/**
 * Get liquidation history for a member
 */
const getLiquidationHistory = async (memberId) => {
    try {
        const query = `
            SELECT
                l.*,
                u.full_name as processed_by_name
            FROM liquidations l
            LEFT JOIN users u ON l.processed_by = u.user_id
            WHERE l.member_id = $1
            ORDER BY l.liquidation_date DESC
        `;

        const result = await db.query(query, [memberId]);
        return toCamelCase(result.rows);
    } catch (error) {
        logger.error('Error getting liquidation history:', error);
        throw error;
    }
};

/**
 * Get all liquidations with filters
 */
const getAllLiquidations = async (filters = {}) => {
    try {
        let query = `
            SELECT
                l.*,
                m.full_name as member_name,
                m.identification,
                m.member_code,
                u.full_name as processed_by_name
            FROM liquidations l
            JOIN members m ON l.member_id = m.member_id
            LEFT JOIN users u ON l.processed_by = u.user_id
            WHERE 1=1
        `;

        const params = [];
        let paramIndex = 1;

        if (filters.cooperativeId) {
            query += ` AND l.cooperative_id = $${paramIndex}`;
            params.push(filters.cooperativeId);
            paramIndex++;
        }

        if (filters.liquidationType) {
            query += ` AND l.liquidation_type = $${paramIndex}`;
            params.push(filters.liquidationType);
            paramIndex++;
        }

        if (filters.startDate) {
            query += ` AND l.liquidation_date >= $${paramIndex}`;
            params.push(filters.startDate);
            paramIndex++;
        }

        if (filters.endDate) {
            query += ` AND l.liquidation_date <= $${paramIndex}`;
            params.push(filters.endDate);
            paramIndex++;
        }

        query += ' ORDER BY l.liquidation_date DESC';

        if (filters.limit) {
            query += ` LIMIT $${paramIndex}`;
            params.push(filters.limit);
        }

        const result = await db.query(query, params);
        return toCamelCase(result.rows);
    } catch (error) {
        logger.error('Error getting all liquidations:', error);
        throw error;
    }
};

module.exports = {
    getMembersPendingLiquidation,
    getAccountBalances,
    createLiquidation,
    findById,
    getLiquidationHistory,
    getAllLiquidations
};