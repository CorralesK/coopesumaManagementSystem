/**
 * Attendance Repository
 * Database layer for attendance operations
 *
 * @module modules/attendance/attendanceRepository
 */

const db = require('../../config/database');
const logger = require('../../utils/logger');

/**
 * Find attendance record by ID
 *
 * @param {number} attendanceId - Attendance ID
 * @returns {Promise<Object|null>} Attendance object or null
 */
const findById = async (attendanceId) => {
    try {
        const query = `
            SELECT
                ar.attendance_id,
                ar.member_id,
                ar.assembly_id,
                ar.registered_at,
                ar.registered_by,
                ar.registration_method,
                ar.notes,
                m.full_name as member_name,
                m.identification as member_identification,
                m.grade as member_grade,
                m.section as member_section,
                a.title as assembly_title,
                u.full_name as registered_by_name
            FROM attendance_records ar
            INNER JOIN members m ON ar.member_id = m.member_id
            INNER JOIN assemblies a ON ar.assembly_id = a.assembly_id
            INNER JOIN users u ON ar.registered_by = u.user_id
            WHERE ar.attendance_id = $1
        `;

        const result = await db.query(query, [attendanceId]);
        return result.rows[0] || null;
    } catch (error) {
        logger.error('Error finding attendance by ID:', error);
        throw error;
    }
};

/**
 * Find attendance record by member and assembly
 *
 * @param {number} memberId - Member ID
 * @param {number} assemblyId - Assembly ID
 * @returns {Promise<Object|null>} Attendance object or null
 */
const findByMemberAndAssembly = async (memberId, assemblyId) => {
    try {
        const query = `
            SELECT
                ar.attendance_id,
                ar.member_id,
                ar.assembly_id,
                ar.registered_at,
                ar.registered_by,
                ar.registration_method,
                ar.notes
            FROM attendance_records ar
            WHERE ar.member_id = $1 AND ar.assembly_id = $2
        `;

        const result = await db.query(query, [memberId, assemblyId]);
        return result.rows[0] || null;
    } catch (error) {
        logger.error('Error finding attendance by member and assembly:', error);
        throw error;
    }
};

/**
 * Find all attendance records with optional filters
 *
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Array of attendance objects
 */
const findAll = async (filters = {}) => {
    try {
        let query = `
            SELECT
                ar.attendance_id,
                ar.member_id,
                ar.assembly_id,
                ar.registered_at,
                ar.registered_by,
                ar.registration_method,
                ar.notes,
                m.full_name as member_name,
                m.identification as member_identification,
                m.grade as member_grade,
                m.section as member_section,
                a.title as assembly_title,
                a.scheduled_date as assembly_date,
                u.full_name as registered_by_name
            FROM attendance_records ar
            INNER JOIN members m ON ar.member_id = m.member_id
            INNER JOIN assemblies a ON ar.assembly_id = a.assembly_id
            INNER JOIN users u ON ar.registered_by = u.user_id
            WHERE 1=1
        `;

        const params = [];
        let paramIndex = 1;

        if (filters.assemblyId) {
            query += ` AND ar.assembly_id = $${paramIndex}`;
            params.push(filters.assemblyId);
            paramIndex++;
        }

        if (filters.memberId) {
            query += ` AND ar.member_id = $${paramIndex}`;
            params.push(filters.memberId);
            paramIndex++;
        }

        if (filters.registrationMethod) {
            query += ` AND ar.registration_method = $${paramIndex}`;
            params.push(filters.registrationMethod);
            paramIndex++;
        }

        if (filters.registeredBy) {
            query += ` AND ar.registered_by = $${paramIndex}`;
            params.push(filters.registeredBy);
            paramIndex++;
        }

        if (filters.fromDate) {
            query += ` AND ar.registered_at >= $${paramIndex}`;
            params.push(filters.fromDate);
            paramIndex++;
        }

        if (filters.toDate) {
            query += ` AND ar.registered_at <= $${paramIndex}`;
            params.push(filters.toDate);
            paramIndex++;
        }

        if (filters.grade) {
            query += ` AND m.grade = $${paramIndex}`;
            params.push(filters.grade);
            paramIndex++;
        }

        if (filters.section) {
            query += ` AND m.section = $${paramIndex}`;
            params.push(filters.section);
            paramIndex++;
        }

        query += ' ORDER BY ar.registered_at DESC';

        // Pagination
        if (filters.limit) {
            query += ` LIMIT $${paramIndex}`;
            params.push(filters.limit);
            paramIndex++;
        }

        if (filters.offset) {
            query += ` OFFSET $${paramIndex}`;
            params.push(filters.offset);
        }

        const result = await db.query(query, params);
        return result.rows;
    } catch (error) {
        logger.error('Error finding all attendance records:', error);
        throw error;
    }
};

/**
 * Count attendance records with optional filters
 *
 * @param {Object} filters - Filter criteria
 * @returns {Promise<number>} Count of attendance records
 */
const count = async (filters = {}) => {
    try {
        let query = `
            SELECT COUNT(*) as count
            FROM attendance_records ar
            INNER JOIN members m ON ar.member_id = m.member_id
            WHERE 1=1
        `;

        const params = [];
        let paramIndex = 1;

        if (filters.assemblyId) {
            query += ` AND ar.assembly_id = $${paramIndex}`;
            params.push(filters.assemblyId);
            paramIndex++;
        }

        if (filters.memberId) {
            query += ` AND ar.member_id = $${paramIndex}`;
            params.push(filters.memberId);
            paramIndex++;
        }

        if (filters.registrationMethod) {
            query += ` AND ar.registration_method = $${paramIndex}`;
            params.push(filters.registrationMethod);
            paramIndex++;
        }

        if (filters.registeredBy) {
            query += ` AND ar.registered_by = $${paramIndex}`;
            params.push(filters.registeredBy);
            paramIndex++;
        }

        if (filters.fromDate) {
            query += ` AND ar.registered_at >= $${paramIndex}`;
            params.push(filters.fromDate);
            paramIndex++;
        }

        if (filters.toDate) {
            query += ` AND ar.registered_at <= $${paramIndex}`;
            params.push(filters.toDate);
            paramIndex++;
        }

        if (filters.grade) {
            query += ` AND m.grade = $${paramIndex}`;
            params.push(filters.grade);
            paramIndex++;
        }

        if (filters.section) {
            query += ` AND m.section = $${paramIndex}`;
            params.push(filters.section);
        }

        const result = await db.query(query, params);
        return parseInt(result.rows[0].count, 10);
    } catch (error) {
        logger.error('Error counting attendance records:', error);
        throw error;
    }
};

/**
 * Create attendance record
 *
 * @param {Object} attendanceData - Attendance data
 * @returns {Promise<Object>} Created attendance object
 */
const create = async (attendanceData) => {
    try {
        const query = `
            INSERT INTO attendance_records (
                member_id,
                assembly_id,
                registered_by,
                registration_method,
                notes
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING
                attendance_id,
                member_id,
                assembly_id,
                registered_at,
                registered_by,
                registration_method,
                notes
        `;

        const values = [
            attendanceData.memberId,
            attendanceData.assemblyId,
            attendanceData.registeredBy,
            attendanceData.registrationMethod || 'qr_scan',
            attendanceData.notes || null
        ];

        const result = await db.query(query, values);
        return result.rows[0];
    } catch (error) {
        logger.error('Error creating attendance record:', error);
        throw error;
    }
};

/**
 * Delete attendance record
 *
 * @param {number} attendanceId - Attendance ID
 * @returns {Promise<boolean>} True if deleted
 */
const deleteAttendance = async (attendanceId) => {
    try {
        const query = 'DELETE FROM attendance_records WHERE attendance_id = $1';
        await db.query(query, [attendanceId]);
        return true;
    } catch (error) {
        logger.error('Error deleting attendance record:', error);
        throw error;
    }
};

/**
 * Get attendance statistics for an assembly
 *
 * @param {number} assemblyId - Assembly ID
 * @returns {Promise<Object>} Attendance statistics
 */
const getAssemblyStats = async (assemblyId) => {
    try {
        const query = `
            SELECT
                COUNT(*) as total_attendance,
                COUNT(CASE WHEN registration_method = 'qr_scan' THEN 1 END) as qr_scans,
                COUNT(CASE WHEN registration_method = 'manual' THEN 1 END) as manual_registrations,
                COUNT(DISTINCT m.grade) as grades_represented,
                MIN(ar.registered_at) as first_registration,
                MAX(ar.registered_at) as last_registration
            FROM attendance_records ar
            INNER JOIN members m ON ar.member_id = m.member_id
            WHERE ar.assembly_id = $1
        `;

        const result = await db.query(query, [assemblyId]);
        return result.rows[0];
    } catch (error) {
        logger.error('Error getting assembly attendance stats:', error);
        throw error;
    }
};

/**
 * Get attendance by grade for an assembly
 *
 * @param {number} assemblyId - Assembly ID
 * @returns {Promise<Array>} Attendance by grade
 */
const getAttendanceByGrade = async (assemblyId) => {
    try {
        const query = `
            SELECT
                m.grade,
                COUNT(*) as attendance_count
            FROM attendance_records ar
            INNER JOIN members m ON ar.member_id = m.member_id
            WHERE ar.assembly_id = $1
            GROUP BY m.grade
            ORDER BY m.grade
        `;

        const result = await db.query(query, [assemblyId]);
        return result.rows;
    } catch (error) {
        logger.error('Error getting attendance by grade:', error);
        throw error;
    }
};

/**
 * Get attendance history for a member
 *
 * @param {number} memberId - Member ID
 * @param {number} limit - Limit results
 * @returns {Promise<Array>} Attendance history
 */
const getMemberAttendanceHistory = async (memberId, limit = 10) => {
    try {
        const query = `
            SELECT
                ar.attendance_id,
                ar.assembly_id,
                ar.registered_at,
                ar.registration_method,
                a.title as assembly_title,
                a.scheduled_date as assembly_date
            FROM attendance_records ar
            INNER JOIN assemblies a ON ar.assembly_id = a.assembly_id
            WHERE ar.member_id = $1
            ORDER BY ar.registered_at DESC
            LIMIT $2
        `;

        const result = await db.query(query, [memberId, limit]);
        return result.rows;
    } catch (error) {
        logger.error('Error getting member attendance history:', error);
        throw error;
    }
};

module.exports = {
    findById,
    findByMemberAndAssembly,
    findAll,
    count,
    create,
    deleteAttendance,
    getAssemblyStats,
    getAttendanceByGrade,
    getMemberAttendanceHistory
};
