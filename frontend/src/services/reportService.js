/**
 * @file reportService.js
 * @description Service for report generation API calls
 * @module services/reportService
 */

import api from './api';

/**
 * Generate attendance report for an assembly
 * @param {string} assemblyId - Assembly ID
 * @param {Object} options - Report options
 * @param {string} options.format - Report format (pdf, excel, csv)
 * @returns {Promise<Object>} Report data or download URL
 */
export const generateAttendanceReport = async (assemblyId, options = {}) => {
    const response = await api.post(`/reports/attendance/${assemblyId}`, options);
    return response;
};

/**
 * Generate member attendance history report
 * @param {string} memberId - Member ID
 * @param {Object} options - Report options
 * @param {string} options.startDate - Start date (ISO format)
 * @param {string} options.endDate - End date (ISO format)
 * @param {string} options.format - Report format
 * @returns {Promise<Object>} Report data
 */
export const generateMemberAttendanceHistory = async (memberId, options = {}) => {
    const response = await api.post(`/reports/member/${memberId}/attendance`, options);
    return response;
};

/**
 * Generate assembly summary report
 * @param {string} assemblyId - Assembly ID
 * @param {Object} options - Report options
 * @returns {Promise<Object>} Assembly summary report
 */
export const generateAssemblySummary = async (assemblyId, options = {}) => {
    const response = await api.post(`/reports/assembly/${assemblyId}/summary`, options);
    return response;
};

/**
 * Generate monthly attendance statistics report
 * @param {Object} params - Query parameters
 * @param {number} params.year - Year
 * @param {number} params.month - Month (1-12)
 * @param {string} params.format - Report format
 * @returns {Promise<Object>} Monthly statistics report
 */
export const generateMonthlyStats = async (params = {}) => {
    const response = await api.post('/reports/monthly-stats', params);
    return response;
};

/**
 * Generate annual attendance report
 * @param {Object} params - Query parameters
 * @param {number} params.year - Year
 * @param {string} params.format - Report format
 * @returns {Promise<Object>} Annual report
 */
export const generateAnnualReport = async (params = {}) => {
    const response = await api.post('/reports/annual', params);
    return response;
};

/**
 * Get member statistics
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Member statistics
 */
export const getMemberStats = async (params = {}) => {
    const response = await api.get('/reports/members/stats', { params });
    return response;
};

/**
 * Get attendance statistics by grade
 * @param {Object} params - Query parameters
 * @param {string} params.assemblyId - Assembly ID (optional)
 * @returns {Promise<Object>} Attendance by grade statistics
 */
export const getAttendanceByGrade = async (params = {}) => {
    const response = await api.get('/reports/attendance/by-grade', { params });
    return response;
};

/**
 * Get attendance trends over time
 * @param {Object} params - Query parameters
 * @param {string} params.startDate - Start date
 * @param {string} params.endDate - End date
 * @returns {Promise<Object>} Attendance trends data
 */
export const getAttendanceTrends = async (params = {}) => {
    const response = await api.get('/reports/attendance/trends', { params });
    return response;
};

/**
 * Export data to Excel
 * @param {string} dataType - Type of data to export (members, assemblies, attendance)
 * @param {Object} filters - Optional filters
 * @returns {Promise<Blob>} Excel file blob
 */
export const exportToExcel = async (dataType, filters = {}) => {
    const response = await api.post(`/reports/export/${dataType}`, filters, {
        responseType: 'blob'
    });
    return response;
};

/**
 * Get dashboard statistics
 * @returns {Promise<Object>} Dashboard statistics
 */
export const getDashboardStats = async () => {
    const response = await api.get('/reports/dashboard/stats');
    return response;
};
