/**
 * @file useLiquidations.js
 * @description Custom hook for liquidation operations
 * @module hooks/useLiquidations
 */

import { useState, useEffect, useCallback } from 'react';
import {
    getMembersPendingLiquidation,
    getLiquidationHistory,
    getLiquidationPreview,
    executeLiquidation
} from '../services/liquidationService';

/**
 * Hook for pending liquidations
 * @returns {Object} Pending members state and operations
 */
export const usePendingLiquidations = () => {
    const [pendingMembers, setPendingMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPending = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await getMembersPendingLiquidation();
            setPendingMembers(response.data?.members || []);
        } catch (err) {
            setError(err.message || 'Error al cargar miembros pendientes de liquidación');
            setPendingMembers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPending();
    }, [fetchPending]);

    return {
        pendingMembers,
        loading,
        error,
        refetch: fetchPending
    };
};

/**
 * Hook for liquidation history
 * @param {Object} filters - History filters
 * @returns {Object} History state and operations
 */
export const useLiquidationHistory = (filters = {}) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchHistory = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                ...(filters.fiscalYear && { fiscalYear: filters.fiscalYear }),
                ...(filters.memberId && { memberId: filters.memberId }),
                ...(filters.liquidationType && { liquidationType: filters.liquidationType }),
                ...(filters.startDate && { startDate: filters.startDate }),
                ...(filters.endDate && { endDate: filters.endDate })
            };

            const response = await getLiquidationHistory(params);
            setHistory(response.data || []);
        } catch (err) {
            setError(err.message || 'Error al cargar el historial de liquidaciones');
            setHistory([]);
        } finally {
            setLoading(false);
        }
    }, [filters.fiscalYear, filters.memberId, filters.liquidationType, filters.startDate, filters.endDate]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return {
        history,
        loading,
        error,
        refetch: fetchHistory
    };
};

/**
 * Hook for liquidation operations (preview and execute)
 * @returns {Object} Operations with loading and error states
 */
export const useLiquidationOperations = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [preview, setPreview] = useState(null);

    /**
     * Get liquidation preview for a member
     * @param {number} memberId - Member ID
     * @returns {Promise<Object>} Preview data
     */
    const getPreview = useCallback(async (memberId) => {
        try {
            setLoading(true);
            setError(null);

            const response = await getLiquidationPreview(memberId);
            setPreview(response.data);

            return response;
        } catch (err) {
            setError(err.message || 'Error al obtener la vista previa de liquidación');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Execute liquidation
     * @param {Object} liquidationData - Liquidation data
     * @returns {Promise<Object>} Execution result
     */
    const execute = useCallback(async (liquidationData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await executeLiquidation(liquidationData);

            return response;
        } catch (err) {
            setError(err.message || 'Error al ejecutar la liquidación');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Clear states
     */
    const clearState = useCallback(() => {
        setError(null);
        setPreview(null);
    }, []);

    return {
        loading,
        error,
        preview,
        getPreview,
        execute,
        clearState
    };
};

export default usePendingLiquidations;