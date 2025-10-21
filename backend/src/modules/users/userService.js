/**
 * User Service
 * Business logic for user management operations
 * Handles CRUD operations and user administration
 *
 * @module modules/users/userService
 */

const userRepository = require('./userRepository');
const ERROR_CODES = require('../../constants/errorCodes');
const MESSAGES = require('../../constants/messages');
const logger = require('../../utils/logger');

/**
 * Custom error class for operational errors
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
 * Get all users with optional filters and pagination
 *
 * @param {Object} filters - Filter criteria
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 20)
 * @returns {Promise<Object>} Object with users array and pagination info
 */
const getAllUsers = async (filters = {}, page = 1, limit = 20) => {
    try {
        const offset = (page - 1) * limit;
        const result = await userRepository.findAll(filters, limit, offset);

        // Remove sensitive information
        const users = result.users.map(user => ({
            userId: user.userId,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            hasMicrosoftAccount: !!user.microsoftId,
            lastLogin: user.lastLogin || null,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }));

        return {
            users,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(result.total / limit),
                totalItems: result.total,
                limit
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
 * Get user by ID
 *
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User object
 * @throws {UserError} If user not found
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
            username: user.username,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            hasMicrosoftAccount: !!user.microsoftId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error getting user by ID:', error);
        throw new UserError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Create a new user
 *
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user object
 * @throws {UserError} If validation fails
 */
const createUser = async (userData) => {
    try {
        // Check if username already exists
        if (userData.username) {
            const existingUsername = await userRepository.findByUsername(userData.username);
            if (existingUsername) {
                throw new UserError(
                    MESSAGES.USERNAME_EXISTS,
                    ERROR_CODES.USERNAME_EXISTS,
                    409
                );
            }
        }

        // Check if email already exists
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

        // Validate that Microsoft ID is provided (required for OAuth authentication)
        if (!userData.microsoftId) {
            throw new UserError(
                'Se requiere Microsoft ID para la autenticación',
                ERROR_CODES.VALIDATION_ERROR,
                400
            );
        }

        const newUser = await userRepository.create({
            fullName: userData.fullName,
            username: userData.username,
            passwordHash: null, // No password authentication
            role: userData.role,
            isActive: userData.isActive !== undefined ? userData.isActive : true,
            microsoftId: userData.microsoftId,
            email: userData.email || null
        });

        logger.info('User created successfully', {
            userId: newUser.userId,
            username: newUser.username,
            role: newUser.role
        });

        return {
            userId: newUser.userId,
            fullName: newUser.fullName,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            isActive: newUser.isActive,
            hasMicrosoftAccount: !!newUser.microsoftId,
            createdAt: newUser.createdAt
        };
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error creating user:', error);
        throw new UserError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Update user information
 *
 * @param {number} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated user object
 * @throws {UserError} If validation fails
 */
const updateUser = async (userId, updates) => {
    try {
        // Verify user exists
        const existingUser = await userRepository.findById(userId);
        if (!existingUser) {
            throw new UserError(
                MESSAGES.USER_NOT_FOUND,
                ERROR_CODES.USER_NOT_FOUND,
                404
            );
        }

        // Check if username is being changed and if it already exists
        if (updates.username && updates.username !== existingUser.username) {
            const userWithUsername = await userRepository.findByUsername(updates.username);
            if (userWithUsername) {
                throw new UserError(
                    MESSAGES.USERNAME_EXISTS,
                    ERROR_CODES.USERNAME_EXISTS,
                    409
                );
            }
        }

        // Check if email is being changed and if it already exists
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

        if (updates.fullName !== undefined) {
            updateData.full_name = updates.fullName;
        }

        if (updates.username !== undefined) {
            updateData.username = updates.username;
        }

        if (updates.email !== undefined) {
            updateData.email = updates.email;
        }

        if (updates.role !== undefined) {
            updateData.role = updates.role;
        }

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
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            isActive: updatedUser.isActive,
            hasMicrosoftAccount: !!updatedUser.microsoftId,
            updatedAt: updatedUser.updatedAt
        };
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error updating user:', error);
        throw new UserError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Deactivate user (soft delete)
 * Cannot deactivate the last active administrator
 *
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Updated user object
 * @throws {UserError} If validation fails
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

        // Prevent deactivating the last active administrator
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

        logger.info('User deactivated successfully', {
            userId: deactivatedUser.userId
        });

        return {
            userId: deactivatedUser.userId,
            fullName: deactivatedUser.fullName,
            username: deactivatedUser.username,
            email: deactivatedUser.email,
            role: deactivatedUser.role,
            isActive: deactivatedUser.isActive,
            updatedAt: deactivatedUser.updatedAt
        };
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error deactivating user:', error);
        throw new UserError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Activate user
 *
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Updated user object
 * @throws {UserError} If user not found
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

        logger.info('User activated successfully', {
            userId: activatedUser.userId
        });

        return {
            userId: activatedUser.userId,
            fullName: activatedUser.fullName,
            username: activatedUser.username,
            email: activatedUser.email,
            role: activatedUser.role,
            isActive: activatedUser.isActive,
            updatedAt: activatedUser.updatedAt
        };
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

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
