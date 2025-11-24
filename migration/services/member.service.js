/**
 * Member Service
 * Handles database operations for members
 */

const logger = require('../utils/logger');
const crypto = require('crypto');

/**
 * Generates a unique QR hash for a member
 * @param {string} identification - Member identification
 * @returns {string} QR hash
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
 * Inserts members into the database
 * @param {Object} client - Database client
 * @param {Array} members - Array of member objects
 * @param {number} cooperativeId - Cooperative ID
 * @returns {Array} Array of inserted members with their IDs
 */
async function insertMembers(client, members, cooperativeId) {
    logger.step('💾 Insertando miembros en la base de datos...');

    const insertedMembers = [];
    const errors = [];
    let inserted = 0;

    for (const member of members) {
        try {
            // Generate QR hash
            const qrHash = generateQrHash(member.identification);

            // Map quality: E=Estudiante (1), F=Funcionario (2)
            let qualityId = 1; // Default to Estudiante
            if (member.quality === 'F') {
                qualityId = 2; // Funcionario
            }

            // Map level based on quality and level value
            let levelId = null;
            if (member.quality === 'E') {
                // Estudiante: mapear nivel educativo
                if (member.level && /^[1-6]$/.test(member.level)) {
                    // Grados 1-6
                    levelId = parseInt(member.level); // 1-6 corresponden directamente a level_id
                } else if (member.level && member.level.toUpperCase() === 'TRANSICION') {
                    levelId = 8; // Asumiendo que agregaremos este nivel
                } else if (member.level && member.level.toUpperCase() === 'MATERNO') {
                    levelId = 9; // Asumiendo que agregaremos este nivel
                }
                // Si no tiene nivel definido, dejarlo null para asignación manual
            } else if (member.quality === 'F') {
                // Funcionario: nivel = No Aplica
                levelId = 7; // not_applicable
            }

            const query = `
                INSERT INTO members (
                    cooperative_id,
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
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING member_id, identification, full_name
            `;

            const values = [
                cooperativeId,
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

            const result = await client.query(query, values);

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

            // If it's a duplicate error, log and continue
            if (error.code === '23505') { // Unique violation
                logger.warning(`Miembro duplicado omitido: ${member.identification}`);
            } else {
                logger.error(`Error insertando miembro ${member.identification}: ${error.message}`);
            }
        }
    }

    if (errors.length > 0) {
        logger.warning(`${errors.length} miembros no pudieron ser insertados`);
    }

    logger.success(`${insertedMembers.length} miembros insertados correctamente`);

    return insertedMembers;
}

/**
 * Creates a map of identification to member ID for quick lookups
 * @param {Array} members - Array of member objects
 * @returns {Map} Map of identification to member ID
 */
function createIdentificationMap(members) {
    const map = new Map();

    members.forEach(member => {
        map.set(member.identification, member.memberId);

        // Also map by member code if it exists
        if (member.memberCode) {
            map.set(member.memberCode, member.memberId);
        }
    });

    return map;
}

/**
 * Gets existing members from database
 * @param {Object} client - Database client
 * @param {number} cooperativeId - Cooperative ID
 * @returns {Array} Array of existing members
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
