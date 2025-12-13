/**
 * Savings Repository
 * Database layer for savings operations
 *
 * @module modules/savings/savingsRepository
 */

const db = require('../../config/database');
const logger = require('../../utils/logger');
const { getNow } = require('../../utils/dateUtils');

/**
 * Get savings account for a member
 *
 * @param {number} memberId - Member ID
 * @returns {Promise<Object|null>} Savings account or null
 */
const getSavingsAccount = async (memberId) => {
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
            WHERE a.member_id = $1 AND a.account_type = 'savings'
        `;

        const result = await db.query(query, [memberId]);
        return result.rows[0] || null;
    } catch (error) {
        logger.error('Error getting savings account:', error);
        throw error;
    }
};

/**
 * Get all transactions for a savings account
 *
 * @param {number} accountId - Account ID
 * @param {Object} filters - Filter options (limit, offset, startDate, endDate)
 * @returns {Promise<Array>} Array of transactions
 */
const getTransactions = async (accountId, filters = {}) => {
    try {
        let query = `
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
        `;

        const params = [accountId];
        let paramIndex = 2;

        // Filter by date range
        if (filters.startDate) {
            query += ` AND t.transaction_date >= $${paramIndex}`;
            params.push(filters.startDate);
            paramIndex++;
        }

        if (filters.endDate) {
            query += ` AND t.transaction_date <= $${paramIndex}`;
            params.push(filters.endDate);
            paramIndex++;
        }

        // Filter by fiscal year
        if (filters.fiscalYear) {
            query += ` AND t.fiscal_year = $${paramIndex}`;
            params.push(filters.fiscalYear);
            paramIndex++;
        }

        // Order by date descending
        query += ' ORDER BY t.transaction_date DESC, t.created_at DESC';

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
        logger.error('Error getting savings transactions:', error);
        throw error;
    }
};

/**
 * Create a deposit transaction
 *
 * @param {Object} transactionData - Transaction data
 * @param {Object} client - Database client (for transactions)
 * @returns {Promise<Object>} Created transaction
 */
const createDeposit = async (transactionData, client = db) => {
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
            transactionData.accountId,
            'deposit',
            transactionData.amount,
            transactionData.transactionDate || getNow(),
            transactionData.fiscalYear,
            transactionData.description || 'Depósito de ahorros',
            'completed',
            transactionData.createdBy
        ];

        const result = await client.query(query, values);
        return result.rows[0];
    } catch (error) {
        logger.error('Error creating deposit:', error);
        throw error;
    }
};

/**
 * Get savings summary for all members
 *
 * @param {number} cooperativeId - Cooperative ID
 * @returns {Promise<Array>} Array of member savings summaries
 */
const getSavingsSummary = async (cooperativeId) => {
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
                COUNT(t.transaction_id) as transaction_count,
                MAX(t.transaction_date) as last_transaction_date
            FROM members m
            JOIN member_qualities mq ON m.quality_id = mq.quality_id
            LEFT JOIN member_levels ml ON m.level_id = ml.level_id
            JOIN accounts a ON m.member_id = a.member_id
            LEFT JOIN transactions t ON a.account_id = t.account_id AND t.status = 'completed'
            WHERE m.cooperative_id = $1
                AND a.account_type = 'savings'
                AND m.is_active = true
            GROUP BY m.member_id, m.full_name, m.identification, m.member_code,
                     mq.quality_name, ml.level_name, a.account_id, a.current_balance
            ORDER BY m.full_name
        `;

        const result = await db.query(query, [cooperativeId]);
        return result.rows;
    } catch (error) {
        logger.error('Error getting savings summary:', error);
        throw error;
    }
};

/**
 * Get savings inventory by fiscal year (Excel-like annual view)
 * Returns all members with their monthly deposits/withdrawals
 *
 * NOTE: This query uses calendar year for display (matching Excel format)
 * - "Año Anterior" = Previous year accumulated balance (transactions marked as such)
 * - Monthly columns = Transactions from each calendar month of the selected year
 *
 * @param {number} cooperativeId - Cooperative ID
 * @param {number} fiscalYear - Calendar year to display (e.g., 2025)
 * @returns {Promise<Array>} Array of member savings by month
 */
const getSavingsInventoryByYear = async (cooperativeId, fiscalYear) => {
    try {
        // For the inventory view, we use calendar year (like the Excel)
        // fiscalYear parameter is actually the calendar year we want to display
        const calendarYear = fiscalYear;

        const query = `
            WITH previous_year_balance AS (
                -- Get "Año Anterior" balance: transactions marked as previous year balance
                -- OR all transactions before January 1st of the selected year
                SELECT
                    m.member_id,
                    COALESCE(SUM(CASE
                        WHEN t.transaction_type = 'deposit' THEN t.amount
                        WHEN t.transaction_type = 'withdrawal' THEN -t.amount
                        WHEN t.transaction_type = 'liquidation' THEN -t.amount
                        ELSE 0
                    END), 0) as prev_balance
                FROM members m
                JOIN accounts a ON m.member_id = a.member_id AND a.account_type = 'savings'
                LEFT JOIN transactions t ON a.account_id = t.account_id
                    AND t.status = 'completed'
                    AND (
                        -- Transactions explicitly marked as previous year balance
                        t.description LIKE '%Saldo acumulado años anteriores%'
                        OR
                        -- OR transactions from before this calendar year
                        EXTRACT(YEAR FROM t.transaction_date) < $2
                    )
                WHERE m.cooperative_id = $1
                GROUP BY m.member_id
            ),
            monthly_transactions AS (
                -- Get monthly transactions for the selected calendar year
                -- Excluding "Año Anterior" transactions
                SELECT
                    m.member_id,
                    EXTRACT(MONTH FROM t.transaction_date) as month,
                    SUM(CASE
                        WHEN t.transaction_type = 'deposit' THEN t.amount
                        WHEN t.transaction_type = 'withdrawal' THEN -t.amount
                        WHEN t.transaction_type = 'liquidation' THEN -t.amount
                        ELSE 0
                    END) as net_amount
                FROM members m
                JOIN accounts a ON m.member_id = a.member_id AND a.account_type = 'savings'
                LEFT JOIN transactions t ON a.account_id = t.account_id
                    AND t.status = 'completed'
                    AND EXTRACT(YEAR FROM t.transaction_date) = $2
                    -- Exclude "Año Anterior" transactions (they go to previous_year_balance)
                    AND t.description NOT LIKE '%Saldo acumulado años anteriores%'
                WHERE m.cooperative_id = $1 AND m.is_active = true
                GROUP BY m.member_id, EXTRACT(MONTH FROM t.transaction_date)
            )
            SELECT
                m.member_id,
                m.member_code,
                m.full_name,
                COALESCE(pyb.prev_balance, 0) as previous_year_balance,
                -- Monthly net amounts (deposits - withdrawals for each month)
                COALESCE(SUM(CASE WHEN mt.month = 1 THEN mt.net_amount END), 0) as january,
                COALESCE(SUM(CASE WHEN mt.month = 2 THEN mt.net_amount END), 0) as february,
                COALESCE(SUM(CASE WHEN mt.month = 3 THEN mt.net_amount END), 0) as march,
                COALESCE(SUM(CASE WHEN mt.month = 4 THEN mt.net_amount END), 0) as april,
                COALESCE(SUM(CASE WHEN mt.month = 5 THEN mt.net_amount END), 0) as may,
                COALESCE(SUM(CASE WHEN mt.month = 6 THEN mt.net_amount END), 0) as june,
                COALESCE(SUM(CASE WHEN mt.month = 7 THEN mt.net_amount END), 0) as july,
                COALESCE(SUM(CASE WHEN mt.month = 8 THEN mt.net_amount END), 0) as august,
                COALESCE(SUM(CASE WHEN mt.month = 9 THEN mt.net_amount END), 0) as september,
                COALESCE(SUM(CASE WHEN mt.month = 10 THEN mt.net_amount END), 0) as october,
                COALESCE(SUM(CASE WHEN mt.month = 11 THEN mt.net_amount END), 0) as november,
                COALESCE(SUM(CASE WHEN mt.month = 12 THEN mt.net_amount END), 0) as december,
                0 as interests,
                -- Total saved is the current balance (actual balance in the account)
                a.current_balance as total_saved
            FROM members m
            JOIN accounts a ON m.member_id = a.member_id AND a.account_type = 'savings'
            LEFT JOIN monthly_transactions mt ON m.member_id = mt.member_id
            LEFT JOIN previous_year_balance pyb ON m.member_id = pyb.member_id
            WHERE m.cooperative_id = $1 AND m.is_active = true
            GROUP BY m.member_id, m.member_code, m.full_name, pyb.prev_balance, a.current_balance
            ORDER BY m.member_code
        `;

        const result = await db.query(query, [cooperativeId, calendarYear]);
        return result.rows;
    } catch (error) {
        logger.error('Error getting savings inventory by year:', error);
        throw error;
    }
};

/**
 * Get savings inventory for a specific month (Excel-like monthly view)
 * Returns all members with their transactions (RECIBO - AHORRO pairs)
 *
 * @param {number} cooperativeId - Cooperative ID
 * @param {number} fiscalYear - Fiscal year
 * @param {number} month - Month (1-12)
 * @returns {Promise<Array>} Array of member savings for the month
 */
const getSavingsInventoryByMonth = async (cooperativeId, fiscalYear, month) => {
    try {
        const query = `
            SELECT
                m.member_id,
                m.member_code,
                m.full_name,
                t.transaction_id,
                t.receipt_number,
                t.transaction_type,
                t.amount,
                t.transaction_date,
                t.description
            FROM members m
            JOIN accounts a ON m.member_id = a.member_id AND a.account_type = 'savings'
            LEFT JOIN transactions t ON a.account_id = t.account_id
                AND t.fiscal_year = $2
                AND EXTRACT(MONTH FROM t.transaction_date) = $3
                AND t.status = 'completed'
            WHERE m.cooperative_id = $1 AND m.is_active = true
            ORDER BY m.member_code, t.transaction_date, t.transaction_id
        `;

        const result = await db.query(query, [cooperativeId, fiscalYear, month]);

        // Group transactions by member
        const memberMap = new Map();

        result.rows.forEach(row => {
            if (!memberMap.has(row.member_id)) {
                memberMap.set(row.member_id, {
                    member_id: row.member_id,
                    member_code: row.member_code,
                    full_name: row.full_name,
                    transactions: []
                });
            }

            if (row.transaction_id) {
                memberMap.get(row.member_id).transactions.push({
                    transaction_id: row.transaction_id,
                    receipt_number: row.receipt_number,
                    transaction_type: row.transaction_type,
                    amount: parseFloat(row.amount),
                    transaction_date: row.transaction_date,
                    description: row.description
                });
            }
        });

        return Array.from(memberMap.values());
    } catch (error) {
        logger.error('Error getting savings inventory by month:', error);
        throw error;
    }
};

/**
 * Create a withdrawal transaction
 *
 * @param {Object} transactionData - Transaction data
 * @param {Object} client - Database client (for transactions)
 * @returns {Promise<Object>} Created transaction
 */
const createWithdrawal = async (transactionData, client = db) => {
    try {
        const query = `
            INSERT INTO transactions (
                account_id,
                transaction_type,
                amount,
                transaction_date,
                fiscal_year,
                receipt_number,
                description,
                status,
                created_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;

        const values = [
            transactionData.accountId,
            'withdrawal',
            transactionData.amount,
            transactionData.transactionDate || getNow(),
            transactionData.fiscalYear,
            transactionData.receiptNumber,
            transactionData.description || 'Retiro de ahorros',
            'completed',
            transactionData.createdBy
        ];

        const result = await client.query(query, values);
        return result.rows[0];
    } catch (error) {
        logger.error('Error creating withdrawal:', error);
        throw error;
    }
};

module.exports = {
    getSavingsAccount,
    getTransactions,
    createDeposit,
    createWithdrawal,
    getSavingsSummary,
    getSavingsInventoryByYear,
    getSavingsInventoryByMonth
};