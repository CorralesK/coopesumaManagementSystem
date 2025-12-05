/**
 * Savings Service
 * Business logic for savings operations
 *
 * @module modules/savings/savingsService
 */

const savingsRepository = require('./savingsRepository');
const memberRepository = require('../members/memberRepository');
const db = require('../../config/database');
const logger = require('../../utils/logger');
const ERROR_CODES = require('../../constants/errorCodes');
const MESSAGES = require('../../constants/messages');

/**
 * Custom error class for operational errors
 */
class SavingsError extends Error {
    constructor(message, errorCode, statusCode) {
        super(message);
        this.errorCode = errorCode;
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}

/**
 * Get current fiscal year from database
 */
const getCurrentFiscalYear = async (client = db) => {
    const result = await client.query('SELECT get_fiscal_year(CURRENT_DATE) AS fiscal_year');
    return result.rows[0].fiscal_year;
};

/**
 * Get member's savings account with balance and recent transactions
 *
 * @param {number} memberId - Member ID
 * @returns {Promise<Object>} Savings account data
 */
const getMemberSavings = async (memberId) => {
    try {
        // Verify member exists
        const member = await memberRepository.findById(memberId);
        if (!member) {
            throw new SavingsError(
                MESSAGES.MEMBER_NOT_FOUND,
                ERROR_CODES.MEMBER_NOT_FOUND,
                404
            );
        }

        // Get savings account
        const account = await savingsRepository.getSavingsAccount(memberId);
        if (!account) {
            throw new SavingsError(
                'No se encontró cuenta de ahorros para este miembro',
                ERROR_CODES.ACCOUNT_NOT_FOUND,
                404
            );
        }

        // Get recent transactions (last 20)
        const transactions = await savingsRepository.getTransactions(account.account_id, {
            limit: 20
        });

        return {
            account,
            transactions
        };
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error getting member savings:', error);
        throw new SavingsError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Register a savings deposit
 *
 * @param {Object} depositData - Deposit data
 * @param {number} depositData.memberId - Member ID
 * @param {number} depositData.amount - Deposit amount
 * @param {Date} depositData.transactionDate - Transaction date
 * @param {string} depositData.description - Optional description
 * @param {number} depositData.createdBy - User ID who created the deposit
 * @returns {Promise<Object>} Created transaction with updated balance
 */
const registerDeposit = async (depositData) => {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Verify member exists and is active
        const member = await memberRepository.findById(depositData.memberId);
        if (!member) {
            throw new SavingsError(
                MESSAGES.MEMBER_NOT_FOUND,
                ERROR_CODES.MEMBER_NOT_FOUND,
                404
            );
        }

        if (!member.is_active) {
            throw new SavingsError(
                MESSAGES.MEMBER_INACTIVE,
                ERROR_CODES.MEMBER_INACTIVE,
                403
            );
        }

        // 2. Get savings account
        const accountQuery = `
            SELECT account_id, current_balance
            FROM accounts
            WHERE member_id = $1 AND account_type = 'savings'
        `;
        const accountResult = await client.query(accountQuery, [depositData.memberId]);

        if (accountResult.rows.length === 0) {
            throw new SavingsError(
                'No se encontró cuenta de ahorros para este miembro',
                ERROR_CODES.ACCOUNT_NOT_FOUND,
                404
            );
        }

        const account = accountResult.rows[0];

        // 3. Get fiscal year
        const fiscalYear = await getCurrentFiscalYear(client);

        // 4. Create deposit transaction
        const transaction = await savingsRepository.createDeposit({
            accountId: account.account_id,
            amount: depositData.amount,
            transactionDate: depositData.transactionDate || new Date(),
            fiscalYear: fiscalYear,
            description: depositData.description || `Depósito de ahorros - ${member.full_name}`,
            createdBy: depositData.createdBy
        }, client);

        // 5. Update account balance (trigger should handle this, but we do it manually for safety)
        const updateBalanceQuery = `
            UPDATE accounts
            SET current_balance = current_balance + $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE account_id = $2
            RETURNING current_balance
        `;

        const balanceResult = await client.query(updateBalanceQuery, [
            depositData.amount,
            account.account_id
        ]);

        await client.query('COMMIT');

        logger.info('Deposit registered successfully', {
            transactionId: transaction.transaction_id,
            memberId: depositData.memberId,
            amount: depositData.amount
        });

        return {
            transaction,
            member: {
                memberId: member.member_id,
                fullName: member.full_name,
                identification: member.identification,
                memberCode: member.member_code
            },
            newBalance: parseFloat(balanceResult.rows[0].current_balance)
        };

    } catch (error) {
        await client.query('ROLLBACK');

        if (error.isOperational) {
            throw error;
        }

        logger.error('Error registering deposit:', error);
        throw new SavingsError(
            error.message || 'Error al registrar el depósito',
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    } finally {
        client.release();
    }
};

/**
 * Get savings ledger (all transactions) for a member
 *
 * @param {number} memberId - Member ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Ledger data with transactions and summary
 */
const getSavingsLedger = async (memberId, filters = {}) => {
    try {
        // Verify member exists
        const member = await memberRepository.findById(memberId);
        if (!member) {
            throw new SavingsError(
                MESSAGES.MEMBER_NOT_FOUND,
                ERROR_CODES.MEMBER_NOT_FOUND,
                404
            );
        }

        // Get savings account
        const account = await savingsRepository.getSavingsAccount(memberId);
        if (!account) {
            throw new SavingsError(
                'No se encontró cuenta de ahorros para este miembro',
                ERROR_CODES.ACCOUNT_NOT_FOUND,
                404
            );
        }

        // Get transactions with filters
        const transactions = await savingsRepository.getTransactions(account.account_id, filters);

        // Calculate summary
        const totalDeposits = transactions
            .filter(t => t.transaction_type === 'deposit')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        const totalWithdrawals = transactions
            .filter(t => t.transaction_type === 'withdrawal')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        return {
            member: {
                memberId: member.member_id,
                fullName: member.full_name,
                identification: member.identification,
                memberCode: member.member_code,
                qualityName: member.quality_name,
                levelName: member.level_name
            },
            account: {
                accountId: account.account_id,
                currentBalance: parseFloat(account.current_balance)
            },
            transactions,
            summary: {
                totalDeposits,
                totalWithdrawals,
                transactionCount: transactions.length
            }
        };
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error getting savings ledger:', error);
        throw new SavingsError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Get savings summary for all members
 *
 * @param {number} cooperativeId - Cooperative ID
 * @returns {Promise<Object>} Summary data
 */
const getAllMembersSavingsSummary = async (cooperativeId) => {
    try {
        const members = await savingsRepository.getSavingsSummary(cooperativeId);

        // Calculate summary statistics
        const totalSavings = members.reduce((sum, item) => sum + parseFloat(item.current_balance || 0), 0);
        const totalMembers = members.length;
        const averageBalance = totalMembers > 0 ? totalSavings / totalMembers : 0;

        return {
            summary: {
                totalSavings,
                totalMembers,
                averageBalance
            },
            members
        };
    } catch (error) {
        logger.error('Error getting savings summary:', error);
        throw new SavingsError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Get savings inventory for a fiscal year (Excel-like annual view)
 *
 * @param {number} cooperativeId - Cooperative ID
 * @param {number} fiscalYear - Fiscal year
 * @returns {Promise<Object>} Inventory data with monthly breakdown and totals
 */
const getSavingsInventoryByYear = async (cooperativeId, fiscalYear) => {
    try {
        const members = await savingsRepository.getSavingsInventoryByYear(cooperativeId, fiscalYear);

        // Calculate column totals
        const totals = {
            previous_year_balance: 0,
            january: 0,
            february: 0,
            march: 0,
            april: 0,
            may: 0,
            june: 0,
            july: 0,
            august: 0,
            september: 0,
            october: 0,
            november: 0,
            december: 0,
            interests: 0,
            total_saved: 0
        };

        members.forEach(member => {
            totals.previous_year_balance += parseFloat(member.previous_year_balance || 0);
            totals.january += parseFloat(member.january || 0);
            totals.february += parseFloat(member.february || 0);
            totals.march += parseFloat(member.march || 0);
            totals.april += parseFloat(member.april || 0);
            totals.may += parseFloat(member.may || 0);
            totals.june += parseFloat(member.june || 0);
            totals.july += parseFloat(member.july || 0);
            totals.august += parseFloat(member.august || 0);
            totals.september += parseFloat(member.september || 0);
            totals.october += parseFloat(member.october || 0);
            totals.november += parseFloat(member.november || 0);
            totals.december += parseFloat(member.december || 0);
            totals.interests += parseFloat(member.interests || 0);
            totals.total_saved += parseFloat(member.total_saved || 0);
        });

        return {
            fiscalYear,
            members,
            totals,
            totalMembers: members.length
        };
    } catch (error) {
        logger.error('Error getting savings inventory by year:', error);
        throw new SavingsError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Get savings inventory for a specific month (Excel-like monthly view)
 *
 * @param {number} cooperativeId - Cooperative ID
 * @param {number} fiscalYear - Fiscal year
 * @param {number} month - Month (1-12)
 * @returns {Promise<Object>} Monthly inventory data
 */
const getSavingsInventoryByMonth = async (cooperativeId, fiscalYear, month) => {
    try {
        if (month < 1 || month > 12) {
            throw new SavingsError(
                'El mes debe estar entre 1 y 12',
                ERROR_CODES.VALIDATION_ERROR,
                400
            );
        }

        const members = await savingsRepository.getSavingsInventoryByMonth(cooperativeId, fiscalYear, month);

        // Calculate totals for the month
        let totalDeposits = 0;
        let totalWithdrawals = 0;

        members.forEach(member => {
            member.transactions.forEach(t => {
                if (t.transaction_type === 'deposit') {
                    totalDeposits += t.amount;
                } else if (t.transaction_type === 'withdrawal') {
                    totalWithdrawals += t.amount;
                }
            });
        });

        return {
            fiscalYear,
            month,
            members,
            totals: {
                deposits: totalDeposits,
                withdrawals: totalWithdrawals,
                net: totalDeposits - totalWithdrawals
            }
        };
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error getting savings inventory by month:', error);
        throw new SavingsError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Register a savings withdrawal
 *
 * @param {Object} withdrawalData - Withdrawal data
 * @param {number} withdrawalData.memberId - Member ID
 * @param {number} withdrawalData.amount - Withdrawal amount
 * @param {string} withdrawalData.receiptNumber - Receipt number
 * @param {Date} withdrawalData.transactionDate - Transaction date
 * @param {string} withdrawalData.description - Optional description
 * @param {number} withdrawalData.createdBy - User ID who created the withdrawal
 * @returns {Promise<Object>} Created transaction with updated balance
 */
const registerWithdrawal = async (withdrawalData) => {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Verify member exists and is active
        const member = await memberRepository.findById(withdrawalData.memberId);
        if (!member) {
            throw new SavingsError(
                MESSAGES.MEMBER_NOT_FOUND,
                ERROR_CODES.MEMBER_NOT_FOUND,
                404
            );
        }

        if (!member.is_active) {
            throw new SavingsError(
                MESSAGES.MEMBER_INACTIVE,
                ERROR_CODES.MEMBER_INACTIVE,
                403
            );
        }

        // 2. Get savings account
        const accountQuery = `
            SELECT account_id, current_balance
            FROM accounts
            WHERE member_id = $1 AND account_type = 'savings'
        `;
        const accountResult = await client.query(accountQuery, [withdrawalData.memberId]);

        if (accountResult.rows.length === 0) {
            throw new SavingsError(
                'No se encontró cuenta de ahorros para este miembro',
                ERROR_CODES.ACCOUNT_NOT_FOUND,
                404
            );
        }

        const account = accountResult.rows[0];

        // 3. Verify sufficient balance
        if (parseFloat(account.current_balance) < withdrawalData.amount) {
            throw new SavingsError(
                'Saldo insuficiente para realizar el retiro',
                ERROR_CODES.INSUFFICIENT_BALANCE,
                400
            );
        }

        // 4. Get fiscal year
        const fiscalYear = await getCurrentFiscalYear(client);

        // 5. Create withdrawal transaction
        const transaction = await savingsRepository.createWithdrawal({
            accountId: account.account_id,
            amount: withdrawalData.amount,
            receiptNumber: withdrawalData.receiptNumber,
            transactionDate: withdrawalData.transactionDate || new Date(),
            fiscalYear: fiscalYear,
            description: withdrawalData.description || `Retiro de ahorros - ${member.full_name}`,
            createdBy: withdrawalData.createdBy
        }, client);

        // 6. Update account balance
        const updateBalanceQuery = `
            UPDATE accounts
            SET current_balance = current_balance - $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE account_id = $2
            RETURNING current_balance
        `;

        const balanceResult = await client.query(updateBalanceQuery, [
            withdrawalData.amount,
            account.account_id
        ]);

        await client.query('COMMIT');

        logger.info('Withdrawal registered successfully', {
            transactionId: transaction.transaction_id,
            memberId: withdrawalData.memberId,
            amount: withdrawalData.amount
        });

        return {
            transaction,
            member: {
                memberId: member.member_id,
                fullName: member.full_name,
                identification: member.identification,
                memberCode: member.member_code
            },
            newBalance: parseFloat(balanceResult.rows[0].current_balance)
        };

    } catch (error) {
        await client.query('ROLLBACK');

        if (error.isOperational) {
            throw error;
        }

        logger.error('Error registering withdrawal:', error);
        throw new SavingsError(
            error.message || 'Error al registrar el retiro',
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    } finally {
        client.release();
    }
};

module.exports = {
    getMemberSavings,
    registerDeposit,
    registerWithdrawal,
    getSavingsLedger,
    getAllMembersSavingsSummary,
    getSavingsInventoryByYear,
    getSavingsInventoryByMonth,
    SavingsError
};