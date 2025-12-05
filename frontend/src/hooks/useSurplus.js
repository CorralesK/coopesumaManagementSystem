/**
 * @file useSurplus.js
 * @description Custom hook for surplus distribution operations
 * @module hooks/useSurplus
 */

import { useState, useCallback } from 'react';
import {
    getDistributionPreview,
    distributeSurplus,
    getDistributionHistory
} from '../services/surplusService';

/**
 * Hook for surplus distribution preview
 * @returns {Object} Preview state and operations
 */
export const useSurplusPreview = () => {
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Get distribution preview
     * @param {Object} params - { fiscalYear, totalAmount }
     * @returns {Promise<Object>} Preview data
     */
    const getPreview = useCallback(async (params) => {
        try {
            setLoading(true);
            setError(null);

            const response = await getDistributionPreview(params);
            setPreview(response.data);

            return response;
        } catch (err) {
            setError(err.message || 'Error al obtener la vista previa de distribución');
            setPreview(null);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Clear preview
     */
    const clearPreview = useCallback(() => {
        setPreview(null);
        setError(null);
    }, []);

    return {
        preview,
        loading,
        error,
        getPreview,
        clearPreview
    };
};

/**
 * Hook for surplus distribution execution
 * @returns {Object} Distribution operations
 */
export const useSurplusDistribution = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    /**
     * Execute surplus distribution
     * @param {Object} distributionData - Distribution data
     * @returns {Promise<Object>} Distribution result
     */
    const executeDistribution = useCallback(async (distributionData) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const response = await distributeSurplus(distributionData);
            setSuccess(true);

            return response;
        } catch (err) {
            setError(err.message || 'Error al ejecutar la distribución de excedentes');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Clear state
     */
    const clearState = useCallback(() => {
        setError(null);
        setSuccess(false);
    }, []);

    return {
        loading,
        error,
        success,
        executeDistribution,
        clearState
    };
};

/**
 * Hook for surplus distribution history
 * @param {Object} filters - History filters
 * @returns {Object} History state and operations
 */
export const useSurplusHistory = (filters = {}) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchHistory = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                ...(filters.fiscalYear && { fiscalYear: filters.fiscalYear })
            };

            const response = await getDistributionHistory(params);
            setHistory(response.data || []);
        } catch (err) {
            setError(err.message || 'Error al cargar el historial de distribuciones');
            setHistory([]);
        } finally {
            setLoading(false);
        }
    }, [filters.fiscalYear]);

    return {
        history,
        loading,
        error,
        fetchHistory,
        refetch: fetchHistory
    };
};

export default useSurplusPreview;