/**
 * User Service
 * Business logic for user management operations
 * Handles CRUD operations and user administration
 *
 * @module modules/users/userService
 */

const userRepository = require('./userRepository');
const bcrypt = require('bcrypt');
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
 * Get all users with optional filters
 *
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Array of users
 */
const getAllUsers = async (filters = {}) => {
    try {
        const users = await userRepository.findAll(filters);

        // Remove sensitive information
        return users.map(user => ({
            userId: user.user_id,
            fullName: user.full_name,
            username: user.username,
            email: user.email,
            role: user.role,
            isActive: user.is_active,
            hasMicrosoftAccount: !!user.microsoft_id,
            createdAt: user.created_at,
            updatedAt: user.updated_at
        }));
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
            userId: user.user_id,
            fullName: user.full_name,
            username: user.username,
            email: user.email,
            role: user.role,
            isActive: user.is_active,
            hasMicrosoftAccount: !!user.microsoft_id,
            createdAt: user.created_at,
            updatedAt: user.updated_at
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

        // Hash password if provided
        let passwordHash = null;
        if (userData.password) {
            passwordHash = await bcrypt.hash(userData.password, 10);
        }

        // Validate that at least one authentication method is provided
        if (!passwordHash && !userData.microsoftId) {
            throw new UserError(
                'Se requiere al menos un método de autenticación (contraseña o cuenta de Microsoft)',
                ERROR_CODES.VALIDATION_ERROR,
                400
            );
        }

        const newUser = await userRepository.create({
            fullName: userData.fullName,
            username: userData.username,
            passwordHash,
            role: userData.role,
            isActive: userData.isActive !== undefined ? userData.isActive : true,
            microsoftId: userData.microsoftId || null,
            email: userData.email || null
        });

        logger.info('User created successfully', {
            userId: newUser.user_id,
            username: newUser.username,
            role: newUser.role
        });

        return {
            userId: newUser.user_id,
            fullName: newUser.full_name,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            isActive: newUser.is_active,
            hasMicrosoftAccount: !!newUser.microsoft_id,
            createdAt: newUser.created_at
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

        if (updates.password) {
            updateData.password_hash = await bcrypt.hash(updates.password, 10);
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
            userId: updatedUser.user_id,
            updatedFields: Object.keys(updateData)
        });

        return {
            userId: updatedUser.user_id,
            fullName: updatedUser.full_name,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            isActive: updatedUser.is_active,
            hasMicrosoftAccount: !!updatedUser.microsoft_id,
            updatedAt: updatedUser.updated_at
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

        if (!user.is_active) {
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
            userId: deactivatedUser.user_id
        });

        return {
            userId: deactivatedUser.user_id,
            fullName: deactivatedUser.full_name,
            username: deactivatedUser.username,
            email: deactivatedUser.email,
            role: deactivatedUser.role,
            isActive: deactivatedUser.is_active,
            updatedAt: deactivatedUser.updated_at
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

        if (user.is_active) {
            throw new UserError(
                'El usuario ya está activo',
                ERROR_CODES.VALIDATION_ERROR,
                400
            );
        }

        const activatedUser = await userRepository.activate(userId);

        logger.info('User activated successfully', {
            userId: activatedUser.user_id
        });

        return {
            userId: activatedUser.user_id,
            fullName: activatedUser.full_name,
            username: activatedUser.username,
            email: activatedUser.email,
            role: activatedUser.role,
            isActive: activatedUser.is_active,
            updatedAt: activatedUser.updated_at
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

/**
 * Change user password
 *
 * @param {number} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} True if password changed
 * @throws {UserError} If validation fails
 */
const changePassword = async (userId, currentPassword, newPassword) => {
    try {
        const user = await userRepository.findById(userId);

        if (!user) {
            throw new UserError(
                MESSAGES.USER_NOT_FOUND,
                ERROR_CODES.USER_NOT_FOUND,
                404
            );
        }

        // Get user with password hash
        const userWithPassword = await userRepository.findByUsername(user.username);

        if (!userWithPassword.password_hash) {
            throw new UserError(
                'Este usuario utiliza autenticación de Microsoft y no tiene contraseña',
                ERROR_CODES.VALIDATION_ERROR,
                400
            );
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, userWithPassword.password_hash);
        if (!isPasswordValid) {
            throw new UserError(
                'Contraseña actual incorrecta',
                ERROR_CODES.INVALID_CREDENTIALS,
                401
            );
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        // Update password
        await userRepository.update(userId, { password_hash: newPasswordHash });

        logger.info('User password changed successfully', {
            userId
        });

        return true;
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error changing password:', error);
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
    changePassword,
    UserError
};
