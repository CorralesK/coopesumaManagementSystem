/**
 * Member Service
 * Business logic for member operations
 *
 * @module modules/members/memberService
 */

// Updated to fix QR code generation
const memberRepository = require('./memberRepository');
const userRepository = require('../users/userRepository');
const { generateQrHash, generateQrCodeDataUrl, generateVerificationUrl } = require('../../utils/qrUtils');
const { verifyInstitutionalEmail } = require('../../utils/emailVerification');
const { USER_ROLES } = require('../../constants/roles');
const ERROR_CODES = require('../../constants/errorCodes');
const MESSAGES = require('../../constants/messages');
const logger = require('../../utils/logger');
const db = require('../../config/database');

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
 * Get all members with optional filters and pagination
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
            grade: filters.grade,
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

        // Create member with QR hash (using transaction client)
        const insertMemberQuery = `
            INSERT INTO members (
                full_name,
                identification,
                grade,
                institutional_email,
                photo_url,
                qr_hash,
                is_active
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING
                member_id,
                full_name,
                identification,
                grade,
                institutional_email,
                photo_url,
                qr_hash,
                is_active,
                created_at
        `;

        const memberValues = [
            memberData.fullName,
            memberData.identification,
            memberData.grade,
            memberData.institutionalEmail || null,
            memberData.photoUrl || null,
            qrHash,
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
                    is_active
                )
                VALUES ($1, $2, $3, $4, $5)
                RETURNING
                    user_id,
                    full_name,
                    email,
                    role,
                    is_active,
                    created_at
            `;

            const userValues = [
                memberData.fullName,
                memberData.institutionalEmail,
                null,  // microsoft_id will be set when student logs in
                USER_ROLES.STUDENT,
                true
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

        // Update member
        const updatedMember = await memberRepository.update(memberId, updates);

        logger.info('Member updated successfully', {
            memberId: updatedMember.member_id
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
 * Delete member (soft delete)
 *
 * @param {number} memberId - Member ID
 * @returns {Promise<Object>} Deactivated member object
 * @throws {MemberError} If member not found
 */
const deleteMember = async (memberId) => {
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

        // Deactivate member (soft delete)
        const deactivatedMember = await memberRepository.deactivate(memberId);

        logger.info('Member deleted (deactivated) successfully', {
            memberId: deactivatedMember.member_id
        });

        return deactivatedMember;
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
            grade: member.grade,
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
        if (!member.is_active) {
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

        // Return only public information
        return {
            fullName: member.full_name,
            identification: member.identification,
            grade: member.grade,
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
    MemberError
};
