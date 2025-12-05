/**
 * User Service
 * Business logic for user management operations.
 * Handles CRUD operations, filtering, pagination and administrative rules.
 *
 * @module modules/users/userService
 */

const userRepository = require('./userRepository');
const ERROR_CODES = require('../../constants/errorCodes');
const MESSAGES = require('../../constants/messages');
const logger = require('../../utils/logger');

/**
 * Custom Operational Error for User-related operations.
 */
class UserError extends Error {
    constructor(message, errorCode, statusCode) {
        super(message);
        this.errorCode = errorCode;
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}

/**
 * Retrieve all users with optional filters and pagination.
 * This version returns a response structure fully aligned with the Members endpoint,
 * ensuring consistent pagination and list rendering across the frontend.
 *
 * @param {Object} filters - Filter criteria (search text, role, isActive)
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} Paginated users list with metadata
 */
const getAllUsers = async (filters = {}, page = 1, limit = 20) => {
    try {
        const offset = (page - 1) * limit;

        const result = await userRepository.findAll(filters, limit, offset);

        const users = result.users.map(user => ({
            userId: user.userId,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            hasMicrosoftAccount: !!user.microsoftId,
            lastLogin: user.lastLogin || null,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }));

        // ⬇️ IMPORTANT: Unified response format identical to the Members module
        return {
            users,
            pagination: {
                page,
                limit,
                total: result.total,
                totalPages: Math.ceil(result.total / limit)
            }
        };

    } catch (error) {
        logger.error('Error getting all users:', error);
        throw new UserError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Retrieve a single user by ID.
 *
 * @param {number} userId - Unique user identifier
 * @returns {Promise<Object>} User details
 * @throws {UserError} If user does not exist
 */
const getUserById = async (userId) => {
    try {
        const user = await userRepository.findById(userId);

        if (!user) {
            throw new UserError(
                MESSAGES.USER_NOT_FOUND,
                ERROR_CODES.USER_NOT_FOUND,
                404
            );
        }

        return {
            userId: user.userId,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            hasMicrosoftAccount: !!user.microsoftId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

    } catch (error) {
        if (error.isOperational) throw error;

        logger.error('Error getting user by ID:', error);
        throw new UserError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Create a new user.
 * Microsoft ID is required because authentication is handled via Microsoft OAuth.
 *
 * @param {Object} userData - Data for new user
 * @returns {Promise<Object>} Newly created user
 */
const createUser = async (userData) => {
    try {
        // Email uniqueness check
        if (userData.email) {
            const existingEmail = await userRepository.findByEmail(userData.email);
            if (existingEmail) {
                throw new UserError(
                    MESSAGES.EMAIL_EXISTS,
                    ERROR_CODES.EMAIL_EXISTS,
                    409
                );
            }
        }

        // Microsoft ID will be assigned automatically when the user logs in for the first time
        // Users are created without microsoftId, and it gets linked during OAuth flow
        const microsoftId = null;

        const newUser = await userRepository.create({
            fullName: userData.fullName,
            role: userData.role,
            isActive: userData.isActive !== undefined ? userData.isActive : true,
            microsoftId: microsoftId,
            email: userData.email || null,
            cooperativeId: userData.cooperativeId || 1 // Default to cooperative 1
        });

        logger.info('User created successfully', {
            userId: newUser.userId,
            email: newUser.email
        });

        return {
            userId: newUser.userId,
            fullName: newUser.fullName,
            email: newUser.email,
            role: newUser.role,
            isActive: newUser.isActive,
            hasMicrosoftAccount: !!newUser.microsoftId,
            createdAt: newUser.createdAt
        };

    } catch (error) {
        if (error.isOperational) throw error;

        logger.error('Error creating user:', error);
        throw new UserError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Update a user's data.
 * Ensures username/email uniqueness and only updates allowed fields.
 *
 * @param {number} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated user object
 */
const updateUser = async (userId, updates) => {
    try {
        const existingUser = await userRepository.findById(userId);

        if (!existingUser) {
            throw new UserError(
                MESSAGES.USER_NOT_FOUND,
                ERROR_CODES.USER_NOT_FOUND,
                404
            );
        }

        // Email uniqueness check
        if (updates.email && updates.email !== existingUser.email) {
            const userWithEmail = await userRepository.findByEmail(updates.email);
            if (userWithEmail) {
                throw new UserError(
                    MESSAGES.EMAIL_EXISTS,
                    ERROR_CODES.EMAIL_EXISTS,
                    409
                );
            }
        }

        // Build update object
        const updateData = {};

        if (updates.fullName !== undefined) updateData.full_name = updates.fullName;
        if (updates.email !== undefined) updateData.email = updates.email;
        if (updates.role !== undefined) updateData.role = updates.role;

        if (Object.keys(updateData).length === 0) {
            throw new UserError(
                'No hay campos para actualizar',
                ERROR_CODES.VALIDATION_ERROR,
                400
            );
        }

        const updatedUser = await userRepository.update(userId, updateData);

        logger.info('User updated successfully', {
            userId: updatedUser.userId,
            updatedFields: Object.keys(updateData)
        });

        return {
            userId: updatedUser.userId,
            fullName: updatedUser.fullName,
            email: updatedUser.email,
            role: updatedUser.role,
            isActive: updatedUser.isActive,
            hasMicrosoftAccount: !!updatedUser.microsoftId,
            updatedAt: updatedUser.updatedAt
        };

    } catch (error) {
        if (error.isOperational) throw error;

        logger.error('Error updating user:', error);
        throw new UserError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Deactivate a user (soft delete).
 * Prevents deactivating the last active administrator.
 *
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Updated user data
 */
const deactivateUser = async (userId) => {
    try {
        const user = await userRepository.findById(userId);

        if (!user) {
            throw new UserError(
                MESSAGES.USER_NOT_FOUND,
                ERROR_CODES.USER_NOT_FOUND,
                404
            );
        }

        if (!user.isActive) {
            throw new UserError(
                'El usuario ya está inactivo',
                ERROR_CODES.VALIDATION_ERROR,
                400
            );
        }

        if (user.role === 'administrator') {
            const activeAdminCount = await userRepository.countActiveAdministrators();
            if (activeAdminCount <= 1) {
                throw new UserError(
                    'No se puede desactivar el último administrador activo',
                    ERROR_CODES.LAST_ADMIN,
                    403
                );
            }
        }

        const deactivatedUser = await userRepository.deactivate(userId);

        logger.info('User deactivated successfully', { userId });

        return {
            userId: deactivatedUser.userId,
            fullName: deactivatedUser.fullName,
            email: deactivatedUser.email,
            role: deactivatedUser.role,
            isActive: deactivatedUser.isActive,
            updatedAt: deactivatedUser.updatedAt
        };

    } catch (error) {
        if (error.isOperational) throw error;

        logger.error('Error deactivating user:', error);
        throw new UserError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Activate a previously deactivated user.
 *
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Updated user data
 */
const activateUser = async (userId) => {
    try {
        const user = await userRepository.findById(userId);

        if (!user) {
            throw new UserError(
                MESSAGES.USER_NOT_FOUND,
                ERROR_CODES.USER_NOT_FOUND,
                404
            );
        }

        if (user.isActive) {
            throw new UserError(
                'El usuario ya está activo',
                ERROR_CODES.VALIDATION_ERROR,
                400
            );
        }

        const activatedUser = await userRepository.activate(userId);

        logger.info('User activated successfully', { userId });

        return {
            userId: activatedUser.userId,
            fullName: activatedUser.fullName,
            email: activatedUser.email,
            role: activatedUser.role,
            isActive: activatedUser.isActive,
            updatedAt: activatedUser.updatedAt
        };

    } catch (error) {
        if (error.isOperational) throw error;

        logger.error('Error activating user:', error);
        throw new UserError(
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
    activateUser,
    UserError
};
