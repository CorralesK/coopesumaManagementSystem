/**
 * @file useReports.js
 * @description Custom hooks for reports generation and statistics
 * @module hooks/useReports
 */

import { useState, useCallback } from 'react';
import * as reportService from '../services/reportService';

/**
 * Hook for generating and downloading reports
 * @returns {Object} Report generation functions, loading state, and error
 */
export const useReports = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateAttendanceReport = useCallback(async (assemblyId, options = {}) => {
        try {
            setLoading(true);
            setError(null);

            // Get the PDF file from the API
            const response = await reportService.generateAttendanceReport(assemblyId, options);

            // Create a blob from the response
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            // Create a temporary link and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte-asistencia-${assemblyId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return { success: true, downloadUrl: url };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al generar reporte de asistencia';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const generateMemberHistory = useCallback(async (memberId, options = {}) => {
        try {
            setLoading(true);
            setError(null);
            const response = await reportService.generateMemberAttendanceHistory(memberId, options);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al generar historial de asistencia';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const generateAssemblySummary = useCallback(async (assemblyId, options = {}) => {
        try {
            setLoading(true);
            setError(null);
            const response = await reportService.generateAssemblySummary(assemblyId, options);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al generar resumen de asamblea';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const exportData = useCallback(async (dataType, filters = {}) => {
        try {
            setLoading(true);
            setError(null);
            const response = await reportService.exportToExcel(dataType, filters);

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${dataType}_export_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return true;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al exportar datos';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        generateAttendanceReport,
        generateMemberHistory,
        generateAssemblySummary,
        exportData,
        loading,
        error
    };
};

/**
 * Hook for fetching report statistics
 * @returns {Object} Statistics functions, loading state, and error
 */
export const useReportStats = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getMemberStats = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            setError(null);
            const response = await reportService.getMemberStats(params);
            return response.data.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al obtener estadísticas de miembros';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const getAttendanceByGrade = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            setError(null);
            const response = await reportService.getAttendanceByGrade(params);
            return response.data.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al obtener asistencia por grado';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const getAttendanceTrends = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            setError(null);
            const response = await reportService.getAttendanceTrends(params);
            return response.data.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al obtener tendencias de asistencia';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const getDashboardStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await reportService.getDashboardStats();
            return response.data.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al obtener estadísticas';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        getMemberStats,
        getAttendanceByGrade,
        getAttendanceTrends,
        getDashboardStats,
        loading,
        error
    };
};
