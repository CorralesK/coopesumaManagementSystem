/**
 * Surplus Repository
 * Database layer for surplus distribution operations
 */

const db = require('../../config/database');
const logger = require('../../utils/logger');

/**
 * Get eligible members for surplus distribution
 * Includes: active members + inactive members liquidated before Sept of next year
 */
const getEligibleMembers = async (cooperativeId, fiscalYear, client = db) => {
    try {
        // Calculate September of the next year
        const septemberNextYear = `${fiscalYear + 1}-09-30`;

        const query = `
            SELECT
                m.member_id,
                m.full_name,
                m.identification,
                m.member_code,
                m.is_active,
                m.cooperative_id
            FROM members m
            WHERE m.cooperative_id = $1
                AND (
                    -- Active members
                    m.is_active = true
                    OR
                    -- Inactive members liquidated before Sept of next year
                    (
                        m.is_active = false
                        AND EXISTS (
                            SELECT 1
                            FROM liquidations l
                            WHERE l.member_id = m.member_id
                                AND l.liquidation_date < $2
                        )
                    )
                )
            ORDER BY m.full_name
        `;

        const result = await client.query(query, [cooperativeId, septemberNextYear]);
        return result.rows;
    } catch (error) {
        logger.error('Error getting eligible members:', error);
        throw error;
    }
};

/**
 * Get total contributions for a member in a fiscal year
 */
const getMemberContributions = async (memberId, fiscalYear, client = db) => {
    try {
        const query = `
            SELECT COALESCE(SUM(t.amount), 0) as total_contributions
            FROM transactions t
            JOIN accounts a ON t.account_id = a.account_id
            WHERE a.member_id = $1
                AND a.account_type = 'contributions'
                AND t.fiscal_year = $2
                AND t.transaction_type = 'deposit'
                AND t.status = 'completed'
        `;

        const result = await client.query(query, [memberId, fiscalYear]);
        return parseFloat(result.rows[0].total_contributions);
    } catch (error) {
        logger.error('Error getting member contributions:', error);
        throw error;
    }
};

/**
 * Get total contributions for all eligible members
 */
const getTotalContributions = async (cooperativeId, fiscalYear, client = db) => {
    try {
        const query = `
            SELECT COALESCE(SUM(t.amount), 0) as total
            FROM transactions t
            JOIN accounts a ON t.account_id = a.account_id
            JOIN members m ON a.member_id = m.member_id
            WHERE m.cooperative_id = $1
                AND a.account_type = 'contributions'
                AND t.fiscal_year = $2
                AND t.transaction_type = 'deposit'
                AND t.status = 'completed'
        `;

        const result = await client.query(query, [cooperativeId, fiscalYear]);
        return parseFloat(result.rows[0].total);
    } catch (error) {
        logger.error('Error getting total contributions:', error);
        throw error;
    }
};

/**
 * Create surplus distribution transaction
 */
const createSurplusTransaction = async (transactionData, client = db) => {
    try {
        const query = `
            INSERT INTO transactions (
                account_id,
                transaction_type,
                amount,
                transaction_date,
                fiscal_year,
                description,
                status,
                created_by
            )
            VALUES ($1, 'surplus_distribution', $2, CURRENT_DATE, $3, $4, 'completed', $5)
            RETURNING transaction_id
        `;

        const values = [
            transactionData.accountId,
            transactionData.amount,
            transactionData.fiscalYear,
            transactionData.description,
            transactionData.createdBy
        ];

        const result = await client.query(query, values);
        return result.rows[0].transaction_id;
    } catch (error) {
        logger.error('Error creating surplus transaction:', error);
        throw error;
    }
};

/**
 * Update surplus account balance
 */
const updateSurplusBalance = async (accountId, amount, client = db) => {
    try {
        const query = `
            UPDATE accounts
            SET current_balance = current_balance + $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE account_id = $1
            RETURNING current_balance
        `;

        const result = await client.query(query, [accountId, amount]);
        return parseFloat(result.rows[0].current_balance);
    } catch (error) {
        logger.error('Error updating surplus balance:', error);
        throw error;
    }
};

/**
 * Get surplus account for a member
 */
const getSurplusAccount = async (memberId, client = db) => {
    try {
        const query = `
            SELECT account_id, current_balance
            FROM accounts
            WHERE member_id = $1 AND account_type = 'surplus'
        `;

        const result = await client.query(query, [memberId]);
        return result.rows[0] || null;
    } catch (error) {
        logger.error('Error getting surplus account:', error);
        throw error;
    }
};

/**
 * Create surplus distribution record
 * Tabla: surplus_distributions
 */
const createDistributionRecord = async (distributionData, client = db) => {
    try {
        const query = `
            INSERT INTO surplus_distributions (
                cooperative_id,
                fiscal_year,
                total_distributable_amount,
                total_contributions,
                distribution_date,
                status,
                notes,
                created_by
            )
            VALUES ($1, $2, $3, $4, CURRENT_DATE, 'completed', $5, $6)
            RETURNING *
        `;

        const values = [
            distributionData.cooperativeId,
            distributionData.fiscalYear,
            distributionData.totalDistributableAmount,
            distributionData.totalContributions,
            distributionData.notes || null,
            distributionData.createdBy
        ];

        const result = await client.query(query, values);
        return result.rows[0];
    } catch (error) {
        logger.error('Error creating distribution record:', error);
        throw error;
    }
};

/**
 * Get distribution history
 */
const getDistributionHistory = async (cooperativeId, filters = {}) => {
    try {
        let query = `
            SELECT
                sd.*,
                u.full_name as created_by_name
            FROM surplus_distributions sd
            LEFT JOIN users u ON sd.created_by = u.user_id
            WHERE sd.cooperative_id = $1
        `;

        const params = [cooperativeId];
        let paramIndex = 2;

        if (filters.fiscalYear) {
            query += ` AND sd.fiscal_year = $${paramIndex}`;
            params.push(filters.fiscalYear);
            paramIndex++;
        }

        query += ' ORDER BY sd.fiscal_year DESC, sd.distribution_date DESC';

        const result = await db.query(query, params);
        return result.rows;
    } catch (error) {
        logger.error('Error getting distribution history:', error);
        throw error;
    }
};

module.exports = {
    getEligibleMembers,
    getMemberContributions,
    getTotalContributions,
    createSurplusTransaction,
    updateSurplusBalance,
    getSurplusAccount,
    createDistributionRecord,
    getDistributionHistory
};