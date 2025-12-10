/**
 * Liquidation Service
 * Business logic for liquidation operations
 */

const liquidationRepository = require('./liquidationRepository');
const memberRepository = require('../members/memberRepository');
const receiptService = require('../receipts/receiptService');
const db = require('../../config/database');
const logger = require('../../utils/logger');
const ERROR_CODES = require('../../constants/errorCodes');
const MESSAGES = require('../../constants/messages');

class LiquidationError extends Error {
    constructor(message, errorCode, statusCode) {
        super(message);
        this.errorCode = errorCode;
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}

/**
 * Get current fiscal year
 */
const getCurrentFiscalYear = async (client = db) => {
    const result = await client.query('SELECT get_fiscal_year(CURRENT_DATE) AS fiscal_year');
    return result.rows[0].fiscal_year;
};

/**
 * Get members pending liquidation
 */
const getMembersPendingLiquidation = async (cooperativeId) => {
    try {
        const members = await liquidationRepository.getMembersPendingLiquidation(cooperativeId);
        return members;
    } catch (error) {
        logger.error('Error getting pending liquidations:', error);
        throw new LiquidationError(MESSAGES.INTERNAL_ERROR, ERROR_CODES.INTERNAL_ERROR, 500);
    }
};

/**
 * Get liquidation preview for a member
 */
const getLiquidationPreview = async (memberId) => {
    try {
        // Verify member exists
        const member = await memberRepository.findById(memberId);
        if (!member) {
            throw new LiquidationError(MESSAGES.MEMBER_NOT_FOUND, ERROR_CODES.MEMBER_NOT_FOUND, 404);
        }

        // Get account balances
        const balances = await liquidationRepository.getAccountBalances(memberId);

        const totalAmount = balances.savings.balance +
            balances.contributions.balance +
            balances.surplus.balance;

        return {
            member: {
                memberId: member.memberId,
                fullName: member.fullName,
                identification: member.identification,
                memberCode: member.memberCode,
                affiliationDate: member.affiliationDate,
                lastLiquidationDate: member.lastLiquidationDate
            },
            savingsBalance: balances.savings.balance,
            contributionsBalance: balances.contributions.balance,
            surplusBalance: balances.surplus.balance,
            totalAmount: totalAmount
        };
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error getting liquidation preview:', error);
        throw new LiquidationError(MESSAGES.INTERNAL_ERROR, ERROR_CODES.INTERNAL_ERROR, 500);
    }
};

/**
 * Execute liquidation for one or multiple members
 */
const executeLiquidation = async (liquidationData) => {
    const client = await db.pool.connect();
    const results = [];

    try {
        await client.query('BEGIN');

        const {
            memberIds,
            liquidationType, // 'periodic' or 'exit'
            memberContinues, // true if stays in coop, false if leaving
            notes,
            processedBy
        } = liquidationData;

        const fiscalYear = await getCurrentFiscalYear(client);

        for (const memberId of memberIds) {
            // 1. Verify member
            const member = await memberRepository.findById(memberId);
            if (!member) {
                throw new LiquidationError(
                    `Miembro con ID ${memberId} no encontrado`,
                    ERROR_CODES.MEMBER_NOT_FOUND,
                    404
                );
            }

            // 2. Get account balances
            const balances = await liquidationRepository.getAccountBalances(memberId, client);

            const totalAmount = balances.savings.balance +
                balances.contributions.balance +
                balances.surplus.balance;

            if (totalAmount === 0) {
                logger.warn(`Member ${memberId} has zero balance, skipping liquidation`);
                continue;
            }

            // 3. Create liquidation transactions for each account
            const liquidationTransactions = [];

            for (const accountType of ['savings', 'contributions', 'surplus']) {
                const accountData = balances[accountType];

                if (accountData.balance > 0 && accountData.accountId) {
                    // Create liquidation transaction
                    const txQuery = `
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
                        VALUES ($1, 'liquidation', $2, CURRENT_DATE, $3, $4, 'completed', $5)
                        RETURNING transaction_id
                    `;

                    const txValues = [
                        accountData.accountId,
                        accountData.balance,
                        fiscalYear,
                        `Liquidación ${liquidationType === 'periodic' ? 'periódica' : 'por retiro'} - ${member.fullName}`,
                        processedBy
                    ];

                    const txResult = await client.query(txQuery, txValues);
                    liquidationTransactions.push(txResult.rows[0].transaction_id);

                    // Reset account balance to zero
                    await client.query(
                        'UPDATE accounts SET current_balance = 0.00, updated_at = CURRENT_TIMESTAMP WHERE account_id = $1',
                        [accountData.accountId]
                    );
                }
            }

            // 4. Update member's last_liquidation_date
            await client.query(
                'UPDATE members SET last_liquidation_date = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP WHERE member_id = $1',
                [memberId]
            );

            // 5. If member is leaving, set is_active = false
            if (!memberContinues) {
                await client.query(
                    'UPDATE members SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE member_id = $1',
                    [memberId]
                );
            }

            // 6. Create liquidation record
            const liquidation = await liquidationRepository.createLiquidation({
                memberId,
                cooperativeId: member.cooperative_id,
                liquidationType,
                liquidationDate: new Date(),
                totalSavings: balances.savings.balance,
                totalContributions: balances.contributions.balance,
                totalSurplus: balances.surplus.balance,
                totalAmount,
                memberContinues,
                notes,
                processedBy
            }, client);

            results.push({
                memberId,
                memberName: member.fullName,
                liquidationId: liquidation.liquidationId,
                totalLiquidated: totalAmount,
                transactions: liquidationTransactions
            });
        }

        await client.query('COMMIT');

        // 7. Generate receipts (after commit, in separate transactions)
        for (const result of results) {
            try {
                const receipt = await receiptService.generateReceiptForLiquidation({
                    liquidationId: result.liquidationId
                });

                result.receiptId = receipt.receipt_id || receipt.receiptId;
                result.receiptNumber = receipt.receipt_number || receipt.receiptNumber;

            } catch (receiptError) {
                logger.error('Error generating liquidation receipt:', receiptError);
                // Don't fail the liquidation if receipt generation fails
                result.receiptError = receiptError.message;
            }
        }

        logger.info('Liquidations executed successfully', {
            count: results.length,
            liquidationType,
            processedBy
        });

        return results;

    } catch (error) {
        await client.query('ROLLBACK');

        if (error.isOperational) {
            throw error;
        }

        logger.error('Error executing liquidation:', error);
        throw new LiquidationError(
            error.message || 'Error al ejecutar la liquidación',
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    } finally {
        client.release();
    }
};

/**
 * Get liquidation by ID
 */
const getLiquidationById = async (liquidationId) => {
    try {
        const liquidation = await liquidationRepository.findById(liquidationId);

        if (!liquidation) {
            throw new LiquidationError('Liquidación no encontrada', ERROR_CODES.NOT_FOUND, 404);
        }

        return liquidation;
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error getting liquidation:', error);
        throw new LiquidationError(MESSAGES.INTERNAL_ERROR, ERROR_CODES.INTERNAL_ERROR, 500);
    }
};

/**
 * Get liquidation history
 */
const getLiquidationHistory = async (filters = {}) => {
    try {
        let liquidations;

        if (filters.memberId) {
            liquidations = await liquidationRepository.getLiquidationHistory(filters.memberId);
        } else {
            liquidations = await liquidationRepository.getAllLiquidations(filters);
        }

        return liquidations;
    } catch (error) {
        logger.error('Error getting liquidation history:', error);
        throw new LiquidationError(MESSAGES.INTERNAL_ERROR, ERROR_CODES.INTERNAL_ERROR, 500);
    }
};

/**
 * Get liquidation statistics for dashboard
 */
const getLiquidationStats = async (cooperativeId) => {
    try {
        // Get pending members count
        const pendingMembers = await liquidationRepository.getMembersPendingLiquidation(cooperativeId);

        // Get liquidations from current fiscal year
        const currentYear = new Date().getFullYear();
        const yearStart = `${currentYear}-01-01`;
        const yearEnd = `${currentYear}-12-31`;

        const yearLiquidations = await liquidationRepository.getAllLiquidations({
            cooperativeId,
            startDate: yearStart,
            endDate: yearEnd
        });

        // Calculate totals
        const totalPending = pendingMembers.length;
        const totalThisYear = yearLiquidations.length;

        const periodicThisYear = yearLiquidations.filter(l => l.liquidationType === 'periodic').length;
        const exitThisYear = yearLiquidations.filter(l => l.liquidationType === 'exit').length;

        const totalAmountThisYear = yearLiquidations.reduce((sum, l) => sum + (parseFloat(l.totalAmount) || 0), 0);

        // Get top pending members (most urgent - sorted by years)
        const topPending = pendingMembers.slice(0, 5);

        return {
            pending: {
                count: totalPending,
                topMembers: topPending
            },
            thisYear: {
                total: totalThisYear,
                periodic: periodicThisYear,
                exit: exitThisYear,
                totalAmount: totalAmountThisYear
            }
        };
    } catch (error) {
        logger.error('Error getting liquidation statistics:', error);
        throw new LiquidationError(MESSAGES.INTERNAL_ERROR, ERROR_CODES.INTERNAL_ERROR, 500);
    }
};

module.exports = {
    getMembersPendingLiquidation,
    getLiquidationPreview,
    executeLiquidation,
    getLiquidationById,
    getLiquidationHistory,
    getLiquidationStats,
    LiquidationError
};