/**
 * User Controller
 * Handles HTTP requests for user management endpoints.
 *
 * @module modules/users/userController
 */

const userService = require('./userService');
const { successResponse, errorResponse } = require('../../utils/responseFormatter');
const MESSAGES = require('../../constants/messages');
const ERROR_CODES = require('../../constants/errorCodes');
const logger = require('../../utils/logger');

/**
 * Get all users with optional filters (compatible with Members behavior)
 *
 * - Accepts empty filters without causing validation errors.
 * - Normalizes pagination and search parameters.
 * - Delegates flexible filtering logic to the service layer.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllUsers = async (req, res) => {
    try {
        // Normalize filters (replicates Members behavior)
        const filters = {
            search: req.query.search || '',
            role: req.query.role || '',
            isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined
        };

        // Normalize pagination
        const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
        const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 20;

        const result = await userService.getAllUsers(filters, page, limit);

        return res.status(200).json({
            success: true,
            message: 'Usuarios obtenidos exitosamente',
            data: result.users,
            pagination: result.pagination
        });
    } catch (error) {
        if (error.isOperational) {
            return errorResponse(
                res,
                error.message,
                error.errorCode,
                error.statusCode
            );
        }

        logger.error('Unexpected error in getAllUsers controller', {
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
 * Get user by ID
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(parseInt(id, 10));

        return successResponse(
            res,
            'Usuario encontrado',
            user
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

        logger.error('Unexpected error in getUserById controller', {
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
 * Create new user
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createUser = async (req, res) => {
    try {
        const userData = {
            fullName: req.body.fullName,
            email: req.body.email,
            role: req.body.role,
            isActive: req.body.isActive,
            microsoftId: req.body.microsoftId,
            cooperativeId: 1 // Default cooperative ID (temporary until multi-cooperative is fully implemented)
        };

        const newUser = await userService.createUser(userData);

        return successResponse(
            res,
            MESSAGES.USER_CREATED,
            newUser,
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

        logger.error('Unexpected error in createUser controller', {
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
 * Update user
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = {
            fullName: req.body.fullName,
            email: req.body.email,
            role: req.body.role
        };

        // Remove undefined fields
        Object.keys(updates).forEach(key => {
            if (updates[key] === undefined) delete updates[key];
        });

        const updatedUser = await userService.updateUser(parseInt(id, 10), updates);

        return successResponse(
            res,
            MESSAGES.USER_UPDATED,
            updatedUser
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

        logger.error('Unexpected error in updateUser controller', {
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
 * Deactivate user
 * If user is a member, this will also liquidate and deactivate the associated member
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deactivateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const processedBy = req.user?.userId || 1; // Get user ID from auth or default to 1

        const result = await userService.deactivateUser(parseInt(id, 10), processedBy);

        // If there was a liquidation, include it in the response
        const message = result.liquidation
            ? 'Usuario y miembro eliminados exitosamente. Se generó recibo de liquidación.'
            : 'Usuario desactivado exitosamente';

        return successResponse(
            res,
            message,
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

        logger.error('Unexpected error in deactivateUser controller', {
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
 * Activate user
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const activateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const activatedUser = await userService.activateUser(parseInt(id, 10));

        return successResponse(
            res,
            'Usuario activado exitosamente',
            activatedUser
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

        logger.error('Unexpected error in activateUser controller', {
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
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deactivateUser,
    activateUser
};
