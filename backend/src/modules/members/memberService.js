/**
 * Member Service
 * Business logic for member operations
 *
 * @module modules/members/memberService
 */

// Updated to fix QR code generation
const memberRepository = require('./memberRepository');
const userRepository = require('../users/userRepository');
const receiptService = require('../receipts/receiptService');
const liquidationService = require('../liquidations/liquidationService');
const liquidationRepository = require('../liquidations/liquidationRepository');
const { generateQrHash, generateQrCodeDataUrl, generateVerificationUrl } = require('../../utils/qrUtils');
const { verifyInstitutionalEmail } = require('../../utils/emailVerification');
const { USER_ROLES } = require('../../constants/roles');
const ERROR_CODES = require('../../constants/errorCodes');
const MESSAGES = require('../../constants/messages');
const logger = require('../../utils/logger');
const db = require('../../config/database');
const { getNow, getCurrentYear } = require('../../utils/dateUtils');

/**
 * Custom error class for operational errors
 */
class MemberError extends Error {
    constructor(message, errorCode, statusCode) {
        super(message);
        this.errorCode = errorCode;
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}

/**
 * Get member by ID
 *
 * @param {number} memberId - Member ID
 * @returns {Promise<Object>} Member object with QR code
 * @throws {MemberError} If member not found
 */
const getMemberById = async (memberId) => {
    try {
        logger.info('getMemberById called', { memberId });
        const member = await memberRepository.findById(memberId);

        if (!member) {
            throw new MemberError(
                MESSAGES.MEMBER_NOT_FOUND,
                ERROR_CODES.MEMBER_NOT_FOUND,
                404
            );
        }

        logger.info('Member found, checking QR hash', {
            memberId: member.memberId,
            hasQrHash: !!member.qrHash,
            qrHash: member.qrHash
        });

        // Generate QR code image from hash with verification URL
        if (member.qrHash) {
            try {
                logger.info('Generating QR code data URL with verification URL');
                const verificationUrl = generateVerificationUrl(member.qrHash);
                const qrCodeDataUrl = await generateQrCodeDataUrl(verificationUrl);
                logger.info('QR code generated successfully', {
                    dataUrlLength: qrCodeDataUrl?.length,
                    dataUrlPrefix: qrCodeDataUrl?.substring(0, 50),
                    verificationUrl
                });
                member.qrCodeDataUrl = qrCodeDataUrl;
                member.verificationUrl = verificationUrl;
            } catch (qrError) {
                logger.warn('Failed to generate QR code for member', {
                    memberId: member.memberId,
                    error: qrError.message,
                    stack: qrError.stack
                });
                // Don't fail the request if QR generation fails
                member.qrCodeDataUrl = null;
                member.verificationUrl = null;
            }
        } else {
            logger.warn('Member has no QR hash', { memberId: member.memberId });
        }

        logger.info('Returning member with QR', {
            memberId: member.memberId,
            hasQrCodeDataUrl: !!member.qrCodeDataUrl
        });

        return member;
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error getting member by ID:', error);
        throw new MemberError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Get all members with optional filters and pagination (adapted to new structure)
 *
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Object>} Members and pagination info
 */
const getAllMembers = async (filters = {}) => {
    try {
        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 50;
        const offset = (page - 1) * limit;

        const queryFilters = {
            qualityId: filters.qualityId,  // Replaces grade
            levelId: filters.levelId,      // New filter
            isActive: filters.isActive,
            search: filters.search,
            limit,
            offset
        };

        const [members, total] = await Promise.all([
            memberRepository.findAll(queryFilters),
            memberRepository.count(queryFilters)
        ]);

        return {
            members,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        logger.error('Error getting all members:', error);
        throw new MemberError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Create a new member with associated student user account
 * Uses a database transaction to ensure atomicity
 *
 * @param {Object} memberData - Member data including institutionalEmail
 * @returns {Promise<Object>} Created member and user objects
 * @throws {MemberError} If member already exists, email is invalid, or transaction fails
 */
const createMember = async (memberData) => {
    const client = await db.pool.connect();

    try {
        // Begin transaction
        await client.query('BEGIN');

        // Check if member with same identification already exists (using transaction client)
        const checkMemberQuery = 'SELECT member_id FROM members WHERE identification = $1';
        const existingMemberResult = await client.query(checkMemberQuery, [memberData.identification]);

        if (existingMemberResult.rows.length > 0) {
            throw new MemberError(
                MESSAGES.MEMBER_ALREADY_EXISTS,
                ERROR_CODES.MEMBER_ALREADY_EXISTS,
                409
            );
        }

        // Verify institutional email if provided
        if (memberData.institutionalEmail) {
            const emailVerification = await verifyInstitutionalEmail(memberData.institutionalEmail);

            if (!emailVerification.isValid) {
                throw new MemberError(
                    emailVerification.error || 'El correo institucional no es válido',
                    ERROR_CODES.VALIDATION_ERROR,
                    400
                );
            }

            // Check if email is already in use (using transaction client)
            const checkEmailQuery = 'SELECT user_id FROM users WHERE email = $1';
            const existingUserResult = await client.query(checkEmailQuery, [emailVerification.email]);

            if (existingUserResult.rows.length > 0) {
                throw new MemberError(
                    'El correo institucional ya está registrado en el sistema',
                    ERROR_CODES.USER_ALREADY_EXISTS,
                    409
                );
            }

            memberData.institutionalEmail = emailVerification.email;
        }

        // Generate QR hash for the member
        const qrHash = generateQrHash(memberData.identification);

        // Create member with QR hash (using transaction client - adapted to new structure)
        const insertMemberQuery = `
            INSERT INTO members (
                cooperative_id,
                full_name,
                identification,
                quality_id,
                level_id,
                gender,
                member_code,
                user_id,
                institutional_email,
                photo_url,
                qr_hash,
                affiliation_date,
                is_active
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;

        const memberValues = [
            memberData.cooperativeId || 1, // Default to cooperative 1
            memberData.fullName,
            memberData.identification,
            memberData.qualityId || 1,  // Default: Student
            memberData.levelId || null, // Can be NULL
            memberData.gender || null,  // M/F or NULL
            memberData.memberCode || null,  // Unique code
            null,  // user_id - will be linked later if needed
            memberData.institutionalEmail || null,
            memberData.photoUrl || null,
            qrHash,
            memberData.affiliationDate || getNow(),
            true
        ];

        const memberResult = await client.query(insertMemberQuery, memberValues);
        const newMember = memberResult.rows[0];

        let newUser = null;

        // Create student user account if institutional email was provided (using transaction client)
        if (memberData.institutionalEmail) {
            const insertUserQuery = `
                INSERT INTO users (
                    full_name,
                    email,
                    microsoft_id,
                    role,
                    is_active,
                    cooperative_id
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING
                    user_id,
                    full_name,
                    email,
                    role,
                    is_active,
                    cooperative_id,
                    created_at
            `;

            const userValues = [
                memberData.fullName,
                memberData.institutionalEmail,
                null,  // microsoft_id will be set when member logs in
                USER_ROLES.MEMBER,  // Updated from STUDENT to MEMBER
                true,
                memberData.cooperativeId || 1 // Default to cooperative 1
            ];

            try {
                const userResult = await client.query(insertUserQuery, userValues);
                newUser = userResult.rows[0];

                logger.info('Student user created successfully', {
                    userId: newUser.user_id,
                    email: newUser.email,
                    memberId: newMember.member_id
                });
            } catch (userError) {
                logger.error('Error creating student user:', userError);
                // If user creation fails, throw error to rollback the transaction
                throw new MemberError(
                    'No se pudo crear la cuenta de usuario para el estudiante. Por favor, verifique que el correo institucional sea válido.',
                    ERROR_CODES.INTERNAL_ERROR,
                    500
                );
            }
        }

        // Commit transaction
        await client.query('COMMIT');

        logger.info('Member and user created successfully', {
            memberId: newMember.member_id,
            identification: newMember.identification,
            hasUser: !!newUser,
            userId: newUser?.user_id
        });

        return {
            member: newMember,
            user: newUser
        };
    } catch (error) {
        // Rollback transaction on any error
        await client.query('ROLLBACK');

        logger.error('Transaction rolled back due to error', {
            error: error.message,
            stack: error.stack
        });

        if (error.isOperational) {
            throw error;
        }

        logger.error('Error creating member:', error);
        throw new MemberError(
            error.message || 'Error al crear el miembro. Por favor intente nuevamente.',
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    } finally {
        // Release the client back to the pool
        client.release();
    }
};

/**
 * Update member information
 *
 * @param {number} memberId - Member ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated member object
 * @throws {MemberError} If member not found or validation fails
 */
const updateMember = async (memberId, updates) => {
    try {
        // Check if member exists
        const member = await memberRepository.findById(memberId);

        if (!member) {
            throw new MemberError(
                MESSAGES.MEMBER_NOT_FOUND,
                ERROR_CODES.MEMBER_NOT_FOUND,
                404
            );
        }

        // If identification is being updated, check for duplicates
        if (updates.identification && updates.identification !== member.identification) {
            const existingMember = await memberRepository.findByIdentification(
                updates.identification
            );

            if (existingMember) {
                throw new MemberError(
                    MESSAGES.MEMBER_ALREADY_EXISTS,
                    ERROR_CODES.MEMBER_ALREADY_EXISTS,
                    409
                );
            }
        }

        // If institutional email is being updated, verify it
        if (updates.institutionalEmail && updates.institutionalEmail !== member.institutionalEmail) {
            const emailVerification = await verifyInstitutionalEmail(updates.institutionalEmail);

            if (!emailVerification.isValid) {
                throw new MemberError(
                    emailVerification.error || 'El correo institucional no es válido',
                    ERROR_CODES.VALIDATION_ERROR,
                    400
                );
            }

            // Update to the verified email
            updates.institutionalEmail = emailVerification.email;

            // Check if email is already in use by another user
            const existingUser = await userRepository.findByEmail(emailVerification.email);
            if (existingUser && existingUser.userId !== member.userId) {
                throw new MemberError(
                    'El correo institucional ya está registrado en el sistema',
                    ERROR_CODES.USER_ALREADY_EXISTS,
                    409
                );
            }

            // Update user email if member has a linked user account
            if (member.userId) {
                try {
                    await userRepository.update(member.userId, {
                        email: emailVerification.email,
                        full_name: updates.fullName || member.fullName
                    });
                    logger.info('User email updated along with member', {
                        userId: member.userId,
                        newEmail: emailVerification.email
                    });
                } catch (userUpdateError) {
                    logger.error('Error updating user email:', userUpdateError);
                    // Don't fail the member update if user update fails
                }
            }
        }

        // Convert camelCase to snake_case for database
        const dbUpdates = {};
        if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
        if (updates.identification !== undefined) dbUpdates.identification = updates.identification;
        if (updates.qualityId !== undefined) dbUpdates.quality_id = updates.qualityId;
        if (updates.levelId !== undefined) dbUpdates.level_id = updates.levelId;
        if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
        if (updates.institutionalEmail !== undefined) dbUpdates.institutional_email = updates.institutionalEmail;
        if (updates.photoUrl !== undefined) dbUpdates.photo_url = updates.photoUrl;
        if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

        // Update member
        const updatedMember = await memberRepository.update(memberId, dbUpdates);

        logger.info('Member updated successfully', {
            memberId: updatedMember.memberId
        });

        return updatedMember;
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error updating member:', error);
        throw new MemberError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Delete member (soft delete) with liquidation by exit
 * Executes liquidation of savings account before deactivating member and user
 *
 * @param {number} memberId - Member ID
 * @param {number} processedBy - User ID processing the deletion
 * @returns {Promise<Object>} Result with liquidation info
 * @throws {MemberError} If member not found or liquidation fails
 */
const deleteMember = async (memberId, processedBy = 1) => {
    try {
        // Check if member exists
        const member = await memberRepository.findById(memberId);

        if (!member) {
            throw new MemberError(
                MESSAGES.MEMBER_NOT_FOUND,
                ERROR_CODES.MEMBER_NOT_FOUND,
                404
            );
        }

        // Check if member is already inactive
        if (!member.isActive) {
            throw new MemberError(
                MESSAGES.MEMBER_INACTIVE,
                ERROR_CODES.MEMBER_INACTIVE,
                400
            );
        }

        // Get savings balance
        const balances = await liquidationRepository.getAccountBalances(memberId);
        const savingsBalance = balances.savings.balance;

        let liquidationResult = null;

        // Always execute liquidation (even with zero balance) to generate receipt as proof
        try {
            const results = await liquidationService.executeLiquidation({
                memberIds: [memberId],
                liquidationType: 'exit',
                memberContinues: false,
                notes: savingsBalance > 0
                    ? 'Liquidación automática por eliminación de miembro'
                    : 'Liquidación automática por eliminación de miembro (saldo ₡0.00)',
                processedBy
            });

            liquidationResult = results[0];

            logger.info('Member deleted with liquidation', {
                memberId,
                liquidationId: liquidationResult?.liquidationId,
                totalLiquidated: liquidationResult?.totalLiquidated,
                hadBalance: savingsBalance > 0
            });
        } catch (liquidationError) {
            logger.error('Error executing liquidation during member deletion:', liquidationError);
            throw new MemberError(
                MESSAGES.LIQUIDATION_ERROR,
                ERROR_CODES.INTERNAL_ERROR,
                500
            );
        }

        return {
            success: true,
            memberId,
            memberName: member.fullName,
            hadBalance: savingsBalance > 0,
            liquidation: liquidationResult,
            message: MESSAGES.LIQUIDATION_MEMBER_DEACTIVATED
        };
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error deleting member:', error);
        throw new MemberError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Generate QR code for a member
 *
 * @param {number} memberId - Member ID
 * @returns {Promise<Object>} QR code data (base64 image)
 * @throws {MemberError} If member not found
 */
const generateMemberQr = async (memberId) => {
    try {
        // Get member
        const member = await memberRepository.findById(memberId);

        if (!member) {
            throw new MemberError(
                MESSAGES.MEMBER_NOT_FOUND,
                ERROR_CODES.MEMBER_NOT_FOUND,
                404
            );
        }

        // Check if member has QR hash
        if (!member.qrHash) {
            throw new MemberError(
                'El miembro no tiene un código QR generado',
                ERROR_CODES.MEMBER_NOT_FOUND,
                404
            );
        }

        // Generate verification URL and QR code image
        const verificationUrl = generateVerificationUrl(member.qrHash);
        const qrCodeDataUrl = await generateQrCodeDataUrl(verificationUrl);

        logger.info('QR code generated for member', {
            memberId: member.memberId,
            verificationUrl
        });

        return {
            memberId: member.memberId,
            fullName: member.fullName,
            identification: member.identification,
            qualityId: member.qualityId,
            qualityCode: member.qualityCode,
            qualityName: member.qualityName,
            levelId: member.levelId,
            levelCode: member.levelCode,
            levelName: member.levelName,
            gender: member.gender,
            memberCode: member.memberCode,
            photoUrl: member.photoUrl,
            qrHash: member.qrHash,
            verificationUrl,
            qrCodeDataUrl // Base64 encoded data URL
        };
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error generating QR code:', error);
        throw new MemberError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Regenerate QR code for a member
 * Useful if QR code is compromised or needs to be changed
 *
 * @param {number} memberId - Member ID
 * @returns {Promise<Object>} Updated member with new QR code
 * @throws {MemberError} If member not found
 */
const regenerateMemberQr = async (memberId) => {
    try {
        // Get member
        const member = await memberRepository.findById(memberId);

        if (!member) {
            throw new MemberError(
                MESSAGES.MEMBER_NOT_FOUND,
                ERROR_CODES.MEMBER_NOT_FOUND,
                404
            );
        }

        // Generate new QR hash (add timestamp to make it unique)
        const qrHash = generateQrHash(`${member.identification}-${Date.now()}`);

        // Update member with new QR hash
        const updatedMember = await memberRepository.updateQrHash(memberId, qrHash);

        // Generate verification URL and new QR code image
        const verificationUrl = generateVerificationUrl(qrHash);
        const qrCodeDataUrl = await generateQrCodeDataUrl(verificationUrl);

        // Add QR code data URL and verification URL to the member object
        updatedMember.qrCodeDataUrl = qrCodeDataUrl;
        updatedMember.verificationUrl = verificationUrl;

        logger.info('QR code regenerated for member', {
            memberId: updatedMember.member_id
        });

        return updatedMember;
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error regenerating QR code:', error);
        throw new MemberError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Generate QR codes for multiple members (batch)
 *
 * @param {Array<number>} memberIds - Array of member IDs
 * @returns {Promise<Array>} Array of QR code data
 */
const generateBatchQrCodes = async (memberIds) => {
    try {
        const qrCodes = [];

        for (const memberId of memberIds) {
            try {
                const qrData = await generateMemberQr(memberId);
                qrCodes.push(qrData);
            } catch (error) {
                // Log error but continue with other members
                logger.warn('Failed to generate QR for member', {
                    memberId,
                    error: error.message
                });

                qrCodes.push({
                    memberId,
                    error: error.message
                });
            }
        }

        logger.info('Batch QR generation completed', {
            total: memberIds.length,
            successful: qrCodes.filter(qr => !qr.error).length,
            failed: qrCodes.filter(qr => qr.error).length
        });

        return qrCodes;
    } catch (error) {
        logger.error('Error generating batch QR codes:', error);
        throw new MemberError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Verify member by QR hash
 * Used during attendance scanning
 *
 * @param {string} qrHash - QR hash scanned
 * @returns {Promise<Object>} Member object if found and active
 * @throws {MemberError} If QR invalid or member inactive
 */
const verifyMemberByQr = async (qrHash) => {
    try {
        // Find member by QR hash
        const member = await memberRepository.findByQrHash(qrHash);

        if (!member) {
            throw new MemberError(
                MESSAGES.INVALID_QR,
                ERROR_CODES.INVALID_QR_CODE,
                404
            );
        }

        // Check if member is active
        if (!member.isActive) {
            throw new MemberError(
                MESSAGES.MEMBER_INACTIVE,
                ERROR_CODES.MEMBER_INACTIVE,
                403
            );
        }

        logger.info('Member verified by QR', {
            memberId: member.member_id,
            identification: member.identification
        });

        return member;
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error verifying member by QR:', error);
        throw new MemberError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Public verification of member by QR hash
 * Accessible without authentication for public verification
 * Returns only basic member information for privacy
 *
 * @param {string} qrHash - QR hash scanned
 * @returns {Promise<Object>} Basic member information
 * @throws {MemberError} If QR invalid
 */
const publicVerifyMember = async (qrHash) => {
    try {
        // Find member by QR hash
        const member = await memberRepository.findByQrHash(qrHash);

        if (!member) {
            throw new MemberError(
                'El código QR escaneado no corresponde a ningún miembro registrado en la cooperativa',
                ERROR_CODES.INVALID_QR_CODE,
                404
            );
        }

        logger.info('Public member verification', {
            memberId: member.member_id,
            isActive: member.is_active
        });

        // Return only public information (adapted to new structure)
        return {
            fullName: member.full_name,
            identification: member.identification,
            qualityName: member.quality_name,
            levelName: member.level_name,
            photoUrl: member.photo_url,
            isActive: member.is_active
        };
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error in public member verification:', error);
        throw new MemberError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Get member dashboard data
 * Returns comprehensive dashboard data for logged-in member
 *
 * @param {number} userId - User ID from authentication
 * @returns {Promise<Object>} Dashboard data with member, accounts, transactions, and contribution status
 * @throws {MemberError} If member not found or not linked to user
 */
const getMemberDashboard = async (userId) => {
    try {
        // 1. Get member linked to this user
        const member = await memberRepository.findByUserId(userId);

        if (!member) {
            throw new MemberError(
                'No se encontró un miembro vinculado a este usuario',
                ERROR_CODES.MEMBER_NOT_FOUND,
                404
            );
        }

        // 2. Get savings account only (contributions and surplus not implemented yet)
        const accountsQuery = `
            SELECT
                a.account_id,
                a.account_type,
                a.current_balance,
                a.last_fiscal_year_balance,
                a.created_at,
                a.updated_at
            FROM accounts a
            WHERE a.member_id = $1
                AND a.account_type = 'savings'
        `;

        const accountsResult = await db.query(accountsQuery, [member.member_id]);
        const accounts = accountsResult.rows.map(acc => ({
            accountId: acc.account_id,
            accountType: acc.account_type,
            currentBalance: parseFloat(acc.current_balance || 0),
            lastFiscalYearBalance: parseFloat(acc.last_fiscal_year_balance || 0),
            displayName: getAccountDisplayName(acc.account_type),
            available: true
        }));

        // 3. Get recent savings transactions only (last 10)
        const transactionsQuery = `
            SELECT
                t.transaction_id,
                t.account_id,
                a.account_type,
                t.transaction_type,
                t.amount,
                t.transaction_date,
                t.fiscal_year,
                t.description,
                t.status,
                t.created_at
            FROM transactions t
            JOIN accounts a ON t.account_id = a.account_id
            WHERE a.member_id = $1
                AND a.account_type = 'savings'
                AND t.status = 'completed'
            ORDER BY t.transaction_date DESC, t.created_at DESC
            LIMIT 10
        `;

        const transactionsResult = await db.query(transactionsQuery, [member.member_id]);
        const recentTransactions = transactionsResult.rows.map(tx => ({
            transactionId: tx.transaction_id,
            accountType: tx.account_type,
            accountDisplayName: getAccountDisplayName(tx.account_type),
            transactionType: tx.transaction_type,
            amount: parseFloat(tx.amount),
            transactionDate: tx.transaction_date,
            fiscalYear: tx.fiscal_year,
            description: tx.description,
            status: tx.status
        }));

        // 4. Contribution status - DISABLED (not implemented yet)
        // TODO: Uncomment when contributions/surplus features are implemented
        /*
        const currentFiscalYear = await getCurrentFiscalYear();

        const contributionStatusQuery = `
            SELECT
                cd.fiscal_year,
                COUNT(DISTINCT cd.tract_id) AS tracts_paid,
                SUM(cd.amount) AS total_contributed,
                ARRAY_AGG(cp.tract_name ORDER BY cp.start_date) AS paid_tracts
            FROM accounts a
            LEFT JOIN contributions_detail cd ON a.account_id = cd.account_id
            LEFT JOIN contribution_periods cp ON cd.tract_id = cp.period_id
            WHERE a.member_id = $1
                AND a.account_type = 'contributions'
                AND cd.fiscal_year = $2
            GROUP BY cd.fiscal_year
        `;

        const contributionResult = await db.query(contributionStatusQuery, [
            member.member_id,
            currentFiscalYear
        ]);

        // Get all tracts for the current fiscal year
        const tractsQuery = `
            SELECT period_id, tract_name, required_amount, start_date, end_date
            FROM contribution_periods
            WHERE fiscal_year = $1
            ORDER BY start_date
        `;
        const tractsResult = await db.query(tractsQuery, [currentFiscalYear]);
        const allTracts = tractsResult.rows;

        let contributionStatus = {
            fiscalYear: currentFiscalYear,
            tractsPaid: 0,
            tractsRequired: allTracts.length,
            totalContributed: 0.00,
            paidTracts: [],
            pendingTracts: allTracts.map(t => t.tract_name),
            isComplete: false
        };

        if (contributionResult.rows.length > 0) {
            const contribData = contributionResult.rows[0];
            const paidTracts = contribData.paid_tracts || [];

            contributionStatus = {
                fiscalYear: currentFiscalYear,
                tractsPaid: parseInt(contribData.tracts_paid) || 0,
                tractsRequired: allTracts.length,
                totalContributed: parseFloat(contribData.total_contributed) || 0.00,
                paidTracts: paidTracts,
                pendingTracts: allTracts
                    .filter(t => !paidTracts.includes(t.tract_name))
                    .map(t => t.tract_name),
                isComplete: (parseInt(contribData.tracts_paid) || 0) >= allTracts.length
            };
        }
        */
        const contributionStatus = null;

        // 5. Get pending withdrawal requests (if any)
        const pendingRequestsQuery = `
            SELECT
                wr.request_id,
                wr.account_id,
                a.account_type,
                wr.amount,
                wr.reason,
                wr.status,
                wr.requested_at,
                wr.transfer_to_account_type
            FROM withdrawal_requests wr
            JOIN accounts a ON wr.account_id = a.account_id
            WHERE a.member_id = $1
                AND wr.status = 'pending'
            ORDER BY wr.requested_at DESC
        `;

        const pendingRequestsResult = await db.query(pendingRequestsQuery, [member.member_id]);
        const pendingRequests = pendingRequestsResult.rows.map(req => ({
            requestId: req.request_id,
            accountType: req.account_type,
            accountDisplayName: getAccountDisplayName(req.account_type),
            amount: parseFloat(req.amount),
            reason: req.reason,
            status: req.status,
            requestedAt: req.requested_at,
            transferTo: req.transfer_to_account_type ? getAccountDisplayName(req.transfer_to_account_type) : null
        }));

        // 6. Return dashboard data
        return {
            member: {
                memberId: member.member_id,
                fullName: member.full_name,
                memberCode: member.member_code,
                identification: member.identification,
                gender: member.gender,
                qualityId: member.quality_id,
                qualityCode: member.quality_code,
                qualityName: member.quality_name,
                levelId: member.level_id,
                levelCode: member.level_code,
                levelName: member.level_name,
                institutionalEmail: member.institutional_email,
                affiliationDate: member.affiliation_date,
                lastLiquidationDate: member.last_liquidation_date,
                isActive: member.is_active,
                photoUrl: member.photo_url
            },
            accounts,
            recentTransactions,
            // contributionStatus - disabled (not implemented yet)
            pendingRequests
        };

    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error getting member dashboard:', error);
        throw new MemberError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Helper function to get display name for account types
 */
const getAccountDisplayName = (accountType) => {
    const displayNames = {
        'savings': 'Ahorros',
        'contributions': 'Aportaciones',
        'surplus': 'Excedentes',
        'affiliation': 'Afiliación'
    };
    return displayNames[accountType] || accountType;
};

/**
 * Helper function to get current fiscal year
 * Falls back to current year if get_fiscal_year function doesn't exist
 */
const getCurrentFiscalYear = async () => {
    try {
        const result = await db.query('SELECT get_fiscal_year(CURRENT_DATE) AS fiscal_year');
        return result.rows[0]?.fiscal_year || new Date().getFullYear();
    } catch (error) {
        // Fallback to current year if function doesn't exist
        logger.warn('get_fiscal_year function not found, using current year');
        return new Date().getFullYear();
    }
};

/**
 * Affiliate a new member with receipt generation
 * Creates member, user account, 4 financial accounts, and processes affiliation fee
 *
 * @param {Object} memberData - Member affiliation data
 * @returns {Promise<Object>} Affiliation result with receipt data
 * @throws {MemberError} If validation fails or database error occurs
 */
const affiliateMember = async (memberData) => {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        if (!memberData.fullName || !memberData.identification) {
            throw new MemberError(
                MESSAGES.REQUIRED_FIELD,
                ERROR_CODES.VALIDATION_ERROR,
                400
            );
        }

        if (memberData.qualityId === 1 && !memberData.levelId) {
            throw new MemberError(
                MESSAGES.STUDENT_REQUIRES_LEVEL,
                ERROR_CODES.VALIDATION_ERROR,
                400
            );
        }

        if (memberData.qualityId === 2) {
            memberData.levelId = 7;
        }

        const checkMemberQuery = 'SELECT member_id FROM members WHERE identification = $1';
        const existingMemberResult = await client.query(checkMemberQuery, [memberData.identification]);

        if (existingMemberResult.rows.length > 0) {
            throw new MemberError(
                MESSAGES.MEMBER_ALREADY_EXISTS,
                ERROR_CODES.MEMBER_ALREADY_EXISTS,
                409
            );
        }

        if (memberData.institutionalEmail) {
            const emailVerification = await verifyInstitutionalEmail(memberData.institutionalEmail);

            if (!emailVerification.isValid) {
                throw new MemberError(
                    emailVerification.error || MESSAGES.INVALID_EMAIL,
                    ERROR_CODES.VALIDATION_ERROR,
                    400
                );
            }

            const checkEmailQuery = 'SELECT user_id FROM users WHERE email = $1';
            const existingUserResult = await client.query(checkEmailQuery, [emailVerification.email]);

            if (existingUserResult.rows.length > 0) {
                throw new MemberError(
                    MESSAGES.EMAIL_ALREADY_EXISTS,
                    ERROR_CODES.USER_ALREADY_EXISTS,
                    409
                );
            }

            memberData.institutionalEmail = emailVerification.email;
        }

        const qrHash = generateQrHash(memberData.identification);

        // Get next consecutive within the transaction to prevent race conditions
        const nextConsecutive = await memberRepository.getNextMemberCodeConsecutive(client);
        const currentYearValue = getCurrentYear();
        const memberCode = `${nextConsecutive}-${currentYearValue}`;

        logger.info('Generated member code', {
            consecutive: nextConsecutive,
            year: currentYearValue,
            memberCode
        });

        const fiscalYearResult = await client.query('SELECT get_fiscal_year(CURRENT_DATE) AS fiscal_year');
        const currentFiscalYear = fiscalYearResult.rows[0].fiscal_year;
        const insertMemberQuery = `
            INSERT INTO members (
                cooperative_id,
                full_name,
                identification,
                quality_id,
                level_id,
                gender,
                member_code,
                user_id,
                institutional_email,
                photo_url,
                qr_hash,
                affiliation_date,
                is_active
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;

        const memberValues = [
            memberData.cooperativeId || 1,
            memberData.fullName,
            memberData.identification,
            memberData.qualityId,
            memberData.levelId,
            memberData.gender || null,
            memberCode,
            null,  // user_id - will be linked if email provided
            memberData.institutionalEmail || null,
            memberData.photoUrl || null,
            qrHash,
            memberData.affiliationDate || getNow(),
            true
        ];

        const memberResult = await client.query(insertMemberQuery, memberValues);
        const newMember = memberResult.rows[0];

        logger.info('Member created', { memberId: newMember.member_id, memberCode });

        const accountTypes = ['savings', 'contributions', 'surplus', 'affiliation'];
        const createdAccounts = {};

        for (const accountType of accountTypes) {
            const insertAccountQuery = `
                INSERT INTO accounts (member_id, cooperative_id, account_type, current_balance)
                VALUES ($1, $2, $3, 0.00)
                RETURNING account_id, account_type
            `;

            const accountResult = await client.query(insertAccountQuery, [
                newMember.member_id,
                memberData.cooperativeId || 1,
                accountType
            ]);

            createdAccounts[accountType] = accountResult.rows[0];
            logger.info(`Account created: ${accountType}`, { accountId: accountResult.rows[0].account_id });
        }

        let affiliationTransaction = null;
        const affiliationFee = memberData.affiliationFee || 500.00;

        if (affiliationFee > 0) {
            const insertTransactionQuery = `
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
                VALUES ($1, $2, $3, CURRENT_DATE, $4, $5, 'completed', $6)
                RETURNING *
            `;

            const transactionResult = await client.query(insertTransactionQuery, [
                createdAccounts.affiliation.account_id,
                'deposit',
                affiliationFee,
                currentFiscalYear,
                `Cuota de afiliación - ${memberData.fullName}`,
                memberData.createdBy || 1  // Use provided createdBy or default to system user (1)
            ]);

            affiliationTransaction = transactionResult.rows[0];

            const updateBalanceQuery = `
                UPDATE accounts
                SET current_balance = current_balance + $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE account_id = $2
            `;

            await client.query(updateBalanceQuery, [
                affiliationFee,
                createdAccounts.affiliation.account_id
            ]);

            logger.info('Affiliation fee processed', {
                transactionId: affiliationTransaction.transaction_id,
                amount: affiliationFee
            });

            // Generate receipt for affiliation transaction
            try {
                const receipt = await receiptService.generateReceiptForTransaction({
                    transactionId: affiliationTransaction.transaction_id,
                    previousBalance: 0,
                    client
                });

                logger.info('Affiliation receipt generated', {
                    receiptId: receipt.receipt_id,
                    receiptNumber: receipt.receipt_number
                });

                // Store receipt info to return
                affiliationTransaction.receipt = receipt;
            } catch (receiptError) {
                logger.error('Error generating affiliation receipt', {
                    error: receiptError.message,
                    transactionId: affiliationTransaction.transaction_id
                });
                // Don't fail the entire affiliation if receipt generation fails
                // The receipt can be regenerated later if needed
            }
        }

        let newUser = null;

        if (memberData.institutionalEmail) {
            const insertUserQuery = `
                INSERT INTO users (
                    full_name,
                    email,
                    microsoft_id,
                    role,
                    is_active,
                    cooperative_id,
                    created_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
                RETURNING *
            `;

            const userValues = [
                memberData.fullName,
                memberData.institutionalEmail,
                null,
                USER_ROLES.MEMBER,
                true,
                memberData.cooperativeId || 1
            ];

            const userResult = await client.query(insertUserQuery, userValues);
            newUser = userResult.rows[0];

            await client.query(
                'UPDATE members SET user_id = $1 WHERE member_id = $2',
                [newUser.user_id, newMember.member_id]
            );

            logger.info('User created and linked to member', {
                userId: newUser.user_id,
                memberId: newMember.member_id
            });
        }

        await client.query('COMMIT');

        logger.info('Member affiliation completed successfully', {
            memberId: newMember.member_id,
            identification: newMember.identification,
            hasUser: !!newUser
        });
        return {
            member: newMember,
            user: newUser,
            accounts: createdAccounts,
            affiliationTransaction,
            receipt: {
                receiptNumber: `AF-${newMember.member_id}-${currentFiscalYear}`,
                date: getNow(),
                memberName: newMember.full_name,
                memberCode: newMember.member_code,
                identification: newMember.identification,
                amount: affiliationFee,
                fiscalYear: currentFiscalYear,
                description: 'Cuota de Afiliación'
            }
        };

    } catch (error) {
        // Rollback transaction on error
        await client.query('ROLLBACK');

        logger.error('Transaction rolled back due to error', {
            error: error.message,
            stack: error.stack,
            code: error.code
        });

        // If it's already an operational error, just throw it
        if (error.isOperational) {
            throw error;
        }

        // Handle PostgreSQL unique constraint violations
        if (error.code === '23505') {
            if (error.constraint === 'members_member_code_key') {
                throw new MemberError(
                    MESSAGES.MEMBER_CODE_DUPLICATE,
                    ERROR_CODES.MEMBER_ALREADY_EXISTS,
                    409
                );
            }
            if (error.constraint === 'members_identification_key') {
                throw new MemberError(
                    MESSAGES.MEMBER_ALREADY_EXISTS,
                    ERROR_CODES.MEMBER_ALREADY_EXISTS,
                    409
                );
            }
        }

        // Handle other database errors
        logger.error('Unexpected error affiliating member:', error);
        throw new MemberError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    } finally {
        client.release();
    }
};

module.exports = {
    getMemberById,
    getAllMembers,
    createMember,
    updateMember,
    deleteMember,
    generateMemberQr,
    regenerateMemberQr,
    generateBatchQrCodes,
    verifyMemberByQr,
    publicVerifyMember,
    getMemberDashboard,
    affiliateMember,
    MemberError
};
