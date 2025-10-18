/**
 * @file useMembers.js
 * @description Custom hook for member-related operations
 * @module hooks/useMembers
 */

import { useState, useEffect, useCallback } from 'react';
import {
    getAllMembers,
    getMemberById,
    createMember,
    updateMember,
    deactivateMember,
    regenerateMemberQR
} from '../services/memberService';

/**
 * Hook for fetching and managing a list of members
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} Members state and operations
 */
export const useMembers = (initialFilters = {}) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        grade: '',
        isActive: 'true',
        page: 1,
        limit: 20,
        ...initialFilters
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0
    });

    /**
     * Fetch members with current filters
     */
    const fetchMembers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                page: filters.page,
                limit: filters.limit,
                ...(filters.search && { search: filters.search }),
                ...(filters.grade && { grade: filters.grade }),
                ...(filters.isActive && { isActive: filters.isActive })
            };

            const response = await getAllMembers(params);

            setMembers(response.data || []);
            setPagination({
                currentPage: response.pagination?.page || 1,
                totalPages: response.pagination?.totalPages || 1,
                total: response.pagination?.total || 0
            });
        } catch (err) {
            setError(err.message || 'Error al cargar los miembros');
            setMembers([]);
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
            page: 1 // Reset to first page when filters change
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
            search: '',
            grade: '',
            isActive: 'true',
            page: 1,
            limit: 20,
            ...initialFilters
        });
    }, [initialFilters]);

    // Fetch members when filters change
    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    return {
        members,
        loading,
        error,
        filters,
        pagination,
        updateFilters,
        setPage,
        resetFilters,
        refetch: fetchMembers
    };
};

/**
 * Hook for fetching a single member by ID
 * @param {string} memberId - Member ID
 * @returns {Object} Member state and operations
 */
export const useMember = (memberId) => {
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMember = useCallback(async () => {
        if (!memberId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await getMemberById(memberId);
            setMember(response.data);
        } catch (err) {
            setError(err.message || 'Error al cargar el miembro');
            setMember(null);
        } finally {
            setLoading(false);
        }
    }, [memberId]);

    useEffect(() => {
        fetchMember();
    }, [fetchMember]);

    return {
        member,
        loading,
        error,
        refetch: fetchMember
    };
};

/**
 * Hook for member CRUD operations
 * @returns {Object} CRUD operations with loading and error states
 */
export const useMemberOperations = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    /**
     * Create a new member
     * @param {Object} memberData - Member data
     * @returns {Promise<Object>} Created member
     */
    const create = useCallback(async (memberData) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const response = await createMember(memberData);
            setSuccess(true);

            return response;
        } catch (err) {
            setError(err.message || 'Error al crear el miembro');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Update an existing member
     * @param {string} memberId - Member ID
     * @param {Object} memberData - Updated member data
     * @returns {Promise<Object>} Updated member
     */
    const update = useCallback(async (memberId, memberData) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const response = await updateMember(memberId, memberData);
            setSuccess(true);

            return response;
        } catch (err) {
            setError(err.message || 'Error al actualizar el miembro');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Deactivate a member
     * @param {string} memberId - Member ID
     * @returns {Promise<Object>} Response
     */
    const deactivate = useCallback(async (memberId) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const response = await deactivateMember(memberId);
            setSuccess(true);

            return response;
        } catch (err) {
            setError(err.message || 'Error al desactivar el miembro');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Regenerate member QR code
     * @param {string} memberId - Member ID
     * @returns {Promise<Object>} New QR data
     */
    const regenerateQR = useCallback(async (memberId) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const response = await regenerateMemberQR(memberId);
            setSuccess(true);

            return response;
        } catch (err) {
            setError(err.message || 'Error al regenerar el código QR');
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
        create,
        update,
        deactivate,
        regenerateQR,
        clearState
    };
};

export default useMembers;
