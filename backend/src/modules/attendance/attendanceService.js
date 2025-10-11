/**
 * Attendance Service
 * Business logic for attendance operations
 * Implements QR scanning, visual verification, and manual registration
 *
 * @module modules/attendance/attendanceService
 */

const attendanceRepository = require('./attendanceRepository');
const assemblyRepository = require('../assemblies/assemblyRepository');
const memberRepository = require('../members/memberRepository');
const ERROR_CODES = require('../../constants/errorCodes');
const MESSAGES = require('../../constants/messages');
const logger = require('../../utils/logger');

/**
 * Custom error class for operational errors
 */
class AttendanceError extends Error {
    constructor(message, errorCode, statusCode) {
        super(message);
        this.errorCode = errorCode;
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}

/**
 * Register attendance by QR scan
 * Scans member QR code and registers attendance to active assembly
 *
 * @param {string} qrHash - QR hash from scanned code
 * @param {number} userId - User ID who is scanning
 * @returns {Promise<Object>} Attendance record with member info
 * @throws {AttendanceError} If validation fails
 */
const registerAttendanceByQr = async (qrHash, userId) => {
    try {
        // Step 1: Get active assembly
        const activeAssembly = await assemblyRepository.findActive();

        if (!activeAssembly) {
            throw new AttendanceError(
                MESSAGES.NO_ACTIVE_ASSEMBLY,
                ERROR_CODES.NO_ACTIVE_ASSEMBLY,
                404
            );
        }

        // Step 2: Find member by QR hash
        const member = await memberRepository.findByQrHash(qrHash);

        if (!member) {
            throw new AttendanceError(
                MESSAGES.INVALID_QR,
                ERROR_CODES.INVALID_QR_CODE,
                404
            );
        }

        // Step 3: Check if member is active
        if (!member.is_active) {
            throw new AttendanceError(
                MESSAGES.MEMBER_INACTIVE,
                ERROR_CODES.MEMBER_INACTIVE,
                403
            );
        }

        // Step 4: Check if attendance already registered
        const existingAttendance = await attendanceRepository.findByMemberAndAssembly(
            member.member_id,
            activeAssembly.assembly_id
        );

        if (existingAttendance) {
            throw new AttendanceError(
                MESSAGES.ATTENDANCE_ALREADY_REGISTERED,
                ERROR_CODES.ATTENDANCE_ALREADY_REGISTERED,
                409
            );
        }

        // Step 5: Register attendance
        const attendance = await attendanceRepository.create({
            memberId: member.member_id,
            assemblyId: activeAssembly.assembly_id,
            registeredBy: userId,
            registrationMethod: 'qr_scan',
            notes: null
        });

        logger.info('Attendance registered via QR scan', {
            attendanceId: attendance.attendance_id,
            memberId: member.member_id,
            assemblyId: activeAssembly.assembly_id,
            registeredBy: userId
        });

        return {
            attendance,
            member: {
                memberId: member.member_id,
                fullName: member.full_name,
                identification: member.identification,
                grade: member.grade,
                section: member.section,
                photoUrl: member.photo_url
            },
            assembly: {
                assemblyId: activeAssembly.assembly_id,
                title: activeAssembly.title,
                scheduledDate: activeAssembly.scheduled_date
            }
        };
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error registering attendance by QR:', error);
        throw new AttendanceError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Register attendance manually
 * Allows registrar to manually register attendance with visual verification
 *
 * @param {number} memberId - Member ID
 * @param {number} userId - User ID who is registering
 * @param {string} notes - Optional notes
 * @returns {Promise<Object>} Attendance record with member info
 * @throws {AttendanceError} If validation fails
 */
const registerAttendanceManually = async (memberId, userId, notes = null) => {
    try {
        // Step 1: Get active assembly
        const activeAssembly = await assemblyRepository.findActive();

        if (!activeAssembly) {
            throw new AttendanceError(
                MESSAGES.NO_ACTIVE_ASSEMBLY,
                ERROR_CODES.NO_ACTIVE_ASSEMBLY,
                404
            );
        }

        // Step 2: Find member
        const member = await memberRepository.findById(memberId);

        if (!member) {
            throw new AttendanceError(
                MESSAGES.MEMBER_NOT_FOUND,
                ERROR_CODES.MEMBER_NOT_FOUND,
                404
            );
        }

        // Step 3: Check if member is active
        if (!member.is_active) {
            throw new AttendanceError(
                MESSAGES.MEMBER_INACTIVE,
                ERROR_CODES.MEMBER_INACTIVE,
                403
            );
        }

        // Step 4: Check if attendance already registered
        const existingAttendance = await attendanceRepository.findByMemberAndAssembly(
            member.member_id,
            activeAssembly.assembly_id
        );

        if (existingAttendance) {
            throw new AttendanceError(
                MESSAGES.ATTENDANCE_ALREADY_REGISTERED,
                ERROR_CODES.ATTENDANCE_ALREADY_REGISTERED,
                409
            );
        }

        // Step 5: Register attendance
        const attendance = await attendanceRepository.create({
            memberId: member.member_id,
            assemblyId: activeAssembly.assembly_id,
            registeredBy: userId,
            registrationMethod: 'manual',
            notes
        });

        logger.info('Attendance registered manually', {
            attendanceId: attendance.attendance_id,
            memberId: member.member_id,
            assemblyId: activeAssembly.assembly_id,
            registeredBy: userId
        });

        return {
            attendance,
            member: {
                memberId: member.member_id,
                fullName: member.full_name,
                identification: member.identification,
                grade: member.grade,
                section: member.section,
                photoUrl: member.photo_url
            },
            assembly: {
                assemblyId: activeAssembly.assembly_id,
                title: activeAssembly.title,
                scheduledDate: activeAssembly.scheduled_date
            }
        };
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error registering attendance manually:', error);
        throw new AttendanceError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Get attendance record by ID
 *
 * @param {number} attendanceId - Attendance ID
 * @returns {Promise<Object>} Attendance record
 * @throws {AttendanceError} If not found
 */
const getAttendanceById = async (attendanceId) => {
    try {
        const attendance = await attendanceRepository.findById(attendanceId);

        if (!attendance) {
            throw new AttendanceError(
                MESSAGES.ATTENDANCE_NOT_FOUND,
                ERROR_CODES.ATTENDANCE_NOT_FOUND,
                404
            );
        }

        return attendance;
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error getting attendance by ID:', error);
        throw new AttendanceError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Get all attendance records with filters and pagination
 *
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Object>} Attendance records and pagination
 */
const getAllAttendance = async (filters = {}) => {
    try {
        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 50;
        const offset = (page - 1) * limit;

        const queryFilters = {
            assemblyId: filters.assemblyId,
            memberId: filters.memberId,
            registrationMethod: filters.registrationMethod,
            registeredBy: filters.registeredBy,
            fromDate: filters.fromDate,
            toDate: filters.toDate,
            grade: filters.grade,
            section: filters.section,
            limit,
            offset
        };

        const [attendanceRecords, total] = await Promise.all([
            attendanceRepository.findAll(queryFilters),
            attendanceRepository.count(queryFilters)
        ]);

        return {
            attendanceRecords,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        logger.error('Error getting all attendance:', error);
        throw new AttendanceError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Delete attendance record
 * Allows correction of mistakes
 *
 * @param {number} attendanceId - Attendance ID
 * @returns {Promise<boolean>} True if deleted
 * @throws {AttendanceError} If not found
 */
const deleteAttendance = async (attendanceId) => {
    try {
        // Check if attendance exists
        const attendance = await attendanceRepository.findById(attendanceId);

        if (!attendance) {
            throw new AttendanceError(
                MESSAGES.ATTENDANCE_NOT_FOUND,
                ERROR_CODES.ATTENDANCE_NOT_FOUND,
                404
            );
        }

        // Delete attendance
        await attendanceRepository.deleteAttendance(attendanceId);

        logger.info('Attendance deleted', {
            attendanceId
        });

        return true;
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error deleting attendance:', error);
        throw new AttendanceError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Get attendance statistics for an assembly
 *
 * @param {number} assemblyId - Assembly ID
 * @returns {Promise<Object>} Attendance statistics
 */
const getAssemblyAttendanceStats = async (assemblyId) => {
    try {
        // Verify assembly exists
        const assembly = await assemblyRepository.findById(assemblyId);

        if (!assembly) {
            throw new AttendanceError(
                MESSAGES.ASSEMBLY_NOT_FOUND,
                ERROR_CODES.ASSEMBLY_NOT_FOUND,
                404
            );
        }

        const [stats, byGrade] = await Promise.all([
            attendanceRepository.getAssemblyStats(assemblyId),
            attendanceRepository.getAttendanceByGrade(assemblyId)
        ]);

        return {
            assembly: {
                assemblyId: assembly.assembly_id,
                title: assembly.title,
                scheduledDate: assembly.scheduled_date
            },
            stats,
            byGrade
        };
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error getting assembly attendance stats:', error);
        throw new AttendanceError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

/**
 * Get member attendance history
 *
 * @param {number} memberId - Member ID
 * @param {number} limit - Limit results
 * @returns {Promise<Array>} Attendance history
 */
const getMemberAttendanceHistory = async (memberId, limit = 10) => {
    try {
        // Verify member exists
        const member = await memberRepository.findById(memberId);

        if (!member) {
            throw new AttendanceError(
                MESSAGES.MEMBER_NOT_FOUND,
                ERROR_CODES.MEMBER_NOT_FOUND,
                404
            );
        }

        const history = await attendanceRepository.getMemberAttendanceHistory(
            memberId,
            limit
        );

        return {
            member: {
                memberId: member.member_id,
                fullName: member.full_name,
                identification: member.identification
            },
            history
        };
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }

        logger.error('Error getting member attendance history:', error);
        throw new AttendanceError(
            MESSAGES.INTERNAL_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            500
        );
    }
};

module.exports = {
    registerAttendanceByQr,
    registerAttendanceManually,
    getAttendanceById,
    getAllAttendance,
    deleteAttendance,
    getAssemblyAttendanceStats,
    getMemberAttendanceHistory,
    AttendanceError
};
