/**
 * @file useSavings.js
 * @description Custom hook for savings operations
 * @module hooks/useSavings
 */

import { useState, useEffect, useCallback } from 'react';
import { getMemberSavings, getSavingsLedger } from '../services/savingsService';

/**
 * Hook for fetching member savings
 * @param {number} memberId - Member ID
 * @returns {Object} Savings state and operations
 */
export const useSavings = (memberId) => {
    const [savings, setSavings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSavings = useCallback(async () => {
        if (!memberId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await getMemberSavings(memberId);
            setSavings(response.data);
        } catch (err) {
            setError(err.message || 'Error al cargar el ahorro');
            setSavings(null);
        } finally {
            setLoading(false);
        }
    }, [memberId]);

    useEffect(() => {
        fetchSavings();
    }, [fetchSavings]);

    return {
        savings,
        loading,
        error,
        refetch: fetchSavings
    };
};

/**
 * Hook for fetching savings ledger
 * @param {number} memberId - Member ID
 * @param {Object} filters - Ledger filters
 * @returns {Object} Ledger state and operations
 */
export const useSavingsLedger = (memberId, filters = {}) => {
    const [ledger, setLedger] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLedger = useCallback(async () => {
        if (!memberId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const params = {
                ...(filters.fiscalYear && { fiscalYear: filters.fiscalYear }),
                ...(filters.limit && { limit: filters.limit }),
                ...(filters.offset && { offset: filters.offset })
            };

            const response = await getSavingsLedger(memberId, params);
            setLedger(response.data || []);
        } catch (err) {
            setError(err.message || 'Error al cargar el historial de ahorro');
            setLedger([]);
        } finally {
            setLoading(false);
        }
    }, [memberId, filters.fiscalYear, filters.limit, filters.offset]);

    useEffect(() => {
        fetchLedger();
    }, [fetchLedger]);

    return {
        ledger,
        loading,
        error,
        refetch: fetchLedger
    };
};

export default useSavings;