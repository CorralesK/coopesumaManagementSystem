/**
 * Transaction Service
 * Handles database operations for transactions
 */

const logger = require('../utils/logger');
const { getAccountId } = require('./account.service');

/**
 * Inserts a single transaction
 * @param {Object} client - Database client
 * @param {Object} transaction - Transaction object
 * @param {number} memberId - Member ID
 * @param {number} createdBy - User ID who created the transaction
 * @returns {number} Transaction ID
 */
async function insertTransaction(client, transaction, memberId, createdBy) {
    // Get the appropriate account ID
    const accountId = await getAccountId(client, memberId, transaction.accountType);

    if (!accountId) {
        throw new Error(`Account not found for member ${memberId} and type ${transaction.accountType}`);
    }

    const query = `
        INSERT INTO transactions (
            account_id,
            transaction_type,
            amount,
            transaction_date,
            fiscal_year,
            description,
            receipt_number,
            status,
            created_by,
            created_at,
            updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING transaction_id
    `;

    const values = [
        accountId,
        transaction.transactionType,
        transaction.amount,
        transaction.transactionDate,
        transaction.fiscalYear,
        transaction.description,
        transaction.receiptNumber || null,
        'completed',
        createdBy
    ];

    const result = await client.query(query, values);
    return result.rows[0].transaction_id;
}

/**
 * Inserts savings transactions
 * @param {Object} client - Database client
 * @param {Array} transactions - Array of transaction objects
 * @param {Map} identificationMap - Map of identification to member ID
 * @param {number} createdBy - User ID who created the transaction
 * @returns {number} Number of transactions inserted
 */
async function insertSavingsTransactions(client, transactions, identificationMap, createdBy) {
    logger.step('💰 Insertando transacciones de ahorros...');

    let inserted = 0;
    const errors = [];
    const skipped = [];

    for (let i = 0; i < transactions.length; i++) {
        const transaction = transactions[i];

        try {
            // Resolve member ID from identification/code
            const memberId = identificationMap.get(transaction.memberCode) ||
                           identificationMap.get(transaction.identification);

            if (!memberId) {
                skipped.push({
                    identification: transaction.identification || transaction.memberCode,
                    memberCode: transaction.memberCode,
                    amount: transaction.amount,
                    date: transaction.transactionDate,
                    reason: 'Miembro no encontrado'
                });
                continue;
            }

            await insertTransaction(client, transaction, memberId, createdBy);
            inserted++;

            // Progress every 100 transactions
            if (inserted % 100 === 0 || i === transactions.length - 1) {
                logger.progress(i + 1, transactions.length, 'Insertando ahorros');
            }

        } catch (error) {
            errors.push({
                identification: transaction.identification || transaction.memberCode,
                error: error.message
            });

            if (errors.length <= 5) {
                logger.error(`Error insertando ahorro: ${error.message}`);
            }
        }
    }

    if (skipped.length > 0) {
        logger.warning(`${skipped.length} transacciones omitidas (miembro no encontrado)`);

        // Log unique member codes that were not found
        const uniqueCodes = [...new Set(skipped.map(s => s.memberCode || s.identification))];
        logger.warning(`Códigos no encontrados (${uniqueCodes.length} únicos): ${uniqueCodes.slice(0, 10).join(', ')}${uniqueCodes.length > 10 ? '...' : ''}`);
    }

    if (errors.length > 0) {
        logger.warning(`${errors.length} transacciones con errores`);
    }

    logger.success(`${inserted} transacciones de ahorro insertadas`);

    return { inserted, skipped, errors };
}

/**
 * Inserts contribution transactions
 * @param {Object} client - Database client
 * @param {Array} transactions - Array of transaction objects
 * @param {Map} identificationMap - Map of identification to member ID
 * @param {number} createdBy - User ID who created the transaction
 * @returns {number} Number of transactions inserted
 */
async function insertContributionTransactions(client, transactions, identificationMap, createdBy) {
    logger.step('📊 Insertando transacciones de aportaciones...');

    let inserted = 0;
    const errors = [];
    const skipped = [];

    for (let i = 0; i < transactions.length; i++) {
        const transaction = transactions[i];

        try {
            // Resolve member ID from identification/code
            const memberId = identificationMap.get(transaction.memberCode) ||
                           identificationMap.get(transaction.identification);

            if (!memberId) {
                skipped.push({
                    identification: transaction.identification || transaction.memberCode,
                    memberCode: transaction.memberCode,
                    amount: transaction.amount,
                    date: transaction.transactionDate,
                    tractNumber: transaction.tractNumber,
                    reason: 'Miembro no encontrado'
                });
                continue;
            }

            await insertTransaction(client, transaction, memberId, createdBy);
            inserted++;

            // Progress every 100 transactions
            if (inserted % 100 === 0 || i === transactions.length - 1) {
                logger.progress(i + 1, transactions.length, 'Insertando aportaciones');
            }

        } catch (error) {
            errors.push({
                identification: transaction.identification || transaction.memberCode,
                error: error.message
            });

            if (errors.length <= 5) {
                logger.error(`Error insertando aportación: ${error.message}`);
            }
        }
    }

    if (skipped.length > 0) {
        logger.warning(`${skipped.length} transacciones omitidas (miembro no encontrado)`);

        // Log unique member codes that were not found
        const uniqueCodes = [...new Set(skipped.map(s => s.memberCode || s.identification))];
        logger.warning(`Códigos no encontrados (${uniqueCodes.length} únicos): ${uniqueCodes.slice(0, 10).join(', ')}${uniqueCodes.length > 10 ? '...' : ''}`);
    }

    if (errors.length > 0) {
        logger.warning(`${errors.length} transacciones con errores`);
    }

    logger.success(`${inserted} transacciones de aportaciones insertadas`);

    return { inserted, skipped, errors };
}

/**
 * Updates account balances based on transactions
 * This is done automatically by triggers, but this function can be used for verification
 * @param {Object} client - Database client
 * @returns {Object} Summary of updated balances
 */
async function updateAccountBalances(client) {
    const query = `
        SELECT
            a.account_type,
            COUNT(*) as account_count,
            SUM(a.current_balance) as total_balance
        FROM accounts a
        GROUP BY a.account_type
    `;

    const result = await client.query(query);
    return result.rows;
}

module.exports = {
    insertTransaction,
    insertSavingsTransactions,
    insertContributionTransactions,
    updateAccountBalances
};
