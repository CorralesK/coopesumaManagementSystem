/**
 * Receipt Service
 * Business logic for receipt operations
 */

const receiptRepository = require('./receiptRepository');
const db = require('../../config/database');
const logger = require('../../utils/logger');
const ERROR_CODES = require('../../constants/errorCodes');
const MESSAGES = require('../../constants/messages');
const { getCurrentYear } = require('../../utils/dateUtils');

class ReceiptError extends Error {
    constructor(message, errorCode, statusCode) {
        super(message);
        this.errorCode = errorCode;
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}

/**
 * Generate receipt number (format: YYYY-NNNN)
 */
const generateReceiptNumber = async (client = db) => {
    const year = getCurrentYear();

    const query = `
        SELECT receipt_number
        FROM receipts
        WHERE receipt_number LIKE $1
        ORDER BY receipt_number DESC
        LIMIT 1
    `;

    const result = await client.query(query, [`${year}-%`]);

    if (result.rows.length === 0) {
        return `${year}-0001`;
    }

    const lastNumber = result.rows[0].receipt_number;
    const lastSequence = parseInt(lastNumber.split('-')[1]);
    const newSequence = (lastSequence + 1).toString().padStart(4, '0');

    return `${year}-${newSequence}`;
};

/**
 * Generate receipt for a transaction
 * @param {Object} transactionData - Transaction data
 * @param {number} transactionData.transactionId - Transaction ID
 * @param {number} transactionData.previousBalance - Previous account balance (optional)
 * @param {Object} transactionData.client - Existing database client (optional, for nested transactions)
 */
const generateReceiptForTransaction = async (transactionData) => {
    const useExistingClient = !!transactionData.client;
    const client = transactionData.client || await db.pool.connect();

    try {
        if (!useExistingClient) {
            await client.query('BEGIN');
        }

        // 1. Get transaction details with member info
        const txQuery = `
            SELECT
                t.*,
                a.account_type,
                a.current_balance,
                m.member_id,
                m.full_name as member_name,
                m.identification,
                m.member_code,
                m.cooperative_id
            FROM transactions t
            JOIN accounts a ON t.account_id = a.account_id
            JOIN members m ON a.member_id = m.member_id
            WHERE t.transaction_id = $1
        `;

        const txResult = await client.query(txQuery, [transactionData.transactionId]);

        if (txResult.rows.length === 0) {
            throw new ReceiptError('Transacción no encontrada', ERROR_CODES.NOT_FOUND, 404);
        }

        const transaction = txResult.rows[0];

        // 2. Generate receipt number
        const receiptNumber = await generateReceiptNumber(client);

        // 3. Determine receipt type
        let receiptType = 'deposit'; // default

        if (transaction.transaction_type === 'deposit' && transaction.account_type === 'savings') {
            receiptType = 'deposit';
        } else if (transaction.transaction_type === 'withdrawal') {
            receiptType = 'withdrawal';
        } else if (transaction.transaction_type === 'deposit' && transaction.account_type === 'contributions') {
            receiptType = 'contribution';
        } else if (transaction.transaction_type === 'surplus_distribution') {
            receiptType = 'surplus_distribution';
        } else if (transaction.transaction_type === 'transfer_in' || transaction.transaction_type === 'transfer_out') {
            receiptType = 'transfer';
        }

        // 4. Prepare data for PDF generation
        const pdfData = {
            receiptNumber,
            memberName: transaction.member_name,
            identification: transaction.identification,
            memberCode: transaction.member_code,
            amount: parseFloat(transaction.amount),
            date: transaction.transaction_date,
            fiscalYear: transaction.fiscal_year,
            accountType: transaction.account_type,
            description: transaction.description,
            previousBalance: transactionData.previousBalance || 0,
            newBalance: parseFloat(transaction.current_balance)
        };

        // Add specific data based on type
        if (receiptType === 'contribution' && transactionData.tractInfo) {
            pdfData.tractInfo = transactionData.tractInfo;
        }

        if (receiptType === 'transfer') {
            pdfData.surplusPrevBalance = transactionData.surplusPrevBalance || 0;
            pdfData.surplusNewBalance = transactionData.surplusNewBalance || 0;
            pdfData.savingsPrevBalance = transactionData.savingsPrevBalance || 0;
            pdfData.savingsNewBalance = transactionData.savingsNewBalance || 0;
        }

        // 5. Create receipt record (PDF will be generated on-demand when downloaded)
        const receipt = await receiptRepository.createReceipt({
            cooperativeId: transaction.cooperative_id,
            transactionId: transaction.transaction_id,
            receiptNumber,
            receiptType,
            memberId: transaction.member_id,
            amount: transaction.amount
        }, client);

        // 7. Update transaction with receipt number
        await client.query(
            'UPDATE transactions SET receipt_number = $1 WHERE transaction_id = $2',
            [receiptNumber, transaction.transaction_id]
        );

        if (!useExistingClient) {
            await client.query('COMMIT');
        }

        logger.info('Receipt generated successfully', {
            receiptId: receipt.receipt_id,
            receiptNumber,
            transactionId: transaction.transaction_id
        });

        return receipt;

    } catch (error) {
        if (!useExistingClient) {
            await client.query('ROLLBACK');
        }

        if (error.isOperational) {
            throw error;
        }

        logger.error('Error generating receipt:', error);
        throw new ReceiptError(
            'Error generating receipt',
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    } finally {
        if (!useExistingClient) {
            client.release();
        }
    }
};

/**
 * Generate receipt for liquidation
 */
const generateReceiptForLiquidation = async (liquidationData) => {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Get liquidation details
        const liqQuery = `
            SELECT
                l.*,
                m.full_name as member_name,
                m.identification,
                m.member_code,
                m.cooperative_id
            FROM liquidations l
            JOIN members m ON l.member_id = m.member_id
            WHERE l.liquidation_id = $1
        `;

        const liqResult = await client.query(liqQuery, [liquidationData.liquidationId]);

        if (liqResult.rows.length === 0) {
            throw new ReceiptError('Liquidación no encontrada', ERROR_CODES.NOT_FOUND, 404);
        }

        const liquidation = liqResult.rows[0];

        // 2. Generate receipt number
        const receiptNumber = await generateReceiptNumber(client);

        // 3. Prepare data for PDF
        const pdfData = {
            receiptNumber,
            memberName: liquidation.member_name,
            identification: liquidation.identification,
            memberCode: liquidation.member_code,
            date: liquidation.liquidation_date,
            reason: liquidation.liquidation_type,
            savingsAmount: parseFloat(liquidation.total_savings),
            contributionsAmount: parseFloat(liquidation.total_contributions),
            surplusAmount: parseFloat(liquidation.total_surplus),
            totalAmount: parseFloat(liquidation.total_amount)
        };

        // 4. Create receipt record (PDF will be generated on-demand when downloaded)
        const receipt = await receiptRepository.createReceipt({
            cooperativeId: liquidation.cooperative_id,
            liquidationId: liquidation.liquidation_id,
            receiptNumber,
            receiptType: 'liquidation',
            memberId: liquidation.member_id,
            amount: liquidation.total_amount
        }, client);

        await client.query('COMMIT');

        logger.info('Liquidation receipt generated successfully', {
            receiptId: receipt.receipt_id,
            receiptNumber,
            liquidationId: liquidation.liquidation_id
        });

        return receipt;

    } catch (error) {
        await client.query('ROLLBACK');

        if (error.isOperational) {
            throw error;
        }

        logger.error('Error generating liquidation receipt:', error);
        throw new ReceiptError(
            'Error al generar el recibo de liquidación',
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    } finally {
        client.release();
    }
};

/**
 * Get receipt by ID
 */
const getReceiptById = async (receiptId) => {
    try {
        const receipt = await receiptRepository.findById(receiptId);

        if (!receipt) {
            throw new ReceiptError('Recibo no encontrado', ERROR_CODES.NOT_FOUND, 404);
        }

        return receipt;
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error getting receipt:', error);
        throw new ReceiptError(MESSAGES.INTERNAL_ERROR, ERROR_CODES.INTERNAL_ERROR, 500);
    }
};

/**
 * Get receipts for a member
 */
const getMemberReceipts = async (memberId, filters = {}) => {
    try {
        const receipts = await receiptRepository.findByMember(memberId, filters);
        return receipts;
    } catch (error) {
        logger.error('Error getting member receipts:', error);
        throw new ReceiptError(MESSAGES.INTERNAL_ERROR, ERROR_CODES.INTERNAL_ERROR, 500);
    }
};

module.exports = {
    generateReceiptForTransaction,
    generateReceiptForLiquidation,
    getReceiptById,
    getMemberReceipts,
    ReceiptError
};