/**
 * Contributions Repository
 * Database layer for contributions operations
 *
 * @module modules/contributions/contributionsRepository
 */

const db = require('../../config/database');
const logger = require('../../utils/logger');

/**
 * Get contributions account for a member
 *
 * @param {number} memberId - Member ID
 * @returns {Promise<Object|null>} Contributions account or null
 */
const getContributionsAccount = async (memberId) => {
    try {
        const query = `
            SELECT
                a.account_id,
                a.member_id,
                a.cooperative_id,
                a.account_type,
                a.current_balance,
                a.created_at,
                a.updated_at
            FROM accounts a
            WHERE a.member_id = $1 AND a.account_type = 'contributions'
        `;

        const result = await db.query(query, [memberId]);
        return result.rows[0] || null;
    } catch (error) {
        logger.error('Error getting contributions account:', error);
        throw error;
    }
};

/**
 * Get contribution periods for a fiscal year
 *
 * @param {number} cooperativeId - Cooperative ID
 * @param {number} fiscalYear - Fiscal year
 * @returns {Promise<Array>} Array of contribution periods
 */
const getContributionPeriods = async (cooperativeId, fiscalYear) => {
    try {
        const query = `
            SELECT
                period_id,
                cooperative_id,
                fiscal_year,
                tract_number,
                start_date,
                end_date,
                required_amount,
                created_at,
                updated_at
            FROM contribution_periods
            WHERE cooperative_id = $1 AND fiscal_year = $2
            ORDER BY tract_number
        `;

        const result = await db.query(query, [cooperativeId, fiscalYear]);
        return result.rows;
    } catch (error) {
        logger.error('Error getting contribution periods:', error);
        throw error;
    }
};

/**
 * Create contribution period
 *
 * @param {Object} periodData - Period data
 * @param {Object} client - Database client
 * @returns {Promise<Object>} Created period
 */
const createContributionPeriod = async (periodData, client = db) => {
    try {
        const query = `
            INSERT INTO contribution_periods (
                cooperative_id,
                fiscal_year,
                tract_number,
                start_date,
                end_date,
                required_amount
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const values = [
            periodData.cooperativeId,
            periodData.fiscalYear,
            periodData.tractNumber,
            periodData.startDate,
            periodData.endDate,
            periodData.requiredAmount || 300.00
        ];

        const result = await client.query(query, values);
        return result.rows[0];
    } catch (error) {
        logger.error('Error creating contribution period:', error);
        throw error;
    }
};

/**
 * Get contribution transactions for an account in a fiscal year
 *
 * @param {number} accountId - Account ID
 * @param {number} fiscalYear - Fiscal year
 * @returns {Promise<Array>} Array of transactions
 */
const getContributionTransactions = async (accountId, fiscalYear) => {
    try {
        const query = `
            SELECT
                t.transaction_id,
                t.account_id,
                t.transaction_type,
                t.amount,
                t.transaction_date,
                t.fiscal_year,
                t.receipt_number,
                t.description,
                t.status,
                t.created_by,
                t.created_at,
                u.full_name as created_by_name
            FROM transactions t
            LEFT JOIN users u ON t.created_by = u.user_id
            WHERE t.account_id = $1
                AND t.fiscal_year = $2
                AND t.status = 'completed'
            ORDER BY t.transaction_date DESC
        `;

        const result = await db.query(query, [accountId, fiscalYear]);
        return result.rows;
    } catch (error) {
        logger.error('Error getting contribution transactions:', error);
        throw error;
    }
};

/**
 * Register a contribution payment
 *
 * @param {Object} contributionData - Contribution data
 * @param {Object} client - Database client
 * @returns {Promise<Object>} Created transaction
 */
const registerContribution = async (contributionData, client = db) => {
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
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;

        const values = [
            contributionData.accountId,
            'deposit',
            contributionData.amount,
            contributionData.transactionDate || new Date(),
            contributionData.fiscalYear,
            contributionData.description,
            'completed',
            contributionData.createdBy
        ];

        const result = await client.query(query, values);
        return result.rows[0];
    } catch (error) {
        logger.error('Error registering contribution:', error);
        throw error;
    }
};

/**
 * Get contribution status for all members in a fiscal year
 *
 * @param {number} cooperativeId - Cooperative ID
 * @param {number} fiscalYear - Fiscal year
 * @returns {Promise<Array>} Array of member contribution statuses
 */
const getContributionsReport = async (cooperativeId, fiscalYear) => {
    try {
        const query = `
            SELECT
                m.member_id,
                m.full_name,
                m.identification,
                m.member_code,
                mq.quality_name,
                ml.level_name,
                a.account_id,
                a.current_balance,
                COALESCE(SUM(CASE WHEN t.fiscal_year = $2 THEN t.amount ELSE 0 END), 0) as total_contributed,
                COUNT(DISTINCT CASE WHEN t.fiscal_year = $2 THEN t.transaction_id END) as payment_count
            FROM members m
            JOIN member_qualities mq ON m.quality_id = mq.quality_id
            LEFT JOIN member_levels ml ON m.level_id = ml.level_id
            JOIN accounts a ON m.member_id = a.member_id
            LEFT JOIN transactions t ON a.account_id = t.account_id AND t.status = 'completed'
            WHERE m.cooperative_id = $1
                AND a.account_type = 'contributions'
                AND m.is_active = true
            GROUP BY m.member_id, m.full_name, m.identification, m.member_code,
                     mq.quality_name, ml.level_name, a.account_id, a.current_balance
            ORDER BY m.full_name
        `;

        const result = await db.query(query, [cooperativeId, fiscalYear]);
        return result.rows;
    } catch (error) {
        logger.error('Error getting contributions report:', error);
        throw error;
    }
};

module.exports = {
    getContributionsAccount,
    getContributionPeriods,
    createContributionPeriod,
    getContributionTransactions,
    registerContribution,
    getContributionsReport
};