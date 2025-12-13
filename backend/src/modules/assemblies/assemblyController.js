/**
 * Assembly Controller
 * Handles HTTP requests for assembly endpoints
 *
 * @module modules/assemblies/assemblyController
 */

const assemblyService = require('./assemblyService');
const { successResponse, errorResponse, paginatedResponse } = require('../../utils/responseFormatter');
const MESSAGES = require('../../constants/messages');
const ERROR_CODES = require('../../constants/errorCodes');
const logger = require('../../utils/logger');

/**
 * Get all assemblies
 * Supports filtering and pagination
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllAssemblies = async (req, res) => {
    try {
        const filters = {
            isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
            fromDate: req.query.fromDate,
            toDate: req.query.toDate,
            createdBy: req.query.createdBy,
            page: req.query.page,
            limit: req.query.limit
        };

        const result = await assemblyService.getAllAssemblies(filters);

        return paginatedResponse(
            res,
            'Asambleas obtenidas exitosamente',
            result.assemblies,
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

        logger.error('Unexpected error in getAllAssemblies controller', {
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
 * Get assembly by ID
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAssemblyById = async (req, res) => {
    try {
        const { id } = req.params;
        const includeStats = req.query.includeStats === 'true';

        const assembly = includeStats
            ? await assemblyService.getAssemblyWithStats(parseInt(id, 10))
            : await assemblyService.getAssemblyById(parseInt(id, 10));

        return successResponse(
            res,
            'Asamblea encontrada',
            assembly
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

        logger.error('Unexpected error in getAssemblyById controller', {
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
 * Get active assembly
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getActiveAssembly = async (req, res) => {
    try {
        const includeStats = req.query.includeStats === 'true';

        const assembly = includeStats
            ? await assemblyService.getActiveAssemblyWithStats()
            : await assemblyService.getActiveAssembly();

        return successResponse(
            res,
            'Asamblea activa encontrada',
            assembly
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

        logger.error('Unexpected error in getActiveAssembly controller', {
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
 * Get active assembly or last concluded assembly for dashboard
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getActiveOrLastConcludedAssembly = async (req, res) => {
    try {
        const assembly = await assemblyService.getActiveOrLastConcludedAssembly();

        if (!assembly) {
            return successResponse(
                res,
                'No hay asambleas disponibles',
                null
            );
        }

        return successResponse(
            res,
            assembly.is_active ? 'Asamblea activa encontrada' : 'Última asamblea concluida encontrada',
            assembly
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

        logger.error('Unexpected error in getActiveOrLastConcludedAssembly controller', {
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
 * Create new assembly
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createAssembly = async (req, res) => {
    try {
        const assemblyData = {
            title: req.body.title,
            scheduledDate: req.body.scheduledDate,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            cooperativeId: 1 // Default cooperative ID (temporary until multi-cooperative is fully implemented)
        };

        const newAssembly = await assemblyService.createAssembly(
            assemblyData,
            req.user.userId
        );

        return successResponse(
            res,
            MESSAGES.ASSEMBLY_CREATED,
            newAssembly,
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

        logger.error('Unexpected error in createAssembly controller', {
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
 * Update assembly
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateAssembly = async (req, res) => {
    try {
        const { id } = req.params;

        const updates = {
            title: req.body.title,
            scheduledDate: req.body.scheduledDate,
            startTime: req.body.startTime,
            endTime: req.body.endTime
        };

        // Remove undefined fields
        Object.keys(updates).forEach(key => {
            if (updates[key] === undefined) {
                delete updates[key];
            }
        });

        const updatedAssembly = await assemblyService.updateAssembly(
            parseInt(id, 10),
            updates
        );

        return successResponse(
            res,
            MESSAGES.ASSEMBLY_UPDATED,
            updatedAssembly
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

        logger.error('Unexpected error in updateAssembly controller', {
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
 * Delete assembly
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteAssembly = async (req, res) => {
    try {
        const { id } = req.params;
        await assemblyService.deleteAssembly(parseInt(id, 10));

        return successResponse(
            res,
            MESSAGES.ASSEMBLY_DELETED,
            null
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

        logger.error('Unexpected error in deleteAssembly controller', {
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
 * Activate assembly
 * Deactivates all other assemblies automatically
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const activateAssembly = async (req, res) => {
    try {
        const { id } = req.params;
        const activatedAssembly = await assemblyService.activateAssembly(
            parseInt(id, 10)
        );

        return successResponse(
            res,
            MESSAGES.ASSEMBLY_ACTIVATED,
            activatedAssembly
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

        logger.error('Unexpected error in activateAssembly controller', {
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
 * Deactivate assembly
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deactivateAssembly = async (req, res) => {
    try {
        const { id } = req.params;
        const deactivatedAssembly = await assemblyService.deactivateAssembly(
            parseInt(id, 10)
        );

        return successResponse(
            res,
            MESSAGES.ASSEMBLY_DEACTIVATED,
            deactivatedAssembly
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

        logger.error('Unexpected error in deactivateAssembly controller', {
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
    getAllAssemblies,
    getAssemblyById,
    getActiveAssembly,
    getActiveOrLastConcludedAssembly,
    createAssembly,
    updateAssembly,
    deleteAssembly,
    activateAssembly,
    deactivateAssembly
};
