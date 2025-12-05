/**
 * Surplus Service
 * Business logic for surplus distribution operations
 */

const surplusRepository = require('./surplusRepository');
const db = require('../../config/database');
const logger = require('../../utils/logger');
const ERROR_CODES = require('../../constants/errorCodes');
const MESSAGES = require('../../constants/messages');

class SurplusError extends Error {
    constructor(message, errorCode, statusCode) {
        super(message);
        this.errorCode = errorCode;
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}

/**
 * Get distribution preview (without executing)
 * Shows how much each member would receive
 */
const getDistributionPreview = async (cooperativeId, fiscalYear, totalDistributableAmount) => {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Get eligible members
        const eligibleMembers = await surplusRepository.getEligibleMembers(
            cooperativeId,
            fiscalYear,
            client
        );

        if (eligibleMembers.length === 0) {
            throw new SurplusError(
                'No hay miembros elegibles para distribución de excedentes',
                ERROR_CODES.NOT_FOUND,
                404
            );
        }

        // 2. Get total contributions
        const totalContributions = await surplusRepository.getTotalContributions(
            cooperativeId,
            fiscalYear,
            client
        );

        if (totalContributions === 0) {
            throw new SurplusError(
                'No hay aportaciones registradas para este año fiscal',
                ERROR_CODES.INVALID_OPERATION,
                400
            );
        }

        // 3. Calculate distribution for each member
        const distribution = [];
        let totalDistributed = 0;

        for (const member of eligibleMembers) {
            const memberContributions = await surplusRepository.getMemberContributions(
                member.member_id,
                fiscalYear,
                client
            );

            if (memberContributions > 0) {
                // Formula: (member_contributions / total_contributions) * total_distributable
                const surplusAmount = (memberContributions / totalContributions) * totalDistributableAmount;
                const roundedAmount = Math.round(surplusAmount * 100) / 100; // Round to 2 decimals

                distribution.push({
                    memberId: member.member_id,
                    memberName: member.full_name,
                    memberCode: member.member_code,
                    isActive: member.is_active,
                    contributions: memberContributions,
                    surplusAmount: roundedAmount,
                    percentage: ((memberContributions / totalContributions) * 100).toFixed(2)
                });

                totalDistributed += roundedAmount;
            }
        }

        await client.query('COMMIT');

        return {
            fiscalYear,
            totalDistributableAmount,
            totalContributions,
            totalMembersEligible: eligibleMembers.length,
            totalMembersReceiving: distribution.length,
            totalDistributed,
            roundingDifference: totalDistributableAmount - totalDistributed,
            distribution
        };

    } catch (error) {
        await client.query('ROLLBACK');

        if (error.isOperational) {
            throw error;
        }

        logger.error('Error getting distribution preview:', error);
        throw new SurplusError(MESSAGES.INTERNAL_ERROR, ERROR_CODES.INTERNAL_ERROR, 500);
    } finally {
        client.release();
    }
};

/**
 * Execute surplus distribution
 * Creates transactions but NO receipts
 */
const distributeSurplus = async (distributionData) => {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        const {
            cooperativeId,
            fiscalYear,
            totalDistributableAmount,
            notes,
            createdBy
        } = distributionData;

        // 1. Check if distribution already exists for this fiscal year
        const existingQuery = `
            SELECT distribution_id
            FROM surplus_distributions
            WHERE cooperative_id = $1 AND fiscal_year = $2
        `;

        const existingResult = await client.query(existingQuery, [cooperativeId, fiscalYear]);

        if (existingResult.rows.length > 0) {
            throw new SurplusError(
                `Ya existe una distribución de excedentes para el año fiscal ${fiscalYear}`,
                ERROR_CODES.DUPLICATE_ENTRY,
                409
            );
        }

        // 2. Get eligible members
        const eligibleMembers = await surplusRepository.getEligibleMembers(
            cooperativeId,
            fiscalYear,
            client
        );

        if (eligibleMembers.length === 0) {
            throw new SurplusError(
                'No hay miembros elegibles para distribución',
                ERROR_CODES.NOT_FOUND,
                404
            );
        }

        // 3. Get total contributions
        const totalContributions = await surplusRepository.getTotalContributions(
            cooperativeId,
            fiscalYear,
            client
        );

        if (totalContributions === 0) {
            throw new SurplusError(
                'No hay aportaciones para este año fiscal',
                ERROR_CODES.INVALID_OPERATION,
                400
            );
        }

        // 4. Distribute to each member
        const results = [];

        for (const member of eligibleMembers) {
            const memberContributions = await surplusRepository.getMemberContributions(
                member.member_id,
                fiscalYear,
                client
            );

            if (memberContributions > 0) {
                // Calculate surplus amount
                const surplusAmount = (memberContributions / totalContributions) * totalDistributableAmount;
                const roundedAmount = Math.round(surplusAmount * 100) / 100;

                // Get surplus account
                const surplusAccount = await surplusRepository.getSurplusAccount(member.member_id, client);

                if (!surplusAccount) {
                    logger.warn(`Member ${member.member_id} has no surplus account, skipping`);
                    continue;
                }

                // Create transaction (NO receipt)
                const transactionId = await surplusRepository.createSurplusTransaction({
                    accountId: surplusAccount.account_id,
                    amount: roundedAmount,
                    fiscalYear,
                    description: `Distribución de excedentes año fiscal ${fiscalYear}`,
                    createdBy
                }, client);

                // Update balance
                const newBalance = await surplusRepository.updateSurplusBalance(
                    surplusAccount.account_id,
                    roundedAmount,
                    client
                );

                results.push({
                    memberId: member.member_id,
                    memberName: member.full_name,
                    memberCode: member.member_code,
                    contributions: memberContributions,
                    surplusAmount: roundedAmount,
                    newBalance,
                    transactionId
                });
            }
        }

        // 5. Create distribution record
        const distributionRecord = await surplusRepository.createDistributionRecord({
            cooperativeId,
            fiscalYear,
            totalDistributableAmount,
            totalContributions,
            notes,
            createdBy
        }, client);

        await client.query('COMMIT');

        logger.info('Surplus distribution completed', {
            distributionId: distributionRecord.distribution_id,
            fiscalYear,
            totalAmount: totalDistributableAmount,
            membersCount: results.length
        });

        return {
            distributionId: distributionRecord.distribution_id,
            fiscalYear,
            totalDistributableAmount,
            totalContributions,
            membersReceiving: results.length,
            results
        };

    } catch (error) {
        await client.query('ROLLBACK');

        if (error.isOperational) {
            throw error;
        }

        logger.error('Error distributing surplus:', error);
        throw new SurplusError(
            error.message || 'Error al distribuir excedentes',
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    } finally {
        client.release();
    }
};

/**
 * Get distribution history
 */
const getDistributionHistory = async (cooperativeId, filters = {}) => {
    try {
        const history = await surplusRepository.getDistributionHistory(cooperativeId, filters);
        return history;
    } catch (error) {
        logger.error('Error getting distribution history:', error);
        throw new SurplusError(MESSAGES.INTERNAL_ERROR, ERROR_CODES.INTERNAL_ERROR, 500);
    }
};

module.exports = {
    getDistributionPreview,
    distributeSurplus,
    getDistributionHistory,
    SurplusError
};