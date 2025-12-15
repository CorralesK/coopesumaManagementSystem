/**
 * Receipt Repository
 * Database layer for receipt operations
 */

const db = require('../../config/database');
const logger = require('../../utils/logger');

/**
 * Create a receipt record
 * Tabla real: receipts (cooperative_id, transaction_id, liquidation_id, receipt_number,
 *             receipt_type, member_id, amount)
 */
const createReceipt = async (receiptData, client = db) => {
    try {
        const query = `
            INSERT INTO receipts (
                cooperative_id,
                transaction_id,
                liquidation_id,
                receipt_number,
                receipt_type,
                member_id,
                amount
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const values = [
            receiptData.cooperativeId || 1,
            receiptData.transactionId || null,
            receiptData.liquidationId || null,
            receiptData.receiptNumber,
            receiptData.receiptType,
            receiptData.memberId,
            receiptData.amount
        ];

        const result = await client.query(query, values);
        return result.rows[0];
    } catch (error) {
        logger.error('Error creating receipt:', error);
        throw error;
    }
};

/**
 * Find receipt by ID
 */
const findById = async (receiptId) => {
    try {
        const query = `
            SELECT
                r.*,
                m.full_name as member_name,
                m.identification,
                m.member_code,
                mq.quality_name,
                ml.level_name
            FROM receipts r
            JOIN members m ON r.member_id = m.member_id
            JOIN member_qualities mq ON m.quality_id = mq.quality_id
            LEFT JOIN member_levels ml ON m.level_id = ml.level_id
            WHERE r.receipt_id = $1
        `;

        const result = await db.query(query, [receiptId]);
        return result.rows[0] || null;
    } catch (error) {
        logger.error('Error finding receipt by ID:', error);
        throw error;
    }
};

/**
 * Find receipts by member
 */
const findByMember = async (memberId, filters = {}) => {
    try {
        let query = `
            SELECT
                r.*,
                m.full_name as member_name
            FROM receipts r
            JOIN members m ON r.member_id = m.member_id
            WHERE r.member_id = $1
        `;

        const params = [memberId];
        let paramIndex = 2;

        if (filters.receiptType) {
            query += ` AND r.receipt_type = $${paramIndex}`;
            params.push(filters.receiptType);
            paramIndex++;
        }

        query += ' ORDER BY r.created_at DESC';

        if (filters.limit) {
            query += ` LIMIT $${paramIndex}`;
            params.push(filters.limit);
        }

        const result = await db.query(query, params);
        return result.rows;
    } catch (error) {
        logger.error('Error finding receipts by member:', error);
        throw error;
    }
};

module.exports = {
    createReceipt,
    findById,
    findByMember
};