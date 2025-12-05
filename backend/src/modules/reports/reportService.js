/**
 * Report Service
 * Business logic for report generation
 * Handles PDF generation for attendance reports
 *
 * @module modules/reports/reportService
 */

const reportRepository = require('./reportRepository');
const assemblyRepository = require('../assemblies/assemblyRepository');
const { createAttendanceReport, createAttendanceStatsReport } = require('../../utils/pdfUtils');
const ERROR_CODES = require('../../constants/errorCodes');
const MESSAGES = require('../../constants/messages');
const logger = require('../../utils/logger');

/**
 * Custom error class for operational errors
 */
class ReportError extends Error {
    constructor(message, errorCode, statusCode) {
        super(message);
        this.errorCode = errorCode;
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}

/**
 * Generate attendance report PDF
 *
 * @param {number} assemblyId - Assembly ID
 * @param {Object} options - Report options
 * @returns {Promise<PDFDocument>} PDF document stream
 * @throws {ReportError} If validation fails
 */
const generateAttendanceReport = async (assemblyId, options = {}) => {
    try {
        // Verify assembly exists
        const assembly = await assemblyRepository.findById(assemblyId);
        if (!assembly) {
            throw new ReportError(
                MESSAGES.ASSEMBLY_NOT_FOUND,
                ERROR_CODES.ASSEMBLY_NOT_FOUND,
                404
            );
        }

        // Get report data
        const [assemblyData, attendeeList, totalMembers] = await Promise.all([
            reportRepository.getAttendanceReportData(assemblyId),
            reportRepository.getAttendeeList(assemblyId),
            reportRepository.getTotalActiveMembers()
        ]);

        if (!assemblyData) {
            throw new ReportError(
                MESSAGES.ASSEMBLY_NOT_FOUND,
                ERROR_CODES.ASSEMBLY_NOT_FOUND,
                404
            );
        }

        // Prepare stats
        const stats = {
            totalMembers,
            totalAttendees: parseInt(assemblyData.total_attendees, 10),
            qrRegistrations: parseInt(assemblyData.qr_registrations, 10),
            manualRegistrations: parseInt(assemblyData.manual_registrations, 10)
        };

        // Generate PDF
        const pdfDoc = createAttendanceReport(assemblyData, attendeeList, stats);

        logger.info('Attendance report generated', {
            assemblyId,
            totalAttendees: attendeeList.length
        });

        return pdfDoc;
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error generating attendance report:', error);
        throw new ReportError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Generate attendance statistics report PDF
 *
 * @param {number} assemblyId - Assembly ID
 * @returns {Promise<PDFDocument>} PDF document stream
 * @throws {ReportError} If validation fails
 */
const generateAttendanceStatsReport = async (assemblyId) => {
    try {
        // Verify assembly exists
        const assembly = await assemblyRepository.findById(assemblyId);
        if (!assembly) {
            throw new ReportError(
                MESSAGES.ASSEMBLY_NOT_FOUND,
                ERROR_CODES.ASSEMBLY_NOT_FOUND,
                404
            );
        }

        // Get report data
        const [assemblyData, statsByQualityLevel, totalMembers] = await Promise.all([
            reportRepository.getAttendanceReportData(assemblyId),
            reportRepository.getAttendanceStatsByQualityLevel(assemblyId),
            reportRepository.getTotalActiveMembers()
        ]);

        if (!assemblyData) {
            throw new ReportError(
                MESSAGES.ASSEMBLY_NOT_FOUND,
                ERROR_CODES.ASSEMBLY_NOT_FOUND,
                404
            );
        }

        // Prepare stats
        const stats = {
            totalMembers,
            totalAttendees: parseInt(assemblyData.total_attendees, 10),
            qrRegistrations: parseInt(assemblyData.qr_registrations, 10),
            manualRegistrations: parseInt(assemblyData.manual_registrations, 10)
        };

        // Generate PDF
        const pdfDoc = createAttendanceStatsReport(assemblyData, stats, statsByQualityLevel);

        logger.info('Attendance stats report generated', {
            assemblyId
        });

        return pdfDoc;
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error generating attendance stats report:', error);
        throw new ReportError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Get attendance statistics as JSON
 *
 * @param {number} assemblyId - Assembly ID
 * @returns {Promise<Object>} Attendance statistics
 * @throws {ReportError} If validation fails
 */
const getAttendanceStats = async (assemblyId) => {
    try {
        // Verify assembly exists
        const assembly = await assemblyRepository.findById(assemblyId);
        if (!assembly) {
            throw new ReportError(
                MESSAGES.ASSEMBLY_NOT_FOUND,
                ERROR_CODES.ASSEMBLY_NOT_FOUND,
                404
            );
        }

        // Get statistics
        const [assemblyData, statsByQualityLevel, totalMembers] = await Promise.all([
            reportRepository.getAttendanceReportData(assemblyId),
            reportRepository.getAttendanceStatsByQualityLevel(assemblyId),
            reportRepository.getTotalActiveMembers()
        ]);

        if (!assemblyData) {
            throw new ReportError(
                MESSAGES.ASSEMBLY_NOT_FOUND,
                ERROR_CODES.ASSEMBLY_NOT_FOUND,
                404
            );
        }

        const totalAttendees = parseInt(assemblyData.total_attendees, 10);
        const attendanceRate = totalMembers > 0
            ? ((totalAttendees / totalMembers) * 100).toFixed(2)
            : 0;

        // Format statistics by quality and level
        const byQualityLevel = [];
        statsByQualityLevel.forEach(stats => {
            byQualityLevel.push({
                qualityId: stats.quality_id,
                qualityCode: stats.quality_code,
                qualityName: stats.quality_name,
                levelId: stats.level_id,
                levelCode: stats.level_code,
                levelName: stats.level_name,
                total: parseInt(stats.total_members, 10),
                attended: parseInt(stats.attended, 10),
                rate: parseFloat(stats.attendance_rate)
            });
        });

        return {
            assembly: {
                assemblyId: assembly.assembly_id,
                title: assembly.title,
                scheduledDate: assembly.scheduled_date
            },
            stats: {
                totalMembers,
                totalAttendees,
                attendanceRate: parseFloat(attendanceRate),
                byQualityLevel,
                byRegistrationMethod: {
                    qr_scan: parseInt(assemblyData.qr_registrations, 10),
                    manual: parseInt(assemblyData.manual_registrations, 10)
                }
            }
        };
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error getting attendance stats:', error);
        throw new ReportError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

module.exports = {
    generateAttendanceReport,
    generateAttendanceStatsReport,
    getAttendanceStats,
    ReportError
};
