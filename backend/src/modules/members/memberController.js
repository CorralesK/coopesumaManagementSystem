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
const { uploadToCloudinary, deleteFromCloudinary, extractPublicIdFromUrl } = require('../uploads/uploadService');

/**
 * Get all members (adapted to new structure)
 * Supports filtering, searching, and pagination
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllMembers = async (req, res) => {
    try {
        const filters = {
            qualityId: req.query.qualityId ? parseInt(req.query.qualityId, 10) : undefined,
            levelId: req.query.levelId ? parseInt(req.query.levelId, 10) : undefined,
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
 * Affiliate a new member (includes affiliation fee + receipt generation)
 * This is the recommended way to create new members
 * Supports photo upload via multipart/form-data
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const affiliateMember = async (req, res) => {
    try {
        let photoUrl = req.body.photoUrl;

        // If a file was uploaded, upload it to Cloudinary
        if (req.file) {
            try {
                const uploadResult = await uploadToCloudinary(
                    req.file.buffer,
                    'coopesuma/members'
                );
                photoUrl = uploadResult.secure_url;
            } catch (uploadError) {
                logger.error('Error uploading photo to Cloudinary', {
                    error: uploadError.message
                });
                return errorResponse(
                    res,
                    'Error al subir la foto. Por favor intente de nuevo.',
                    ERROR_CODES.INTERNAL_ERROR,
                    500
                );
            }
        }

        const memberData = {
            fullName: req.body.fullName,
            identification: req.body.identification,
            qualityId: req.body.qualityId,
            levelId: req.body.levelId,
            gender: req.body.gender,
            institutionalEmail: req.body.institutionalEmail,
            photoUrl,
            affiliationFee: req.body.affiliationFee || 500.00,
            cooperativeId: 1,
            createdBy: req.user.userId  // Pass the authenticated user ID
        };

        const result = await memberService.affiliateMember(memberData);

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

        logger.error('Unexpected error in affiliateMember controller', {
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
 * Create new member (adapted to new structure)
 * Note: memberCode is auto-generated by the system
 * Supports photo upload via multipart/form-data
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createMember = async (req, res) => {
    try {
        let photoUrl = req.body.photoUrl;

        // If a file was uploaded, upload it to Cloudinary
        if (req.file) {
            try {
                const uploadResult = await uploadToCloudinary(
                    req.file.buffer,
                    'coopesuma/members'
                );
                photoUrl = uploadResult.secure_url;
            } catch (uploadError) {
                logger.error('Error uploading photo to Cloudinary', {
                    error: uploadError.message
                });
                return errorResponse(
                    res,
                    'Error al subir la foto. Por favor intente de nuevo.',
                    ERROR_CODES.INTERNAL_ERROR,
                    500
                );
            }
        }

        const memberData = {
            fullName: req.body.fullName,
            identification: req.body.identification,
            qualityId: req.body.qualityId,
            levelId: req.body.levelId,
            gender: req.body.gender,
            institutionalEmail: req.body.institutionalEmail,
            photoUrl,
            affiliationDate: req.body.affiliationDate,
            cooperativeId: 1
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
 * Supports photo upload via multipart/form-data
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateMember = async (req, res) => {
    try {
        const { id } = req.params;
        let photoUrl = req.body.photoUrl;

        // If a file was uploaded, upload it to Cloudinary
        if (req.file) {
            try {
                // Get the current member to check for existing photo
                const currentMember = await memberService.getMemberById(parseInt(id, 10));

                // Upload new photo
                const uploadResult = await uploadToCloudinary(
                    req.file.buffer,
                    'coopesuma/members'
                );
                photoUrl = uploadResult.secure_url;

                // Try to delete old photo from Cloudinary if it exists
                if (currentMember.photoUrl) {
                    const oldPublicId = extractPublicIdFromUrl(currentMember.photoUrl);
                    if (oldPublicId) {
                        try {
                            await deleteFromCloudinary(oldPublicId);
                        } catch (deleteError) {
                            // Log but don't fail the update if old photo deletion fails
                            logger.warn('Could not delete old photo from Cloudinary', {
                                publicId: oldPublicId,
                                error: deleteError.message
                            });
                        }
                    }
                }
            } catch (uploadError) {
                logger.error('Error uploading photo to Cloudinary', {
                    error: uploadError.message
                });
                return errorResponse(
                    res,
                    'Error al subir la foto. Por favor intente de nuevo.',
                    ERROR_CODES.INTERNAL_ERROR,
                    500
                );
            }
        }

        const updates = {
            fullName: req.body.fullName,
            identification: req.body.identification,
            qualityId: req.body.qualityId,
            levelId: req.body.levelId,
            gender: req.body.gender,
            institutionalEmail: req.body.institutionalEmail,
            photoUrl,
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
 * Delete member (soft delete) with liquidation by exit
 * Executes liquidation of savings account before deactivating member
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteMember = async (req, res) => {
    try {
        const { id } = req.params;
        const processedBy = req.user?.userId || 1;

        const result = await memberService.deleteMember(parseInt(id, 10), processedBy);

        return successResponse(
            res,
            result.message,
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
                'An array of member IDs is required',
                ERROR_CODES.VALIDATION_ERROR,
                400
            );
        }

        const qrCodes = await memberService.generateBatchQrCodes(memberIds);

        return successResponse(
            res,
            `QR codes generated: ${qrCodes.filter(qr => !qr.error).length} successful, ${qrCodes.filter(qr => qr.error).length} failed`,
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
                'QR code hash is required',
                ERROR_CODES.VALIDATION_ERROR,
                400
            );
        }

        const member = await memberService.verifyMemberByQr(qrHash);

        return successResponse(
            res,
            'Member verified successfully',
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

/**
 * Public verification of member by QR hash
 * Accessible without authentication for public verification
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const publicVerifyMember = async (req, res) => {
    try {
        const { qr } = req.query;

        if (!qr) {
            return errorResponse(
                res,
                'QR parameter is required',
                ERROR_CODES.VALIDATION_ERROR,
                400
            );
        }

        const member = await memberService.publicVerifyMember(qr);

        return successResponse(
            res,
            'Member verified successfully',
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

        logger.error('Unexpected error in publicVerifyMember controller', {
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
 * Get member dashboard
 * Returns comprehensive dashboard data for the logged-in member
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMemberDashboard = async (req, res) => {
    try {
        // Get user ID from authenticated request
        const userId = req.user.userId;

        const dashboardData = await memberService.getMemberDashboard(userId);

        return successResponse(
            res,
            'Member dashboard retrieved successfully',
            dashboardData
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

        logger.error('Unexpected error in getMemberDashboard controller', {
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
 * Generate member cards PDF
 * Generates PDF with member cards for batch printing
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateMemberCardsPDF = async (req, res) => {
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

        if (memberIds.length > 100) {
            return errorResponse(
                res,
                'El limite maximo es de 100 carnets por lote',
                ERROR_CODES.VALIDATION_ERROR,
                400
            );
        }

        const pdfDoc = await memberService.generateMemberCardsPDF(memberIds);

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="carnets-${Date.now()}.pdf"`
        );

        // Pipe PDF to response
        pdfDoc.pipe(res);
    } catch (error) {
        if (error.isOperational) {
            return errorResponse(
                res,
                error.message,
                error.errorCode,
                error.statusCode
            );
        }

        logger.error('Unexpected error in generateMemberCardsPDF controller', {
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
    affiliateMember,
    createMember,
    updateMember,
    deleteMember,
    generateQrCode,
    regenerateQrCode,
    generateBatchQrCodes,
    generateMemberCardsPDF,
    verifyMemberByQr,
    publicVerifyMember,
    getMemberDashboard
};
