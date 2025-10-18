/**
 * @file attendanceService.js
 * @description Service for attendance-related API calls
 * @module services/attendanceService
 */

import api from './api';

/**
 * Record attendance by scanning QR code
 * @param {Object} attendanceData - Attendance data
 * @param {string} attendanceData.qrHash - QR hash from scanned code
 * @param {string} attendanceData.assemblyId - Assembly ID (optional, uses active assembly if not provided)
 * @returns {Promise<Object>} Recorded attendance data with member info
 */
export const recordAttendanceByQR = async (attendanceData) => {
    const response = await api.post('/attendance/scan', attendanceData);
    return response;
};

/**
 * Record attendance manually
 * @param {Object} attendanceData - Attendance data
 * @param {string} attendanceData.memberId - Member ID
 * @param {string} attendanceData.assemblyId - Assembly ID (optional, uses active assembly if not provided)
 * @param {string} attendanceData.notes - Optional notes
 * @returns {Promise<Object>} Recorded attendance data
 */
export const recordAttendanceManually = async (attendanceData) => {
    const response = await api.post('/attendance/manual', attendanceData);
    return response;
};

/**
 * Get all attendance records with filters
 * @param {Object} params - Query parameters
 * @param {string} params.assemblyId - Filter by assembly ID
 * @param {string} params.memberId - Filter by member ID
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise<Object>} Response with data and pagination info
 */
export const getAllAttendance = async (params = {}) => {
    const response = await api.get('/attendance', { params });
    return response;
};

/**
 * Get attendance records for a specific assembly
 * @param {string} assemblyId - Assembly ID
 * @param {Object} params - Optional query parameters
 * @returns {Promise<Object>} Attendance records
 */
export const getAttendanceByAssembly = async (assemblyId, params = {}) => {
    const response = await api.get(`/attendance/assembly/${assemblyId}`, { params });
    return response;
};

/**
 * Get attendance statistics for an assembly
 * @param {string} assemblyId - Assembly ID
 * @returns {Promise<Object>} Attendance statistics
 */
export const getAttendanceStats = async (assemblyId) => {
    const response = await api.get(`/attendance/assembly/${assemblyId}/stats`);
    return response;
};

/**
 * Get attendance records for a specific member
 * @param {string} memberId - Member ID
 * @param {Object} params - Optional query parameters
 * @returns {Promise<Object>} Attendance records
 */
export const getAttendanceByMember = async (memberId, params = {}) => {
    const response = await api.get(`/attendance/member/${memberId}`, { params });
    return response;
};

/**
 * Update attendance record
 * @param {string} attendanceId - Attendance ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated attendance record
 */
export const updateAttendance = async (attendanceId, updateData) => {
    const response = await api.put(`/attendance/${attendanceId}`, updateData);
    return response;
};

/**
 * Delete attendance record
 * @param {string} attendanceId - Attendance ID
 * @returns {Promise<Object>} Response message
 */
export const deleteAttendance = async (attendanceId) => {
    const response = await api.delete(`/attendance/${attendanceId}`);
    return response;
};

/**
 * Check if member has already attended an assembly
 * @param {string} memberId - Member ID
 * @param {string} assemblyId - Assembly ID
 * @returns {Promise<Object>} Attendance status
 */
export const checkAttendance = async (memberId, assemblyId) => {
    const response = await api.get(`/attendance/check`, {
        params: { memberId, assemblyId }
    });
    return response;
};

/**
 * Get attendance summary for current month
 * @returns {Promise<Object>} Monthly attendance summary
 */
export const getMonthlyAttendanceSummary = async () => {
    const response = await api.get('/attendance/summary/monthly');
    return response;
};
