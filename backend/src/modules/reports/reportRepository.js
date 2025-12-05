/**
 * Report Repository
 * Database layer for report data retrieval
 *
 * @module modules/reports/reportRepository
 */

const db = require('../../config/database');
const logger = require('../../utils/logger');

/**
 * Get attendance data for assembly report
 *
 * @param {number} assemblyId - Assembly ID
 * @returns {Promise<Object>} Assembly and attendance data
 */
const getAttendanceReportData = async (assemblyId) => {
    try {
        const query = `
            SELECT
                a.assembly_id,
                a.title,
                a.description,
                a.scheduled_date,
                a.start_time,
                a.end_time,
                a.location,
                a.is_active,
                COUNT(ar.attendance_id) as total_attendees,
                COUNT(CASE WHEN ar.registration_method = 'qr_scan' THEN 1 END) as qr_registrations,
                COUNT(CASE WHEN ar.registration_method = 'manual' THEN 1 END) as manual_registrations
            FROM assemblies a
            LEFT JOIN attendance_records ar ON a.assembly_id = ar.assembly_id
            WHERE a.assembly_id = $1
            GROUP BY
                a.assembly_id,
                a.title,
                a.description,
                a.scheduled_date,
                a.start_time,
                a.end_time,
                a.location,
                a.is_active
        `;

        const result = await db.query(query, [assemblyId]);
        return result.rows[0] || null;
    } catch (error) {
        logger.error('Error getting attendance report data:', error);
        throw error;
    }
};

/**
 * Get attendee list for assembly report
 *
 * @param {number} assemblyId - Assembly ID
 * @returns {Promise<Array>} Array of attendee records
 */
const getAttendeeList = async (assemblyId) => {
    try {
        const query = `
            SELECT
                ar.attendance_id,
                ar.registered_at,
                ar.registration_method,
                ar.notes,
                m.member_id,
                m.full_name,
                m.identification,
                m.quality_id,
                m.level_id,
                mq.quality_code,
                mq.quality_name,
                ml.level_code,
                ml.level_name,
                m.photo_url,
                u.full_name as registered_by_name
            FROM attendance_records ar
            INNER JOIN members m ON ar.member_id = m.member_id
            INNER JOIN member_qualities mq ON m.quality_id = mq.quality_id
            LEFT JOIN member_levels ml ON m.level_id = ml.level_id
            INNER JOIN users u ON ar.registered_by = u.user_id
            WHERE ar.assembly_id = $1
            ORDER BY mq.quality_code, ml.level_code, m.full_name
        `;

        const result = await db.query(query, [assemblyId]);
        return result.rows;
    } catch (error) {
        logger.error('Error getting attendee list:', error);
        throw error;
    }
};

/**
 * Get attendance statistics by quality and level for assembly
 *
 * @param {number} assemblyId - Assembly ID
 * @returns {Promise<Array>} Attendance statistics by quality and level
 */
const getAttendanceStatsByQualityLevel = async (assemblyId) => {
    try {
        const query = `
            SELECT
                m.quality_id,
                mq.quality_code,
                mq.quality_name,
                m.level_id,
                ml.level_code,
                ml.level_name,
                COUNT(DISTINCT m.member_id) as total_members,
                COUNT(ar.attendance_id) as attended,
                ROUND(
                    (COUNT(ar.attendance_id)::numeric / COUNT(DISTINCT m.member_id)::numeric * 100),
                    2
                ) as attendance_rate
            FROM members m
            INNER JOIN member_qualities mq ON m.quality_id = mq.quality_id
            LEFT JOIN member_levels ml ON m.level_id = ml.level_id
            LEFT JOIN attendance_records ar ON m.member_id = ar.member_id AND ar.assembly_id = $1
            WHERE m.is_active = true
            GROUP BY m.quality_id, mq.quality_code, mq.quality_name, m.level_id, ml.level_code, ml.level_name
            ORDER BY m.quality_id, m.level_id
        `;

        const result = await db.query(query, [assemblyId]);
        return result.rows;
    } catch (error) {
        logger.error('Error getting attendance stats by quality/level:', error);
        throw error;
    }
};

/**
 * Get attendance statistics by grade for assembly
 * @deprecated Use getAttendanceStatsByQualityLevel() instead
 *
 * @param {number} assemblyId - Assembly ID
 * @returns {Promise<Array>} Attendance statistics by grade (mapped from quality/level)
 */
const getAttendanceStatsByGrade = async (assemblyId) => {
    logger.warn('getAttendanceStatsByGrade is deprecated. Use getAttendanceStatsByQualityLevel instead.');
    return getAttendanceStatsByQualityLevel(assemblyId);
};

/**
 * Get total active members count
 *
 * @returns {Promise<number>} Total active members
 */
const getTotalActiveMembers = async () => {
    try {
        const query = 'SELECT COUNT(*) as count FROM members WHERE is_active = true';
        const result = await db.query(query);
        return parseInt(result.rows[0].count, 10);
    } catch (error) {
        logger.error('Error getting total active members:', error);
        throw error;
    }
};

module.exports = {
    getAttendanceReportData,
    getAttendeeList,
    getAttendanceStatsByQualityLevel,
    getAttendanceStatsByGrade, // deprecated
    getTotalActiveMembers
};
