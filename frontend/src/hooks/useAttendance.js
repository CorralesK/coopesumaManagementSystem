/**
 * @file useAttendance.js
 * @description Custom hook for attendance-related operations
 * @module hooks/useAttendance
 */

import { useState, useEffect, useCallback } from 'react';
import {
    getAllAttendance,
    getAttendanceByAssembly,
    getAttendanceStats,
    recordAttendanceByQR,
    recordAttendanceManually,
    checkAttendance
} from '../services/attendanceService';

/**
 * Hook for fetching and managing attendance records
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} Attendance state and operations
 */
export const useAttendance = (initialFilters = {}) => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        assemblyId: '',
        memberId: '',
        page: 1,
        limit: 50,
        ...initialFilters
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0
    });

    /**
     * Fetch attendance records with current filters
     */
    const fetchAttendance = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                page: filters.page,
                limit: filters.limit,
                ...(filters.assemblyId && { assemblyId: filters.assemblyId }),
                ...(filters.memberId && { memberId: filters.memberId })
            };

            const response = await getAllAttendance(params);

            setAttendance(response.data || []);
            setPagination({
                currentPage: response.pagination?.page || 1,
                totalPages: response.pagination?.totalPages || 1,
                total: response.pagination?.total || 0
            });
        } catch (err) {
            setError(err.message || 'Error al cargar la asistencia');
            setAttendance([]);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    /**
     * Update filters
     * @param {Object} newFilters - New filter values
     */
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters,
            page: 1
        }));
    }, []);

    /**
     * Change page
     * @param {number} page - New page number
     */
    const setPage = useCallback((page) => {
        setFilters(prev => ({ ...prev, page }));
    }, []);

    /**
     * Reset filters to initial values
     */
    const resetFilters = useCallback(() => {
        setFilters({
            assemblyId: '',
            memberId: '',
            page: 1,
            limit: 50,
            ...initialFilters
        });
    }, [initialFilters]);

    // Fetch attendance when filters change
    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    return {
        attendance,
        loading,
        error,
        filters,
        pagination,
        updateFilters,
        setPage,
        resetFilters,
        refetch: fetchAttendance
    };
};

/**
 * Hook for fetching attendance by assembly
 * @param {string} assemblyId - Assembly ID
 * @returns {Object} Assembly attendance state and operations
 */
export const useAssemblyAttendance = (assemblyId) => {
    const [attendance, setAttendance] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAttendance = useCallback(async () => {
        if (!assemblyId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Fetch both attendance records and stats
            const [attendanceResponse, statsResponse] = await Promise.all([
                getAttendanceByAssembly(assemblyId),
                getAttendanceStats(assemblyId)
            ]);

            setAttendance(attendanceResponse.data || []);
            setStats(statsResponse.data || null);
        } catch (err) {
            setError(err.message || 'Error al cargar la asistencia');
            setAttendance([]);
            setStats(null);
        } finally {
            setLoading(false);
        }
    }, [assemblyId]);

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    return {
        attendance,
        stats,
        loading,
        error,
        refetch: fetchAttendance
    };
};

/**
 * Hook for recording attendance
 * @returns {Object} Attendance recording operations with states
 */
export const useAttendanceRecording = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [recordedAttendance, setRecordedAttendance] = useState(null);

    /**
     * Record attendance by scanning QR code
     * @param {string} qrHash - QR hash from scanned code
     * @param {string} assemblyId - Assembly ID (optional)
     * @returns {Promise<Object>} Recorded attendance
     */
    const recordByQR = useCallback(async (qrHash, assemblyId = null) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);
            setRecordedAttendance(null);

            const data = { qrHash };
            if (assemblyId) {
                data.assemblyId = assemblyId;
            }

            const response = await recordAttendanceByQR(data);
            setRecordedAttendance(response.data);
            setSuccess(true);

            return response;
        } catch (err) {
            setError(err.message || 'Error al registrar asistencia');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Record attendance manually
     * @param {string} memberId - Member ID
     * @param {string} assemblyId - Assembly ID (optional)
     * @param {string} notes - Optional notes
     * @returns {Promise<Object>} Recorded attendance
     */
    const recordManually = useCallback(async (memberId, assemblyId = null, notes = '') => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);
            setRecordedAttendance(null);

            const data = { memberId, notes };
            if (assemblyId) {
                data.assemblyId = assemblyId;
            }

            const response = await recordAttendanceManually(data);
            setRecordedAttendance(response.data);
            setSuccess(true);

            return response;
        } catch (err) {
            setError(err.message || 'Error al registrar asistencia manual');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Check if member has already attended
     * @param {string} memberId - Member ID
     * @param {string} assemblyId - Assembly ID
     * @returns {Promise<boolean>} Attendance status
     */
    const checkMemberAttendance = useCallback(async (memberId, assemblyId) => {
        try {
            const response = await checkAttendance(memberId, assemblyId);
            return response.data?.hasAttended || false;
        } catch (err) {
            console.error('Error checking attendance:', err);
            return false;
        }
    }, []);

    /**
     * Clear all states
     */
    const clearState = useCallback(() => {
        setError(null);
        setSuccess(false);
        setRecordedAttendance(null);
    }, []);

    return {
        loading,
        error,
        success,
        recordedAttendance,
        recordByQR,
        recordManually,
        checkMemberAttendance,
        clearState
    };
};

export default useAttendance;
