/**
 * Attendance Controller
 * Handles HTTP requests for attendance endpoints
 *
 * @module modules/attendance/attendanceController
 */

const attendanceService = require('./attendanceService');
const { successResponse, errorResponse, paginatedResponse } = require('../../utils/responseFormatter');
const MESSAGES = require('../../constants/messages');
const ERROR_CODES = require('../../constants/errorCodes');
const logger = require('../../utils/logger');

/**
 * Register attendance by QR scan
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const registerByQr = async (req, res) => {
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

        const result = await attendanceService.registerAttendanceByQr(
            qrHash,
            req.user.userId
        );

        return successResponse(
            res,
            MESSAGES.ATTENDANCE_REGISTERED,
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

        logger.error('Unexpected error in registerByQr controller', {
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
 * Register attendance manually
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const registerManually = async (req, res) => {
    try {
        const { memberId, notes } = req.body;

        if (!memberId) {
            return errorResponse(
                res,
                'El ID del miembro es requerido',
                ERROR_CODES.VALIDATION_ERROR,
                400
            );
        }

        const result = await attendanceService.registerAttendanceManually(
            parseInt(memberId, 10),
            req.user.userId,
            notes
        );

        return successResponse(
            res,
            MESSAGES.MANUAL_ATTENDANCE_REGISTERED,
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

        logger.error('Unexpected error in registerManually controller', {
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
 * Get all attendance records
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllAttendance = async (req, res) => {
    try {
        const filters = {
            assemblyId: req.query.assemblyId,
            memberId: req.query.memberId,
            registrationMethod: req.query.registrationMethod,
            registeredBy: req.query.registeredBy,
            fromDate: req.query.fromDate,
            toDate: req.query.toDate,
            grade: req.query.grade,
            section: req.query.section,
            page: req.query.page,
            limit: req.query.limit
        };

        const result = await attendanceService.getAllAttendance(filters);

        return paginatedResponse(
            res,
            'Registros de asistencia obtenidos exitosamente',
            result.attendanceRecords,
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

        logger.error('Unexpected error in getAllAttendance controller', {
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
 * Get attendance record by ID
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAttendanceById = async (req, res) => {
    try {
        const { id } = req.params;
        const attendance = await attendanceService.getAttendanceById(
            parseInt(id, 10)
        );

        return successResponse(
            res,
            'Registro de asistencia encontrado',
            attendance
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

        logger.error('Unexpected error in getAttendanceById controller', {
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
 * Delete attendance record
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        await attendanceService.deleteAttendance(parseInt(id, 10));

        return successResponse(
            res,
            'Registro de asistencia eliminado exitosamente',
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

        logger.error('Unexpected error in deleteAttendance controller', {
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
 * Get attendance statistics for an assembly
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAssemblyStats = async (req, res) => {
    try {
        const { assemblyId } = req.params;
        const stats = await attendanceService.getAssemblyAttendanceStats(
            parseInt(assemblyId, 10)
        );

        return successResponse(
            res,
            'Estadísticas de asistencia obtenidas exitosamente',
            stats
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

        logger.error('Unexpected error in getAssemblyStats controller', {
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
 * Get member attendance history
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMemberHistory = async (req, res) => {
    try {
        const { memberId } = req.params;
        const limit = parseInt(req.query.limit) || 10;

        const history = await attendanceService.getMemberAttendanceHistory(
            parseInt(memberId, 10),
            limit
        );

        return successResponse(
            res,
            'Historial de asistencia obtenido exitosamente',
            history
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

        logger.error('Unexpected error in getMemberHistory controller', {
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
    registerByQr,
    registerManually,
    getAllAttendance,
    getAttendanceById,
    deleteAttendance,
    getAssemblyStats,
    getMemberHistory
};
