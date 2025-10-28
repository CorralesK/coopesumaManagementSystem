/**
 * User Controller
 * Handles HTTP requests for user management endpoints
 *
 * @module modules/users/userController
 */

const userService = require('./userService');
const { successResponse, errorResponse } = require('../../utils/responseFormatter');
const MESSAGES = require('../../constants/messages');
const ERROR_CODES = require('../../constants/errorCodes');
const logger = require('../../utils/logger');

/**
 * Get all users with optional filters
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllUsers = async (req, res) => {
    try {
        const filters = {
            role: req.query.role,
            isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined
        };

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;

        const result = await userService.getAllUsers(filters, page, limit);

        return successResponse(
            res,
            'Usuarios obtenidos exitosamente',
            result.users,
            200,
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
            username: req.body.username,
            password: req.body.password,
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
            username: req.body.username,
            email: req.body.email,
            role: req.body.role,
            password: req.body.password
        };

        // Remove undefined fields
        Object.keys(updates).forEach(key => {
            if (updates[key] === undefined) {
                delete updates[key];
            }
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
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deactivateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deactivatedUser = await userService.deactivateUser(parseInt(id, 10));

        return successResponse(
            res,
            'Usuario desactivado exitosamente',
            deactivatedUser
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
