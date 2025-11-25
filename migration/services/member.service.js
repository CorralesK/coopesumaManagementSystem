/**
 * Member Service
 * Handles database operations for cooperative members during migration
 */

const logger = require('../utils/logger');
const crypto = require('crypto');

/**
 * Generates a unique QR hash for member identification
 * @param {string} identification - Member national ID
 * @returns {string} SHA-256 hash for QR code generation
 */
function generateQrHash(identification) {
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(8).toString('hex');
    return crypto
        .createHash('sha256')
        .update(`${identification}-${timestamp}-${randomBytes}`)
        .digest('hex')
        .substring(0, 32);
}

/**
 * Inserts members and their associated user accounts into the database
 * Creates a user account with 'member' role for each cooperative member
 *
 * @param {Object} client - PostgreSQL database client (transaction-aware)
 * @param {Array} members - Array of member objects from Excel data
 * @param {number} cooperativeId - ID of the cooperative
 * @returns {Promise<Array>} Array of inserted members with their database IDs
 */
async function insertMembers(client, members, cooperativeId) {
    logger.step('💾 Insertando miembros en la base de datos...');

    const insertedMembers = [];
    const errors = [];
    let inserted = 0;

    for (const member of members) {
        try {
            // Generate unique QR hash for member identification
            const qrHash = generateQrHash(member.identification);

            // Map member quality: E=Student (1), F=Staff (2)
            let qualityId = 1; // Default to student
            if (member.quality === 'F') {
                qualityId = 2; // Staff member
            }

            // Map educational level based on quality and grade
            let levelId = null;
            if (member.quality === 'E') {
                // Student: map educational level
                if (member.level && /^[1-6]$/.test(member.level)) {
                    // Grades 1-6 map directly to level_id
                    levelId = parseInt(member.level);
                } else if (member.level && member.level.toUpperCase() === 'TRANSICION') {
                    levelId = 8; // Transition level
                } else if (member.level && member.level.toUpperCase() === 'MATERNO') {
                    levelId = 9; // Preschool level
                }
                // Leave null if level not specified for manual assignment
            } else if (member.quality === 'F') {
                // Staff: level = Not Applicable
                levelId = 7; // not_applicable
            }

            // 1. Create user account for member with 'member' role
            const userQuery = `
                INSERT INTO users (
                    cooperative_id,
                    full_name,
                    email,
                    role,
                    is_active,
                    created_at,
                    updated_at
                ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING user_id
            `;

            const userValues = [
                cooperativeId,
                member.fullName,
                member.institutionalEmail, // NULL if no institutional email yet
                'member', // Role for cooperative members
                true
            ];

            let userId;
            try {
                const userResult = await client.query(userQuery, userValues);
                userId = userResult.rows[0].user_id;
            } catch (userError) {
                logger.error(`Error creating user for ${member.fullName}: ${userError.message}`);
                throw userError;
            }

            // 2. Create member record linked to user account
            const memberQuery = `
                INSERT INTO members (
                    cooperative_id,
                    user_id,
                    full_name,
                    identification,
                    gender,
                    member_code,
                    quality_id,
                    level_id,
                    institutional_email,
                    qr_hash,
                    affiliation_date,
                    is_active,
                    created_at,
                    updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING member_id, identification, full_name
            `;

            const memberValues = [
                cooperativeId,
                userId, // Link to created user account
                member.fullName,
                member.identification,
                member.gender || null,
                member.memberCode || null,
                qualityId,
                levelId,
                member.institutionalEmail,
                qrHash,
                member.affiliationDate,
                member.isActive
            ];

            const result = await client.query(memberQuery, memberValues);

            insertedMembers.push({
                memberId: result.rows[0].member_id,
                identification: result.rows[0].identification,
                fullName: result.rows[0].full_name,
                memberCode: member.memberCode
            });

            inserted++;
            logger.progress(inserted, members.length, 'Insertando miembros');

        } catch (error) {
            errors.push({
                identification: member.identification,
                error: error.message
            });

            // Handle duplicate member entries
            if (error.code === '23505') { // PostgreSQL unique violation
                logger.warning(`Duplicate member skipped: ${member.identification}`);
            } else {
                logger.error(`Error inserting member ${member.identification}: ${error.message}`);
            }
        }
    }

    if (errors.length > 0) {
        logger.warning(`${errors.length} members could not be inserted`);
    }

    logger.success(`${insertedMembers.length} members inserted successfully`);

    return insertedMembers;
}

/**
 * Creates an identification-to-member-ID lookup map for transaction processing
 * Maps both national ID and member code to member database ID
 *
 * @param {Array} members - Array of inserted member objects
 * @returns {Map<string, number>} Map of identification/code to member_id
 */
function createIdentificationMap(members) {
    const map = new Map();

    members.forEach(member => {
        // Map by national identification number
        map.set(member.identification, member.memberId);

        // Also map by member code if available
        if (member.memberCode) {
            map.set(member.memberCode, member.memberId);
        }
    });

    return map;
}

/**
 * Retrieves existing members from the database for a given cooperative
 *
 * @param {Object} client - PostgreSQL database client
 * @param {number} cooperativeId - ID of the cooperative
 * @returns {Promise<Array>} Array of existing member records
 */
async function getExistingMembers(client, cooperativeId) {
    const query = `
        SELECT member_id, identification, full_name
        FROM members
        WHERE cooperative_id = $1
    `;

    const result = await client.query(query, [cooperativeId]);
    return result.rows;
}

module.exports = {
    insertMembers,
    createIdentificationMap,
    getExistingMembers,
    generateQrHash
};
