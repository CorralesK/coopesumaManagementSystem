/**
 * Member Controller
 * Handles HTTP requests for member endpoints
 *
 * @module modules/members/memberController
 */

const memberService = require('./memberService');
const { successResponse, errorResponse, paginatedResponse } = require('../../utils/responseFormatter');
const MESSAGES = require('../../constants/messages');
const ERROR_CODES = require('../../constants/errorCodes');
const logger = require('../../utils/logger');

/**
 * Get all members
 * Supports filtering, searching, and pagination
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllMembers = async (req, res) => {
    try {
        const filters = {
            grade: req.query.grade,
            isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
            search: req.query.search,
            page: req.query.page,
            limit: req.query.limit
        };

        const result = await memberService.getAllMembers(filters);

        return paginatedResponse(
            res,
            'Miembros obtenidos exitosamente',
            result.members,
            result.pagination
        );
    } catch (error) {
        if (error.isOperational) {
            return errorResponse(
                res,
                error.message,
                error.errorCode,
                error.statusCode
            );
        }

        logger.error('Unexpected error in getAllMembers controller', {
            error: error.message,
            stack: error.stack
        });

        return errorResponse(
            res,
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Get member by ID
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMemberById = async (req, res) => {
    try {
        const { id } = req.params;

        // Disable caching to ensure QR code is always regenerated
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');

        const member = await memberService.getMemberById(parseInt(id, 10));

        return successResponse(
            res,
            'Miembro encontrado',
            member
        );
    } catch (error) {
        if (error.isOperational) {
            return errorResponse(
                res,
                error.message,
                error.errorCode,
                error.statusCode
            );
        }

        logger.error('Unexpected error in getMemberById controller', {
            error: error.message,
            stack: error.stack
        });

        return errorResponse(
            res,
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Create new member
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createMember = async (req, res) => {
    try {
        const memberData = {
            fullName: req.body.fullName,
            identification: req.body.identification,
            grade: req.body.grade,
            institutionalEmail: req.body.institutionalEmail,
            photoUrl: req.body.photoUrl
        };

        const result = await memberService.createMember(memberData);

        return successResponse(
            res,
            MESSAGES.MEMBER_CREATED,
            result,
            201
        );
    } catch (error) {
        if (error.isOperational) {
            return errorResponse(
                res,
                error.message,
                error.errorCode,
                error.statusCode
            );
        }

        logger.error('Unexpected error in createMember controller', {
            error: error.message,
            stack: error.stack
        });

        return errorResponse(
            res,
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Update member
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateMember = async (req, res) => {
    try {
        const { id } = req.params;

        const updates = {
            fullName: req.body.fullName,
            identification: req.body.identification,
            grade: req.body.grade,
            photoUrl: req.body.photoUrl,
            isActive: req.body.isActive
        };

        // Remove undefined fields
        Object.keys(updates).forEach(key => {
            if (updates[key] === undefined) {
                delete updates[key];
            }
        });

        const updatedMember = await memberService.updateMember(parseInt(id, 10), updates);

        return successResponse(
            res,
            MESSAGES.MEMBER_UPDATED,
            updatedMember
        );
    } catch (error) {
        if (error.isOperational) {
            return errorResponse(
                res,
                error.message,
                error.errorCode,
                error.statusCode
            );
        }

        logger.error('Unexpected error in updateMember controller', {
            error: error.message,
            stack: error.stack
        });

        return errorResponse(
            res,
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Delete member (soft delete)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteMember = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedMember = await memberService.deleteMember(parseInt(id, 10));

        return successResponse(
            res,
            MESSAGES.MEMBER_DELETED,
            deletedMember
        );
    } catch (error) {
        if (error.isOperational) {
            return errorResponse(
                res,
                error.message,
                error.errorCode,
                error.statusCode
            );
        }

        logger.error('Unexpected error in deleteMember controller', {
            error: error.message,
            stack: error.stack
        });

        return errorResponse(
            res,
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Generate QR code for member
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateQrCode = async (req, res) => {
    try {
        const { id } = req.params;
        const qrData = await memberService.generateMemberQr(parseInt(id, 10));

        return successResponse(
            res,
            MESSAGES.QR_GENERATED,
            qrData
        );
    } catch (error) {
        if (error.isOperational) {
            return errorResponse(
                res,
                error.message,
                error.errorCode,
                error.statusCode
            );
        }

        logger.error('Unexpected error in generateQrCode controller', {
            error: error.message,
            stack: error.stack
        });

        return errorResponse(
            res,
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Regenerate QR code for member
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const regenerateQrCode = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await memberService.regenerateMemberQr(parseInt(id, 10));

        return successResponse(
            res,
            'Código QR regenerado exitosamente',
            result
        );
    } catch (error) {
        if (error.isOperational) {
            return errorResponse(
                res,
                error.message,
                error.errorCode,
                error.statusCode
            );
        }

        logger.error('Unexpected error in regenerateQrCode controller', {
            error: error.message,
            stack: error.stack
        });

        return errorResponse(
            res,
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Generate QR codes for multiple members (batch)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateBatchQrCodes = async (req, res) => {
    try {
        const { memberIds } = req.body;

        if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
            return errorResponse(
                res,
                'Se requiere un array de IDs de miembros',
                ERROR_CODES.VALIDATION_ERROR,
                400
            );
        }

        const qrCodes = await memberService.generateBatchQrCodes(memberIds);

        return successResponse(
            res,
            `Códigos QR generados: ${qrCodes.filter(qr => !qr.error).length} exitosos, ${qrCodes.filter(qr => qr.error).length} fallidos`,
            qrCodes
        );
    } catch (error) {
        if (error.isOperational) {
            return errorResponse(
                res,
                error.message,
                error.errorCode,
                error.statusCode
            );
        }

        logger.error('Unexpected error in generateBatchQrCodes controller', {
            error: error.message,
            stack: error.stack
        });

        return errorResponse(
            res,
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
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const verifyMemberByQr = async (req, res) => {
    try {
        const { qrHash } = req.body;

        if (!qrHash) {
            return errorResponse(
                res,
                'El hash del código QR es requerido',
                ERROR_CODES.VALIDATION_ERROR,
                400
            );
        }

        const member = await memberService.verifyMemberByQr(qrHash);

        return successResponse(
            res,
            'Miembro verificado exitosamente',
            member
        );
    } catch (error) {
        if (error.isOperational) {
            return errorResponse(
                res,
                error.message,
                error.errorCode,
                error.statusCode
            );
        }

        logger.error('Unexpected error in verifyMemberByQr controller', {
            error: error.message,
            stack: error.stack
        });

        return errorResponse(
            res,
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

module.exports = {
    getAllMembers,
    getMemberById,
    createMember,
    updateMember,
    deleteMember,
    generateQrCode,
    regenerateQrCode,
    generateBatchQrCodes,
    verifyMemberByQr
};
