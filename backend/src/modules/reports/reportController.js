/**
 * Report Controller
 * Handles HTTP requests for report generation endpoints
 *
 * @module modules/reports/reportController
 */

const reportService = require('./reportService');
const { successResponse, errorResponse } = require('../../utils/responseFormatter');
const MESSAGES = require('../../constants/messages');
const ERROR_CODES = require('../../constants/errorCodes');
const logger = require('../../utils/logger');

/**
 * Generate attendance report PDF
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateAttendanceReport = async (req, res) => {
    try {
        const { assemblyId } = req.params;
        const options = {
            includePhotos: req.query.includePhotos === 'true'
        };

        const pdfDoc = await reportService.generateAttendanceReport(
            parseInt(assemblyId, 10),
            options
        );

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="asistencia-asamblea-${assemblyId}.pdf"`
        );

        // Pipe PDF to response
        pdfDoc.pipe(res);
        pdfDoc.end();
    } catch (error) {
        if (error.isOperational) {
            return errorResponse(
                res,
                error.message,
                error.errorCode,
                error.statusCode
            );
        }

        logger.error('Unexpected error in generateAttendanceReport controller', {
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
 * Generate attendance statistics report PDF
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateAttendanceStatsReport = async (req, res) => {
    try {
        const { assemblyId } = req.params;

        const pdfDoc = await reportService.generateAttendanceStatsReport(
            parseInt(assemblyId, 10)
        );

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="estadisticas-asamblea-${assemblyId}.pdf"`
        );

        // Pipe PDF to response
        pdfDoc.pipe(res);
        pdfDoc.end();
    } catch (error) {
        if (error.isOperational) {
            return errorResponse(
                res,
                error.message,
                error.errorCode,
                error.statusCode
            );
        }

        logger.error('Unexpected error in generateAttendanceStatsReport controller', {
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
 * Get attendance statistics as JSON
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAttendanceStats = async (req, res) => {
    try {
        const { assemblyId } = req.params;

        const stats = await reportService.getAttendanceStats(
            parseInt(assemblyId, 10)
        );

        return successResponse(
            res,
            'Estadísticas obtenidas exitosamente',
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

        logger.error('Unexpected error in getAttendanceStats controller', {
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
    generateAttendanceReport,
    generateAttendanceStatsReport,
    getAttendanceStats
};
