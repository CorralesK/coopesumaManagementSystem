/**
 * Contributions Service
 * Business logic for contributions operations
 *
 * @module modules/contributions/contributionsService
 */

const contributionsRepository = require('./contributionsRepository');
const memberRepository = require('../members/memberRepository');
const db = require('../../config/database');
const logger = require('../../utils/logger');
const ERROR_CODES = require('../../constants/errorCodes');
const MESSAGES = require('../../constants/messages');
const { getNow } = require('../../utils/dateUtils');

/**
 * Custom error class for operational errors
 */
class ContributionsError extends Error {
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
 * Get contribution periods for a fiscal year
 *
 * @param {number} cooperativeId - Cooperative ID
 * @param {number} fiscalYear - Fiscal year (defaults to current)
 * @returns {Promise<Array>} Contribution periods
 */
const getContributionPeriods = async (cooperativeId, fiscalYear = null) => {
    try {
        const year = fiscalYear || await getCurrentFiscalYear();

        const periods = await contributionsRepository.getContributionPeriods(cooperativeId, year);

        return {
            fiscalYear: year,
            periods
        };
    } catch (error) {
        logger.error('Error getting contribution periods:', error);
        throw new ContributionsError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Create contribution periods for a fiscal year (3 tracts)
 *
 * @param {Object} data - Period configuration
 * @param {number} data.cooperativeId - Cooperative ID
 * @param {number} data.fiscalYear - Fiscal year
 * @param {Array} data.tracts - Array of 3 tract configurations
 * @returns {Promise<Array>} Created periods
 */
const createContributionPeriods = async (data) => {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // Validate that we have 3 tracts
        if (!data.tracts || data.tracts.length !== 3) {
            throw new ContributionsError(
                'Exactly 3 tracts must be provided',
                ERROR_CODES.VALIDATION_ERROR,
                400
            );
        }

        // Check if periods already exist for this fiscal year
        const existing = await contributionsRepository.getContributionPeriods(
            data.cooperativeId,
            data.fiscalYear
        );

        if (existing.length > 0) {
            throw new ContributionsError(
                'Contribution periods already exist for this fiscal year',
                ERROR_CODES.DUPLICATE_ENTRY,
                409
            );
        }

        // Create periods
        const createdPeriods = [];

        for (let i = 0; i < data.tracts.length; i++) {
            const tract = data.tracts[i];

            const period = await contributionsRepository.createContributionPeriod({
                cooperativeId: data.cooperativeId,
                fiscalYear: data.fiscalYear,
                tractNumber: i + 1,
                startDate: tract.startDate,
                endDate: tract.endDate,
                requiredAmount: tract.requiredAmount || 300.00
            }, client);

            createdPeriods.push(period);
        }

        await client.query('COMMIT');

        logger.info('Contribution periods created', {
            fiscalYear: data.fiscalYear,
            count: createdPeriods.length
        });

        return createdPeriods;

    } catch (error) {
        await client.query('ROLLBACK');

        if (error.isOperational) {
            throw error;
        }

        logger.error('Error creating contribution periods:', error);
        throw new ContributionsError(
            error.message || 'Error creating contribution periods',
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    } finally {
        client.release();
    }
};

/**
 * Get member's contribution status for a fiscal year
 *
 * @param {number} memberId - Member ID
 * @param {number} fiscalYear - Fiscal year (defaults to current)
 * @returns {Promise<Object>} Contribution status
 */
const getMemberContributions = async (memberId, fiscalYear = null) => {
    try {
        // Verify member exists
        const member = await memberRepository.findById(memberId);
        if (!member) {
            throw new ContributionsError(
                MESSAGES.MEMBER_NOT_FOUND,
                ERROR_CODES.MEMBER_NOT_FOUND,
                404
            );
        }

        const year = fiscalYear || await getCurrentFiscalYear();

        // Get contributions account
        const account = await contributionsRepository.getContributionsAccount(memberId);
        if (!account) {
            throw new ContributionsError(
                'Contributions account not found for this member',
                ERROR_CODES.ACCOUNT_NOT_FOUND,
                404
            );
        }

        // Get periods for this fiscal year
        const periods = await contributionsRepository.getContributionPeriods(
            member.cooperative_id,
            year
        );

        // Get transactions for this fiscal year
        const transactions = await contributionsRepository.getContributionTransactions(
            account.account_id,
            year
        );

        // Calculate totals
        const totalContributed = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const requiredTotal = periods.reduce((sum, p) => sum + parseFloat(p.required_amount), 0);

        return {
            member: {
                memberId: member.memberId,
                fullName: member.fullName,
                identification: member.identification,
                memberCode: member.memberCode,
                qualityName: member.qualityName,
                levelName: member.levelName
            },
            fiscalYear: year,
            account: {
                accountId: account.account_id,
                currentBalance: parseFloat(account.current_balance)
            },
            periods,
            transactions,
            summary: {
                totalContributed,
                requiredTotal,
                paymentCount: transactions.length,
                tractsRequired: periods.length,
                isComplete: totalContributed >= requiredTotal
            }
        };
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error getting member contributions:', error);
        throw new ContributionsError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Register a contribution payment
 *
 * @param {Object} contributionData - Contribution data
 * @param {number} contributionData.memberId - Member ID
 * @param {number} contributionData.tractNumber - Tract number (1, 2, or 3)
 * @param {number} contributionData.amount - Amount paid
 * @param {Date} contributionData.transactionDate - Transaction date
 * @param {string} contributionData.description - Optional description
 * @param {number} contributionData.createdBy - User ID who registered the contribution
 * @returns {Promise<Object>} Created transaction
 */
const registerContribution = async (contributionData) => {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Verify member exists and is active
        const member = await memberRepository.findById(contributionData.memberId);
        if (!member) {
            throw new ContributionsError(
                MESSAGES.MEMBER_NOT_FOUND,
                ERROR_CODES.MEMBER_NOT_FOUND,
                404
            );
        }

        if (!member.isActive) {
            throw new ContributionsError(
                MESSAGES.MEMBER_INACTIVE,
                ERROR_CODES.MEMBER_INACTIVE,
                403
            );
        }

        // 2. Get contributions account
        const accountQuery = `
            SELECT account_id, current_balance
            FROM accounts
            WHERE member_id = $1 AND account_type = 'contributions'
        `;
        const accountResult = await client.query(accountQuery, [contributionData.memberId]);

        if (accountResult.rows.length === 0) {
            throw new ContributionsError(
                'Contributions account not found for this member',
                ERROR_CODES.ACCOUNT_NOT_FOUND,
                404
            );
        }

        const account = accountResult.rows[0];

        // 3. Get fiscal year
        const fiscalYear = await getCurrentFiscalYear(client);

        // Detect if full payment (₡900 or more, without tractNumber specified)
        const requiredTotal = 900; // ₡300 × 3

        if (contributionData.amount >= requiredTotal && !contributionData.tractNumber) {
            // FULL PAYMENT - Automatically divide into 3 tracts
            const amountPerTract = contributionData.amount / 3;
            const results = [];

            for (let tractNum = 1; tractNum <= 3; tractNum++) {
                // Validate that the period exists
                const periodQuery = `
                    SELECT period_id, required_amount
                    FROM contribution_periods
                    WHERE cooperative_id = $1 AND fiscal_year = $2 AND tract_number = $3
                `;
                const periodResult = await client.query(periodQuery, [
                    member.cooperative_id,
                    fiscalYear,
                    tractNum
                ]);

                if (periodResult.rows.length === 0) {
                    throw new ContributionsError(
                        `Period not found for tract ${tractNum}`,
                        ERROR_CODES.NOT_FOUND,
                        404
                    );
                }

                // Create transaction for this tract
                const description = `Contribution Tract ${tractNum} (full payment) - ${member.fullName}`;

                const transaction = await contributionsRepository.registerContribution({
                    accountId: account.account_id,
                    amount: amountPerTract,
                    transactionDate: contributionData.transactionDate || getNow(),
                    fiscalYear: fiscalYear,
                    description,
                    createdBy: contributionData.createdBy
                }, client);

                results.push({
                    tractNumber: tractNum,
                    transaction,
                    amount: amountPerTract
                });
            }

            // Update balance
            const updateBalanceQuery = `
                UPDATE accounts
                SET current_balance = current_balance + $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE account_id = $2
                RETURNING current_balance
            `;

            const balanceResult = await client.query(updateBalanceQuery, [
                contributionData.amount,
                account.account_id
            ]);

            await client.query('COMMIT');

            logger.info('Full contribution registered (divided into 3 tracts)', {
                memberId: contributionData.memberId,
                totalAmount: contributionData.amount
            });

            return {
                member: {
                    memberId: member.memberId,
                    fullName: member.fullName,
                    memberCode: member.memberCode
                },
                transactions: results,
                totalAmount: contributionData.amount,
                newBalance: parseFloat(balanceResult.rows[0].current_balance),
                isFullPayment: true
            };
        }

        // 4. Validate tract number (individual payment)
        if (!contributionData.tractNumber || contributionData.tractNumber < 1 || contributionData.tractNumber > 3) {
            throw new ContributionsError(
                'Tract number must be 1, 2, or 3, or pay the full amount (₡900)',
                ERROR_CODES.VALIDATION_ERROR,
                400
            );
        }

        // 5. Get period information for this tract
        const periodQuery = `
            SELECT period_id, required_amount, start_date, end_date
            FROM contribution_periods
            WHERE cooperative_id = $1
                AND fiscal_year = $2
                AND tract_number = $3
        `;
        const periodResult = await client.query(periodQuery, [
            member.cooperative_id,
            fiscalYear,
            contributionData.tractNumber
        ]);

        if (periodResult.rows.length === 0) {
            throw new ContributionsError(
                'Contribution period not found for this tract',
                ERROR_CODES.NOT_FOUND,
                404
            );
        }

        const period = periodResult.rows[0];

        // 6. Create contribution transaction
        const description = contributionData.description ||
            `Contribution Tract ${contributionData.tractNumber} - ${member.fullName}`;

        const transaction = await contributionsRepository.registerContribution({
            accountId: account.account_id,
            amount: contributionData.amount,
            transactionDate: contributionData.transactionDate || getNow(),
            fiscalYear: fiscalYear,
            description,
            createdBy: contributionData.createdBy
        }, client);

        // 7. Update account balance
        const updateBalanceQuery = `
            UPDATE accounts
            SET current_balance = current_balance + $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE account_id = $2
            RETURNING current_balance
        `;

        const balanceResult = await client.query(updateBalanceQuery, [
            contributionData.amount,
            account.account_id
        ]);

        await client.query('COMMIT');

        logger.info('Contribution registered successfully', {
            transactionId: transaction.transaction_id,
            memberId: contributionData.memberId,
            tractNumber: contributionData.tractNumber,
            amount: contributionData.amount
        });

        return {
            transaction,
            member: {
                memberId: member.memberId,
                fullName: member.fullName,
                identification: member.identification,
                memberCode: member.memberCode
            },
            period: {
                tractNumber: contributionData.tractNumber,
                requiredAmount: parseFloat(period.required_amount),
                startDate: period.start_date,
                endDate: period.end_date
            },
            newBalance: parseFloat(balanceResult.rows[0].current_balance)
        };

    } catch (error) {
        await client.query('ROLLBACK');

        if (error.isOperational) {
            throw error;
        }

        logger.error('Error registering contribution:', error);
        throw new ContributionsError(
            error.message || 'Error registering contribution',
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    } finally {
        client.release();
    }
};

/**
 * Get contributions report for all members
 *
 * @param {number} cooperativeId - Cooperative ID
 * @param {number} fiscalYear - Fiscal year (defaults to current)
 * @returns {Promise<Object>} Report data
 */
const getContributionsReport = async (cooperativeId, fiscalYear = null) => {
    try {
        const year = fiscalYear || await getCurrentFiscalYear();

        const report = await contributionsRepository.getContributionsReport(cooperativeId, year);

        // Get periods to calculate required amount
        const periods = await contributionsRepository.getContributionPeriods(cooperativeId, year);
        const requiredTotal = periods.reduce((sum, p) => sum + parseFloat(p.required_amount), 0);

        // Calculate totals
        const totalCollected = report.reduce((sum, item) => sum + parseFloat(item.total_contributed), 0);
        const membersCompleted = report.filter(item => parseFloat(item.total_contributed) >= requiredTotal).length;

        return {
            fiscalYear: year,
            members: report.map(item => ({
                ...item,
                isComplete: parseFloat(item.total_contributed) >= requiredTotal
            })),
            periods,
            summary: {
                totalMembers: report.length,
                membersCompleted,
                requiredPerMember: requiredTotal,
                totalCollected,
                completionRate: report.length > 0 ? (membersCompleted / report.length * 100).toFixed(2) : 0
            }
        };
    } catch (error) {
        logger.error('Error getting contributions report:', error);
        throw new ContributionsError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

module.exports = {
    getContributionPeriods,
    createContributionPeriods,
    getMemberContributions,
    registerContribution,
    getContributionsReport,
    ContributionsError
};