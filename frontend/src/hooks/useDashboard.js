/**
 * @file useDashboard.js
 * @description Custom hook for admin dashboard data
 * @module hooks/useDashboard
 */

import { useState, useEffect, useCallback } from 'react';
import { getSavingsSummary } from '../services/savingsService';
import { getAllWithdrawalRequests } from '../services/withdrawalService';

/**
 * Hook for fetching dashboard statistics and data
 * Centralizes all dashboard data fetching in one place
 * @returns {Object} Dashboard data, loading state, and refresh function
 */
export const useDashboard = () => {
    const [savingsSummary, setSavingsSummary] = useState(null);
    const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
    const [recentWithdrawals, setRecentWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch data in parallel
            const [savingsResponse, withdrawalsResponse] = await Promise.all([
                getSavingsSummary().catch(() => ({ data: null })),
                getAllWithdrawalRequests().catch(() => ({ data: [] }))
            ]);

            // Process savings summary
            if (savingsResponse.data) {
                setSavingsSummary(savingsResponse.data);
            }

            // Process withdrawals
            const withdrawals = withdrawalsResponse.data || [];

            // Filter pending withdrawals
            const pending = withdrawals.filter(w => w.status === 'pending');
            setPendingWithdrawals(pending);

            // Get recent withdrawals (last 5)
            const recent = [...withdrawals]
                .sort((a, b) => new Date(b.createdAt || b.requestDate) - new Date(a.createdAt || a.requestDate))
                .slice(0, 5);
            setRecentWithdrawals(recent);

        } catch (err) {
            setError(err.message || 'Error al cargar datos del dashboard');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return {
        savingsSummary,
        pendingWithdrawals,
        recentWithdrawals,
        loading,
        error,
        refetch: fetchDashboardData
    };
};

export default useDashboard;
