/**
 * Withdrawal Request Repository
 * Database layer for withdrawal request operations
 *
 * @module modules/withdrawalRequests/withdrawalRequestRepository
 */

const db = require('../../config/database');
const logger = require('../../utils/logger');
const { keysToCamel } = require('../../utils/caseConverter');

/**
 * Create a withdrawal request
 *
 * @param {Object} requestData - Request data
 * @param {Object} client - Database client
 * @returns {Promise<Object>} Created request
 */
const createRequest = async (requestData, client = db) => {
    try {
        const query = `
            INSERT INTO withdrawal_requests (
                member_id,
                account_id,
                requested_amount,
                request_type,
                request_notes,
                status
            )
            VALUES ($1, $2, $3, $4, $5, 'pending')
            RETURNING *
        `;

        const values = [
            requestData.memberId,
            requestData.accountId,
            requestData.requestedAmount,
            requestData.requestType,
            requestData.requestNotes || null
        ];

        const result = await client.query(query, values);
        const row = result.rows[0];
        return client === db ? row : keysToCamel(row);
    } catch (error) {
        logger.error('Error creating withdrawal request:', error);
        throw error;
    }
};

/**
 * Get withdrawal request by ID
 *
 * @param {number} requestId - Request ID
 * @returns {Promise<Object|null>} Request or null
 */
const findById = async (requestId) => {
    try {
        const query = `
            SELECT
                wr.*,
                m.full_name as member_name,
                m.identification,
                m.member_code,
                a.account_type,
                a.current_balance,
                u.full_name as reviewed_by_name
            FROM withdrawal_requests wr
            JOIN members m ON wr.member_id = m.member_id
            JOIN accounts a ON wr.account_id = a.account_id
            LEFT JOIN users u ON wr.reviewed_by = u.user_id
            WHERE wr.request_id = $1
        `;

        const result = await db.query(query, [requestId]);
        return result.rows[0] || null;
    } catch (error) {
        logger.error('Error finding withdrawal request by ID:', error);
        throw error;
    }
};

/**
 * Get all withdrawal requests with filters
 *
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Array of requests
 */
const findAll = async (filters = {}) => {
    try {
        let query = `
            SELECT
                wr.*,
                m.full_name as member_name,
                m.identification,
                m.member_code,
                a.account_type,
                a.current_balance,
                u.full_name as reviewed_by_name
            FROM withdrawal_requests wr
            JOIN members m ON wr.member_id = m.member_id
            JOIN accounts a ON wr.account_id = a.account_id
            LEFT JOIN users u ON wr.reviewed_by = u.user_id
            WHERE 1=1
        `;

        const params = [];
        let paramIndex = 1;

        if (filters.status) {
            query += ` AND wr.status = $${paramIndex}`;
            params.push(filters.status);
            paramIndex++;
        }

        if (filters.memberId) {
            query += ` AND wr.member_id = $${paramIndex}`;
            params.push(filters.memberId);
            paramIndex++;
        }

        if (filters.accountType) {
            query += ` AND a.account_type = $${paramIndex}`;
            params.push(filters.accountType);
            paramIndex++;
        }

        query += ' ORDER BY wr.requested_at DESC';

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
        logger.error('Error finding withdrawal requests:', error);
        throw error;
    }
};

/**
 * Update withdrawal request status
 *
 * @param {number} requestId - Request ID
 * @param {Object} updateData - Update data
 * @param {Object} client - Database client
 * @returns {Promise<Object>} Updated request
 */
const updateStatus = async (requestId, updateData, client = db) => {
    try {
        const query = `
            UPDATE withdrawal_requests
            SET
                status = $2,
                admin_notes = $3,
                reviewed_by = $4,
                reviewed_at = CURRENT_TIMESTAMP,
                completed_transaction_id = $5,
                updated_at = CURRENT_TIMESTAMP
            WHERE request_id = $1
            RETURNING *
        `;

        const values = [
            requestId,
            updateData.status,
            updateData.adminNotes || null,
            updateData.reviewedBy,
            updateData.completedTransactionId || null
        ];

        const result = await client.query(query, values);
        const row = result.rows[0];
        return client === db ? row : keysToCamel(row);
    } catch (error) {
        logger.error('Error updating withdrawal request status:', error);
        throw error;
    }
};

/**
 * Get pending requests count
 *
 * @param {number} cooperativeId - Cooperative ID (optional filter)
 * @returns {Promise<number>} Count of pending requests
 */
const getPendingCount = async (cooperativeId = null) => {
    try {
        let query = `
            SELECT COUNT(*) as count
            FROM withdrawal_requests wr
            JOIN members m ON wr.member_id = m.member_id
            WHERE wr.status = 'pending'
        `;

        const params = [];

        if (cooperativeId) {
            query += ' AND m.cooperative_id = $1';
            params.push(cooperativeId);
        }

        const result = await db.query(query, params);
        return parseInt(result.rows[0].count, 10);
    } catch (error) {
        logger.error('Error getting pending requests count:', error);
        throw error;
    }
};

module.exports = {
    createRequest,
    findById,
    findAll,
    updateStatus,
    getPendingCount
};