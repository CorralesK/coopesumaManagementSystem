/**
 * Account Service
 * Handles database operations for accounts
 */

const logger = require('../utils/logger');

/**
 * Creates accounts for a member (savings and contributions)
 * @param {Object} client - Database client
 * @param {number} memberId - Member ID
 * @param {number} cooperativeId - Cooperative ID
 * @returns {Object} Created account IDs
 */
async function createAccountsForMember(client, memberId, cooperativeId, includesSurplus = false) {
    const accountTypes = includesSurplus
        ? ['savings', 'contributions', 'surplus']
        : ['savings', 'contributions'];
    const createdAccounts = {};

    for (const accountType of accountTypes) {
        try {
            const query = `
                INSERT INTO accounts (
                    member_id,
                    cooperative_id,
                    account_type,
                    current_balance,
                    created_at,
                    updated_at
                ) VALUES ($1, $2, $3, 0.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING account_id
            `;

            const result = await client.query(query, [memberId, cooperativeId, accountType]);
            createdAccounts[accountType] = result.rows[0].account_id;

        } catch (error) {
            // If account already exists, try to get its ID
            if (error.code === '23505') { // Unique violation
                const selectQuery = `
                    SELECT account_id
                    FROM accounts
                    WHERE member_id = $1 AND account_type = $2
                `;
                const result = await client.query(selectQuery, [memberId, accountType]);
                if (result.rows.length > 0) {
                    createdAccounts[accountType] = result.rows[0].account_id;
                }
            } else {
                throw error;
            }
        }
    }

    return createdAccounts;
}

/**
 * Creates accounts for all members
 * @param {Object} client - Database client
 * @param {Array} members - Array of member objects with member_id
 * @param {number} cooperativeId - Cooperative ID
 * @param {boolean} includeSurplus - Whether to create surplus accounts
 * @returns {number} Total accounts created
 */
async function createAccounts(client, members, cooperativeId, includeSurplus = false) {
    const accountLabel = includeSurplus ? 'cuentas (incluye excedentes)' : 'cuentas';
    logger.step(`🏦 Creando ${accountLabel} para los miembros...`);

    let totalCreated = 0;
    const errors = [];

    for (let i = 0; i < members.length; i++) {
        const member = members[i];

        try {
            const accounts = await createAccountsForMember(client, member.memberId, cooperativeId, includeSurplus);

            // Store account IDs in member object for later use
            member.savingsAccountId = accounts.savings;
            member.contributionsAccountId = accounts.contributions;
            if (includeSurplus) {
                member.surplusAccountId = accounts.surplus;
            }

            totalCreated += Object.keys(accounts).length;
            logger.progress(i + 1, members.length, 'Creando cuentas');

        } catch (error) {
            errors.push({
                memberId: member.memberId,
                error: error.message
            });
            logger.error(`Error creando cuentas para miembro ${member.memberId}: ${error.message}`);
        }
    }

    if (errors.length > 0) {
        logger.warning(`${errors.length} miembros tuvieron errores al crear cuentas`);
    }

    logger.success(`${totalCreated} cuentas creadas correctamente`);

    return totalCreated;
}

/**
 * Gets account ID for a member and account type
 * @param {Object} client - Database client
 * @param {number} memberId - Member ID
 * @param {string} accountType - Account type (savings, contributions)
 * @returns {number|null} Account ID or null if not found
 */
async function getAccountId(client, memberId, accountType) {
    const query = `
        SELECT account_id
        FROM accounts
        WHERE member_id = $1 AND account_type = $2
    `;

    const result = await client.query(query, [memberId, accountType]);

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0].account_id;
}

module.exports = {
    createAccountsForMember,
    createAccounts,
    getAccountId
};
