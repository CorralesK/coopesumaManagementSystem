/**
 * @file useMembers.js
 * @description Custom hook for member-related operations
 * @module hooks/useMembers
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    getAllMembers,
    getMemberById,
    affiliateMember,
    createMember,
    updateMember,
    deactivateMember,
    regenerateMemberQR
} from '../services/memberService';
import { normalizeText } from '../utils/formatters';

/**
 * Hook for fetching and managing a list of members
 * Filtering and pagination is done in frontend for better UX with accent-insensitive search
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} Members state and operations
 */
export const useMembers = (initialFilters = {}) => {
    const [allMembers, setAllMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        qualityId: '',
        levelId: '',
        isActive: '',
        page: 1,
        limit: 10,
        ...initialFilters
    });

    /**
     * Fetch all members from backend (only filters by quality, level, isActive)
     */
    const fetchMembers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Only send backend filters (not search, that's done in frontend)
            const params = {
                limit: 1000, // Get all members for frontend filtering
                ...(filters.qualityId && { qualityId: filters.qualityId }),
                ...(filters.levelId && { levelId: filters.levelId }),
                ...(filters.isActive && { isActive: filters.isActive })
            };

            const response = await getAllMembers(params);

            // Sort members: active first, then by name
            const sortedMembers = (response.data || []).sort((a, b) => {
                if (a.isActive !== b.isActive) {
                    return b.isActive - a.isActive;
                }
                return a.fullName.localeCompare(b.fullName, 'es');
            });

            setAllMembers(sortedMembers);
        } catch (err) {
            setError(err.message || 'Error loading members');
            setAllMembers([]);
        } finally {
            setLoading(false);
        }
    }, [filters.qualityId, filters.levelId, filters.isActive]);

    // Filter members by search term in frontend (supports accents)
    const filteredMembers = useMemo(() => {
        if (!filters.search) return allMembers;
        const normalizedSearch = normalizeText(filters.search);
        return allMembers.filter(member =>
            normalizeText(member.fullName || '').includes(normalizedSearch) ||
            normalizeText(member.identification || '').includes(normalizedSearch) ||
            normalizeText(member.memberCode || '').includes(normalizedSearch)
        );
    }, [allMembers, filters.search]);

    // Pagination in frontend
    const totalPages = Math.ceil(filteredMembers.length / filters.limit);
    const paginatedMembers = useMemo(() => {
        const startIndex = (filters.page - 1) * filters.limit;
        return filteredMembers.slice(startIndex, startIndex + filters.limit);
    }, [filteredMembers, filters.page, filters.limit]);

    const pagination = useMemo(() => ({
        currentPage: filters.page,
        totalPages: totalPages || 1,
        total: filteredMembers.length
    }), [filters.page, totalPages, filteredMembers.length]);

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
            qualityId: '',
            levelId: '',
            isActive: '',
            page: 1,
            limit: 10,
            ...initialFilters
        });
    }, [initialFilters]);

    // Fetch members when backend filters change
    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    return {
        members: paginatedMembers,
        allMembers: filteredMembers,
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
            setError(err.message || 'Error loading member');
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
     * Affiliate a new member (includes ₡500 affiliation fee + receipt)
     * @param {Object} memberData - Member data
     * @returns {Promise<Object>} Created member with receipt info
     */
    const affiliate = useCallback(async (memberData) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const response = await affiliateMember(memberData);
            setSuccess(true);

            return response;
        } catch (err) {
            setError(err.message || 'Error affiliating member');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Create a new member (DEPRECATED - Use affiliate instead)
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
            setError(err.message || 'Error creating member');
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
            setError(err.message || 'Error updating member');
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
            setError(err.message || 'Error deactivating member');
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
            setError(err.message || 'Error regenerating QR code');
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
        affiliate,
        create,
        update,
        deactivate,
        regenerateQR,
        clearState
    };
};

export default useMembers;
