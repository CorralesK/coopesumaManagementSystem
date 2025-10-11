/**
 * Assembly Service
 * Business logic for assembly operations
 * Implements single active assembly rule
 *
 * @module modules/assemblies/assemblyService
 */

const assemblyRepository = require('./assemblyRepository');
const ERROR_CODES = require('../../constants/errorCodes');
const MESSAGES = require('../../constants/messages');
const logger = require('../../utils/logger');

/**
 * Custom error class for operational errors
 */
class AssemblyError extends Error {
    constructor(message, errorCode, statusCode) {
        super(message);
        this.errorCode = errorCode;
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}

/**
 * Get assembly by ID
 *
 * @param {number} assemblyId - Assembly ID
 * @returns {Promise<Object>} Assembly object
 * @throws {AssemblyError} If assembly not found
 */
const getAssemblyById = async (assemblyId) => {
    try {
        const assembly = await assemblyRepository.findById(assemblyId);

        if (!assembly) {
            throw new AssemblyError(
                MESSAGES.ASSEMBLY_NOT_FOUND,
                ERROR_CODES.ASSEMBLY_NOT_FOUND,
                404
            );
        }

        return assembly;
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error getting assembly by ID:', error);
        throw new AssemblyError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Get assembly by ID with attendance statistics
 *
 * @param {number} assemblyId - Assembly ID
 * @returns {Promise<Object>} Assembly with stats
 * @throws {AssemblyError} If assembly not found
 */
const getAssemblyWithStats = async (assemblyId) => {
    try {
        const assembly = await assemblyRepository.findByIdWithStats(assemblyId);

        if (!assembly) {
            throw new AssemblyError(
                MESSAGES.ASSEMBLY_NOT_FOUND,
                ERROR_CODES.ASSEMBLY_NOT_FOUND,
                404
            );
        }

        return assembly;
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error getting assembly with stats:', error);
        throw new AssemblyError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Get active assembly
 * Returns the currently active assembly (only one can be active)
 *
 * @returns {Promise<Object>} Active assembly object
 * @throws {AssemblyError} If no active assembly
 */
const getActiveAssembly = async () => {
    try {
        const assembly = await assemblyRepository.findActive();

        if (!assembly) {
            throw new AssemblyError(
                MESSAGES.NO_ACTIVE_ASSEMBLY,
                ERROR_CODES.NO_ACTIVE_ASSEMBLY,
                404
            );
        }

        return assembly;
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error getting active assembly:', error);
        throw new AssemblyError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Get active assembly with attendance statistics
 *
 * @returns {Promise<Object>} Active assembly with stats
 * @throws {AssemblyError} If no active assembly
 */
const getActiveAssemblyWithStats = async () => {
    try {
        const assembly = await assemblyRepository.findActiveWithStats();

        if (!assembly) {
            throw new AssemblyError(
                MESSAGES.NO_ACTIVE_ASSEMBLY,
                ERROR_CODES.NO_ACTIVE_ASSEMBLY,
                404
            );
        }

        return assembly;
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error getting active assembly with stats:', error);
        throw new AssemblyError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Get all assemblies with optional filters and pagination
 *
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Object>} Assemblies and pagination info
 */
const getAllAssemblies = async (filters = {}) => {
    try {
        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 50;
        const offset = (page - 1) * limit;

        const queryFilters = {
            isActive: filters.isActive,
            isRecurring: filters.isRecurring,
            fromDate: filters.fromDate,
            toDate: filters.toDate,
            createdBy: filters.createdBy,
            limit,
            offset
        };

        const [assemblies, total] = await Promise.all([
            assemblyRepository.findAll(queryFilters),
            assemblyRepository.count(queryFilters)
        ]);

        return {
            assemblies,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        logger.error('Error getting all assemblies:', error);
        throw new AssemblyError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Create a new assembly
 *
 * @param {Object} assemblyData - Assembly data
 * @param {number} userId - ID of user creating the assembly
 * @returns {Promise<Object>} Created assembly object
 */
const createAssembly = async (assemblyData, userId) => {
    try {
        // Create assembly (not active by default)
        const newAssembly = await assemblyRepository.create({
            ...assemblyData,
            createdBy: userId,
            isActive: false // New assemblies are not active by default
        });

        logger.info('Assembly created successfully', {
            assemblyId: newAssembly.assembly_id,
            title: newAssembly.title,
            createdBy: userId
        });

        return newAssembly;
    } catch (error) {
        logger.error('Error creating assembly:', error);
        throw new AssemblyError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Update assembly information
 *
 * @param {number} assemblyId - Assembly ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated assembly object
 * @throws {AssemblyError} If assembly not found or validation fails
 */
const updateAssembly = async (assemblyId, updates) => {
    try {
        // Check if assembly exists
        const assembly = await assemblyRepository.findById(assemblyId);

        if (!assembly) {
            throw new AssemblyError(
                MESSAGES.ASSEMBLY_NOT_FOUND,
                ERROR_CODES.ASSEMBLY_NOT_FOUND,
                404
            );
        }

        // Don't allow updating is_active through this method
        // Use activateAssembly/deactivateAssembly instead
        if ('is_active' in updates) {
            delete updates.is_active;
            logger.warn('Attempted to update is_active through updateAssembly', {
                assemblyId
            });
        }

        // Update assembly
        const updatedAssembly = await assemblyRepository.update(assemblyId, updates);

        logger.info('Assembly updated successfully', {
            assemblyId: updatedAssembly.assembly_id
        });

        return updatedAssembly;
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error updating assembly:', error);
        throw new AssemblyError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Delete assembly
 *
 * @param {number} assemblyId - Assembly ID
 * @returns {Promise<boolean>} True if deleted
 * @throws {AssemblyError} If assembly not found or is active
 */
const deleteAssembly = async (assemblyId) => {
    try {
        // Check if assembly exists
        const assembly = await assemblyRepository.findById(assemblyId);

        if (!assembly) {
            throw new AssemblyError(
                MESSAGES.ASSEMBLY_NOT_FOUND,
                ERROR_CODES.ASSEMBLY_NOT_FOUND,
                404
            );
        }

        // Don't allow deleting active assembly
        if (assembly.is_active) {
            throw new AssemblyError(
                'No se puede eliminar una asamblea activa. Desactívela primero.',
                ERROR_CODES.BAD_REQUEST,
                400
            );
        }

        // Delete assembly
        await assemblyRepository.deleteAssembly(assemblyId);

        logger.info('Assembly deleted successfully', {
            assemblyId
        });

        return true;
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error deleting assembly:', error);
        throw new AssemblyError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Activate assembly
 * IMPORTANT: Only ONE assembly can be active at a time
 * This will automatically deactivate all other assemblies (via DB trigger)
 *
 * @param {number} assemblyId - Assembly ID
 * @returns {Promise<Object>} Activated assembly object
 * @throws {AssemblyError} If assembly not found
 */
const activateAssembly = async (assemblyId) => {
    try {
        // Check if assembly exists
        const assembly = await assemblyRepository.findById(assemblyId);

        if (!assembly) {
            throw new AssemblyError(
                MESSAGES.ASSEMBLY_NOT_FOUND,
                ERROR_CODES.ASSEMBLY_NOT_FOUND,
                404
            );
        }

        // Check if already active
        if (assembly.is_active) {
            logger.info('Assembly is already active', { assemblyId });
            return assembly;
        }

        // Activate assembly (DB trigger will deactivate others)
        const activatedAssembly = await assemblyRepository.activate(assemblyId);

        logger.info('Assembly activated successfully', {
            assemblyId: activatedAssembly.assembly_id,
            title: activatedAssembly.title
        });

        return activatedAssembly;
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error activating assembly:', error);
        throw new AssemblyError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Deactivate assembly
 *
 * @param {number} assemblyId - Assembly ID
 * @returns {Promise<Object>} Deactivated assembly object
 * @throws {AssemblyError} If assembly not found
 */
const deactivateAssembly = async (assemblyId) => {
    try {
        // Check if assembly exists
        const assembly = await assemblyRepository.findById(assemblyId);

        if (!assembly) {
            throw new AssemblyError(
                MESSAGES.ASSEMBLY_NOT_FOUND,
                ERROR_CODES.ASSEMBLY_NOT_FOUND,
                404
            );
        }

        // Check if already inactive
        if (!assembly.is_active) {
            logger.info('Assembly is already inactive', { assemblyId });
            return assembly;
        }

        // Deactivate assembly
        const deactivatedAssembly = await assemblyRepository.deactivate(assemblyId);

        logger.info('Assembly deactivated successfully', {
            assemblyId: deactivatedAssembly.assembly_id,
            title: deactivatedAssembly.title
        });

        return deactivatedAssembly;
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error deactivating assembly:', error);
        throw new AssemblyError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

module.exports = {
    getAssemblyById,
    getAssemblyWithStats,
    getActiveAssembly,
    getActiveAssemblyWithStats,
    getAllAssemblies,
    createAssembly,
    updateAssembly,
    deleteAssembly,
    activateAssembly,
    deactivateAssembly,
    AssemblyError
};
