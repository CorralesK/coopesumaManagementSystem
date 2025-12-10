/**
 * @file useContributions.js
 * @description Custom hook for contributions operations
 * @module hooks/useContributions
 */

import { useState, useEffect, useCallback } from 'react';
import { getMemberContributions } from '../services/contributionsService';

/**
 * Hook for fetching member contributions
 * @param {number} memberId - Member ID
 * @param {number} fiscalYear - Fiscal year (optional)
 * @returns {Object} Contributions state and operations
 */
export const useContributions = (memberId, fiscalYear = null) => {
    const [contributions, setContributions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchContributions = useCallback(async () => {
        if (!memberId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await getMemberContributions(memberId, fiscalYear);
            setContributions(response.data);
        } catch (err) {
            setError(err.message || 'Error loading contributions');
            setContributions(null);
        } finally {
            setLoading(false);
        }
    }, [memberId, fiscalYear]);

    useEffect(() => {
        fetchContributions();
    }, [fetchContributions]);

    return {
        contributions,
        loading,
        error,
        refetch: fetchContributions
    };
};

export default useContributions;