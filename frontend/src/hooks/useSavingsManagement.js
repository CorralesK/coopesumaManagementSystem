/**
 * @file useSavingsManagement.js
 * @description Custom hook for savings management operations
 * @module hooks/useSavingsManagement
 */

import { useState, useEffect, useCallback } from 'react';
import { getSavingsSummary, registerDeposit, registerWithdrawal } from '../services/savingsService';

/**
 * Hook for fetching and managing savings summary for all members
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} Savings state and operations
 */
export const useSavingsManagement = (initialFilters = {}) => {
    const [members, setMembers] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        fiscalYear: new Date().getFullYear(),
        page: 1,
        limit: 10,
        ...initialFilters
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0
    });

    /**
     * Fetch savings summary with current filters
     */
    const fetchSavingsSummary = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                ...(filters.search && { search: filters.search })
            };

            const response = await getSavingsSummary(params);
            // Note: axios interceptor already extracts .data, so response IS the data
            const responseData = response || {};

            setSummary(responseData.summary || {});
            setMembers(responseData.members || []);
        } catch (err) {
            console.error('Error fetching savings summary:', err);
            setError(err.response?.data?.message || err.message || 'Error al cargar datos de ahorros');
            setMembers([]);
            setSummary(null);
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
            search: '',
            fiscalYear: new Date().getFullYear(),
            ...initialFilters
        });
    }, [initialFilters]);

    /**
     * Filter members based on search term
     */
    const filteredMembers = members.filter(member =>
        member.fullName?.toLowerCase().includes(filters.search.toLowerCase()) ||
        member.memberCode?.toLowerCase().includes(filters.search.toLowerCase()) ||
        member.identification?.includes(filters.search)
    );

    /**
     * Paginate filtered members
     */
    const startIndex = (filters.page - 1) * filters.limit;
    const endIndex = startIndex + filters.limit;
    const paginatedMembers = filteredMembers.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredMembers.length / filters.limit);

    // Update pagination whenever filtered members change
    useEffect(() => {
        setPagination({
            currentPage: filters.page,
            totalPages: totalPages,
            total: filteredMembers.length
        });
    }, [filteredMembers.length, filters.page, totalPages]);

    /**
     * Change page
     */
    const setPage = useCallback((page) => {
        setFilters(prev => ({ ...prev, page }));
    }, []);

    // Fetch savings summary when filters change (except page)
    useEffect(() => {
        fetchSavingsSummary();
    }, [fetchSavingsSummary]);

    return {
        members: paginatedMembers,
        allMembers: members,
        summary,
        loading,
        error,
        filters,
        pagination,
        updateFilters,
        setPage,
        resetFilters,
        refetch: fetchSavingsSummary
    };
};

/**
 * Hook for savings CRUD operations (deposits and withdrawals)
 * @returns {Object} Operations with loading and error states
 */
export const useSavingsOperations = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    /**
     * Register a deposit
     * @param {Object} depositData - { memberId, amount, transactionDate?, description? }
     * @returns {Promise<Object>} Deposit transaction data
     */
    const deposit = useCallback(async (depositData) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const response = await registerDeposit(depositData);
            setSuccess(true);

            return response;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Error al registrar el depósito';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Register a withdrawal
     * @param {Object} withdrawalData - { memberId, amount, receiptNumber, transactionDate?, description? }
     * @returns {Promise<Object>} Withdrawal transaction data
     */
    const withdrawal = useCallback(async (withdrawalData) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const response = await registerWithdrawal(withdrawalData);
            setSuccess(true);

            return response;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Error al registrar el retiro';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Clear error and success states
     */
    const clearState = useCallback(() => {
        setError(null);
        setSuccess(false);
    }, []);

    return {
        loading,
        error,
        success,
        deposit,
        withdrawal,
        clearState
    };
};

export default useSavingsManagement;