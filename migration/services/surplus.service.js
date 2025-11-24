/**
 * Surplus Service
 * Handles database operations for surplus (excedentes) transactions
 */

const logger = require('../utils/logger');
const { getAccountId } = require('./account.service');
const { insertTransaction } = require('./transaction.service');

/**
 * Inserts surplus distribution transactions
 * @param {Object} client - Database client
 * @param {Array} distributions - Array of distribution transaction objects
 * @param {Map} identificationMap - Map of identification to member ID
 * @param {number} createdBy - User ID who created the transaction
 * @returns {Object} Result with inserted count and skipped array
 */
async function insertSurplusDistributions(client, distributions, identificationMap, createdBy) {
    logger.step('📊 Insertando distribuciones de excedentes...');

    let inserted = 0;
    const errors = [];
    const skipped = [];

    for (let i = 0; i < distributions.length; i++) {
        const transaction = distributions[i];

        try {
            // Resolve member ID from identification/code
            const memberId = identificationMap.get(transaction.memberCode) ||
                           identificationMap.get(transaction.identification);

            if (!memberId) {
                skipped.push({
                    identification: transaction.identification || transaction.memberCode,
                    memberCode: transaction.memberCode,
                    amount: transaction.amount,
                    fiscalYear: transaction.fiscalYear,
                    reason: 'Miembro no encontrado'
                });
                continue;
            }

            await insertTransaction(client, transaction, memberId, createdBy);
            inserted++;

            // Progress every 100 transactions
            if (inserted % 100 === 0 || i === distributions.length - 1) {
                logger.progress(i + 1, distributions.length, 'Insertando distribuciones');
            }

        } catch (error) {
            errors.push({
                identification: transaction.identification || transaction.memberCode,
                error: error.message
            });

            if (errors.length <= 5) {
                logger.error(`Error insertando distribución: ${error.message}`);
            }
        }
    }

    if (skipped.length > 0) {
        logger.warning(`${skipped.length} distribuciones omitidas (miembro no encontrado)`);

        // Log unique member codes that were not found
        const uniqueCodes = [...new Set(skipped.map(s => s.memberCode || s.identification))];
        logger.warning(`Códigos no encontrados (${uniqueCodes.length} únicos): ${uniqueCodes.slice(0, 10).join(', ')}${uniqueCodes.length > 10 ? '...' : ''}`);
    }

    if (errors.length > 0) {
        logger.warning(`${errors.length} distribuciones con errores`);
    }

    logger.success(`${inserted} distribuciones de excedentes insertadas`);

    return { inserted, skipped, errors };
}

/**
 * Inserts surplus withdrawal transactions
 * @param {Object} client - Database client
 * @param {Array} withdrawals - Array of withdrawal transaction objects
 * @param {Map} identificationMap - Map of identification to member ID
 * @param {number} createdBy - User ID who created the transaction
 * @returns {Object} Result with inserted count and skipped array
 */
async function insertSurplusWithdrawals(client, withdrawals, identificationMap, createdBy) {
    logger.step('💸 Insertando retiros de excedentes...');

    let inserted = 0;
    const errors = [];
    const skipped = [];

    for (let i = 0; i < withdrawals.length; i++) {
        const transaction = withdrawals[i];

        try {
            // Resolve member ID from identification/code
            const memberId = identificationMap.get(transaction.memberCode) ||
                           identificationMap.get(transaction.identification);

            if (!memberId) {
                skipped.push({
                    identification: transaction.identification || transaction.memberCode,
                    memberCode: transaction.memberCode,
                    amount: transaction.amount,
                    fiscalYear: transaction.fiscalYear,
                    reason: 'Miembro no encontrado'
                });
                continue;
            }

            await insertTransaction(client, transaction, memberId, createdBy);
            inserted++;

            // Progress every 100 transactions
            if (inserted % 100 === 0 || i === withdrawals.length - 1) {
                logger.progress(i + 1, withdrawals.length, 'Insertando retiros');
            }

        } catch (error) {
            errors.push({
                identification: transaction.identification || transaction.memberCode,
                error: error.message
            });

            if (errors.length <= 5) {
                logger.error(`Error insertando retiro: ${error.message}`);
            }
        }
    }

    if (skipped.length > 0) {
        logger.warning(`${skipped.length} retiros omitidos (miembro no encontrado)`);

        // Log unique member codes that were not found
        const uniqueCodes = [...new Set(skipped.map(s => s.memberCode || s.identification))];
        logger.warning(`Códigos no encontrados (${uniqueCodes.length} únicos): ${uniqueCodes.slice(0, 10).join(', ')}${uniqueCodes.length > 10 ? '...' : ''}`);
    }

    if (errors.length > 0) {
        logger.warning(`${errors.length} retiros con errores`);
    }

    logger.success(`${inserted} retiros insertados`);

    return { inserted, skipped, errors };
}

/**
 * Inserts contribution withdrawal transactions
 * @param {Object} client - Database client
 * @param {Array} withdrawals - Array of withdrawal transaction objects
 * @param {Map} identificationMap - Map of identification to member ID
 * @param {number} createdBy - User ID who created the transaction
 * @returns {Object} Result with inserted count and skipped array
 */
async function insertContributionWithdrawals(client, withdrawals, identificationMap, createdBy) {
    logger.step('💰 Insertando retiros de aportaciones...');

    let inserted = 0;
    const errors = [];
    const skipped = [];

    for (let i = 0; i < withdrawals.length; i++) {
        const transaction = withdrawals[i];

        try {
            // Resolve member ID from identification/code
            const memberId = identificationMap.get(transaction.memberCode) ||
                           identificationMap.get(transaction.identification);

            if (!memberId) {
                skipped.push({
                    identification: transaction.identification || transaction.memberCode,
                    memberCode: transaction.memberCode,
                    amount: transaction.amount,
                    fiscalYear: transaction.fiscalYear,
                    reason: 'Miembro no encontrado'
                });
                continue;
            }

            await insertTransaction(client, transaction, memberId, createdBy);
            inserted++;

            // Progress every 100 transactions
            if (inserted % 100 === 0 || i === withdrawals.length - 1) {
                logger.progress(i + 1, withdrawals.length, 'Insertando retiros de aportaciones');
            }

        } catch (error) {
            // Check if error is due to negative balance constraint
            if (error.message.includes('chk_balance_non_negative')) {
                skipped.push({
                    identification: transaction.identification || transaction.memberCode,
                    memberCode: transaction.memberCode,
                    amount: transaction.amount,
                    fiscalYear: transaction.fiscalYear,
                    reason: 'Saldo insuficiente (posible liquidación anterior sin registro)'
                });
            } else {
                errors.push({
                    identification: transaction.identification || transaction.memberCode,
                    error: error.message
                });

                if (errors.length <= 5) {
                    logger.error(`Error insertando retiro de aportación: ${error.message}`);
                }
            }
        }
    }

    if (skipped.length > 0) {
        const notFoundCount = skipped.filter(s => s.reason === 'Miembro no encontrado').length;
        const insufficientBalanceCount = skipped.filter(s => s.reason.includes('Saldo insuficiente')).length;

        logger.warning(`${skipped.length} retiros de aportaciones omitidos:`);
        if (notFoundCount > 0) {
            logger.warning(`  - ${notFoundCount} por miembro no encontrado`);
        }
        if (insufficientBalanceCount > 0) {
            logger.warning(`  - ${insufficientBalanceCount} por saldo insuficiente`);
        }

        // Log unique member codes
        const uniqueCodes = [...new Set(skipped.map(s => s.memberCode || s.identification))];
        logger.warning(`Códigos (${uniqueCodes.length} únicos): ${uniqueCodes.slice(0, 10).join(', ')}${uniqueCodes.length > 10 ? '...' : ''}`);
    }

    if (errors.length > 0) {
        logger.warning(`${errors.length} retiros de aportaciones con errores`);
    }

    logger.success(`${inserted} retiros de aportaciones insertados`);

    return { inserted, skipped, errors };
}

module.exports = {
    insertSurplusDistributions,
    insertSurplusWithdrawals,
    insertContributionWithdrawals
};
