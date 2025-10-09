/**
 * Member Service
 * Business logic for member operations
 *
 * @module modules/members/memberService
 */

const memberRepository = require('./memberRepository');
const { generateQrHash, generateQrCode } = require('../../utils/qrUtils');
const ERROR_CODES = require('../../constants/errorCodes');
const MESSAGES = require('../../constants/messages');
const logger = require('../../utils/logger');

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
 * @returns {Promise<Object>} Member object
 * @throws {MemberError} If member not found
 */
const getMemberById = async (memberId) => {
    try {
        const member = await memberRepository.findById(memberId);

        if (!member) {
            throw new MemberError(
                MESSAGES.MEMBER_NOT_FOUND,
                ERROR_CODES.MEMBER_NOT_FOUND,
                404
            );
        }

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
            section: filters.section,
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
 * Create a new member
 *
 * @param {Object} memberData - Member data
 * @returns {Promise<Object>} Created member object
 * @throws {MemberError} If member already exists or validation fails
 */
const createMember = async (memberData) => {
    try {
        // Check if member with same identification already exists
        const existingMember = await memberRepository.findByIdentification(
            memberData.identification
        );

        if (existingMember) {
            throw new MemberError(
                MESSAGES.MEMBER_ALREADY_EXISTS,
                ERROR_CODES.MEMBER_ALREADY_EXISTS,
                409
            );
        }

        // Generate QR hash for the member
        const qrHash = generateQrHash(memberData.identification);

        // Create member with QR hash
        const newMember = await memberRepository.create({
            ...memberData,
            qrHash
        });

        logger.info('Member created successfully', {
            memberId: newMember.member_id,
            identification: newMember.identification
        });

        return newMember;
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error creating member:', error);
        throw new MemberError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
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

        // Generate QR code image from hash
        const qrCodeImage = await generateQrCode(member.qr_hash);

        logger.info('QR code generated for member', {
            memberId: member.member_id
        });

        return {
            memberId: member.member_id,
            fullName: member.full_name,
            identification: member.identification,
            qrHash: member.qr_hash,
            qrCodeImage // Base64 encoded image
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

        // Generate new QR code image
        const qrCodeImage = await generateQrCode(qrHash);

        logger.info('QR code regenerated for member', {
            memberId: updatedMember.member_id
        });

        return {
            member: updatedMember,
            qrCodeImage
        };
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
    MemberError
};
