/**
 * @file useWithdrawalRequests.js
 * @description Custom hook for fetching withdrawal requests
 * @module hooks/useWithdrawalRequests
 */

import { useState, useEffect, useCallback } from 'react';
import { getAllWithdrawalRequests } from '../services/withdrawalService';

/**
 * Hook for fetching withdrawal requests with filters
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} Requests state and operations
 */
export const useWithdrawalRequests = (initialFilters = {}) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        memberId: '',
        accountType: '',
        ...initialFilters
    });

    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                ...(filters.status && { status: filters.status }),
                ...(filters.memberId && { memberId: filters.memberId }),
                ...(filters.accountType && { accountType: filters.accountType })
            };

            const response = await getAllWithdrawalRequests(params);
            setRequests(response.data || []);
        } catch (err) {
            setError(err.message || 'Error al cargar las solicitudes de retiro');
            setRequests([]);
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
            ...newFilters
        }));
    }, []);

    /**
     * Reset filters to initial values
     */
    const resetFilters = useCallback(() => {
        setFilters({
            status: '',
            memberId: '',
            accountType: '',
            ...initialFilters
        });
    }, [initialFilters]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    return {
        requests,
        loading,
        error,
        filters,
        updateFilters,
        resetFilters,
        refetch: fetchRequests
    };
};

export default useWithdrawalRequests;