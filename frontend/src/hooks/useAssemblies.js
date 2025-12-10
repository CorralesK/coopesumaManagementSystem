/**
 * @file useAssemblies.js
 * @description Custom hook for assembly-related operations
 * @module hooks/useAssemblies
 */

import { useState, useEffect, useCallback } from 'react';
import {
    getAllAssemblies,
    getAssemblyById,
    getActiveAssembly,
    createAssembly,
    updateAssembly,
    deleteAssembly,
    activateAssembly,
    deactivateAssembly,
    closeAssembly
} from '../services/assemblyService';

/**
 * Hook for fetching and managing a list of assemblies
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} Assemblies state and operations
 */
export const useAssemblies = (initialFilters = {}) => {
    const [assemblies, setAssemblies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        year: '',
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
     * Fetch assemblies with current filters
     */
    const fetchAssemblies = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                page: filters.page,
                limit: filters.limit,
                ...(filters.status && { status: filters.status }),
                ...(filters.year && { year: filters.year })
            };

            const response = await getAllAssemblies(params);

            setAssemblies(response.data || []);
            setPagination({
                currentPage: response.pagination?.page || 1,
                totalPages: response.pagination?.totalPages || 1,
                total: response.pagination?.total || 0
            });
        } catch (err) {
            setError(err.message || 'Error loading assemblies');
            setAssemblies([]);
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
            page: 1
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
            status: '',
            year: '',
            page: 1,
            limit: 20,
            ...initialFilters
        });
    }, [initialFilters]);

    // Fetch assemblies when filters change
    useEffect(() => {
        fetchAssemblies();
    }, [fetchAssemblies]);

    return {
        assemblies,
        loading,
        error,
        filters,
        pagination,
        updateFilters,
        setPage,
        resetFilters,
        refetch: fetchAssemblies
    };
};

/**
 * Hook for fetching a single assembly by ID
 * @param {string} assemblyId - Assembly ID
 * @returns {Object} Assembly state and operations
 */
export const useAssembly = (assemblyId) => {
    const [assembly, setAssembly] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAssembly = useCallback(async () => {
        if (!assemblyId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await getAssemblyById(assemblyId);
            setAssembly(response.data);
        } catch (err) {
            setError(err.message || 'Error loading assembly');
            setAssembly(null);
        } finally {
            setLoading(false);
        }
    }, [assemblyId]);

    useEffect(() => {
        fetchAssembly();
    }, [fetchAssembly]);

    return {
        assembly,
        loading,
        error,
        refetch: fetchAssembly
    };
};

/**
 * Hook for fetching the active assembly
 * @returns {Object} Active assembly state and operations
 */
export const useActiveAssembly = () => {
    const [activeAssembly, setActiveAssembly] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchActiveAssembly = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await getActiveAssembly();
            setActiveAssembly(response.data);
        } catch (err) {
            // No active assembly is not an error
            if (err.statusCode === 404) {
                setActiveAssembly(null);
                setError(null);
            } else {
                setError(err.message || 'Error loading active assembly');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchActiveAssembly();
    }, [fetchActiveAssembly]);

    return {
        activeAssembly,
        loading,
        error,
        refetch: fetchActiveAssembly
    };
};

/**
 * Hook for assembly CRUD and state operations
 * @returns {Object} Operations with loading and error states
 */
export const useAssemblyOperations = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    /**
     * Create a new assembly
     * @param {Object} assemblyData - Assembly data
     * @returns {Promise<Object>} Created assembly
     */
    const create = useCallback(async (assemblyData) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const response = await createAssembly(assemblyData);
            setSuccess(true);

            return response;
        } catch (err) {
            setError(err.message || 'Error creating assembly');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Update an existing assembly
     * @param {string} assemblyId - Assembly ID
     * @param {Object} assemblyData - Updated assembly data
     * @returns {Promise<Object>} Updated assembly
     */
    const update = useCallback(async (assemblyId, assemblyData) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const response = await updateAssembly(assemblyId, assemblyData);
            setSuccess(true);

            return response;
        } catch (err) {
            setError(err.message || 'Error updating assembly');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Delete an assembly
     * @param {string} assemblyId - Assembly ID
     * @returns {Promise<Object>} Response
     */
    const remove = useCallback(async (assemblyId) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const response = await deleteAssembly(assemblyId);
            setSuccess(true);

            return response;
        } catch (err) {
            setError(err.message || 'Error deleting assembly');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Activate an assembly
     * @param {string} assemblyId - Assembly ID
     * @returns {Promise<Object>} Updated assembly
     */
    const activate = useCallback(async (assemblyId) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const response = await activateAssembly(assemblyId);
            setSuccess(true);

            return response;
        } catch (err) {
            setError(err.message || 'Error activating assembly');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Deactivate an assembly
     * @param {string} assemblyId - Assembly ID
     * @returns {Promise<Object>} Updated assembly
     */
    const deactivate = useCallback(async (assemblyId) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const response = await deactivateAssembly(assemblyId);
            setSuccess(true);

            return response;
        } catch (err) {
            setError(err.message || 'Error deactivating assembly');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Close an assembly (mark as completed)
     * @param {string} assemblyId - Assembly ID
     * @returns {Promise<Object>} Updated assembly
     */
    const close = useCallback(async (assemblyId) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const response = await closeAssembly(assemblyId);
            setSuccess(true);

            return response;
        } catch (err) {
            setError(err.message || 'Error closing assembly');
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
        remove,
        activate,
        deactivate,
        close,
        clearState
    };
};

export default useAssemblies;
