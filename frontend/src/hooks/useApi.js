/**
 * @file useApi.js
 * @description Generic hook for API calls with loading, error, and data state management
 * @module hooks/useApi
 */

import { useState, useCallback } from 'react';

/**
 * Generic hook for making API calls with automatic state management
 * @param {Function} apiFunction - The API service function to call
 * @returns {Object} API state and execute function
 * @property {*} data - Response data
 * @property {boolean} loading - Loading state
 * @property {string|null} error - Error message
 * @property {Function} execute - Function to execute the API call
 * @property {Function} reset - Function to reset the state
 */
export const useApi = (apiFunction) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Execute the API call with given parameters
     * @param {...*} params - Parameters to pass to the API function
     * @returns {Promise<*>} Response data
     */
    const execute = useCallback(async (...params) => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiFunction(...params);
            setData(response);

            return response;
        } catch (err) {
            const errorMessage = err.message || 'Error en la solicitud';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiFunction]);

    /**
     * Reset the hook state
     */
    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    return {
        data,
        loading,
        error,
        execute,
        reset
    };
};

/**
 * Hook for API calls that execute immediately on mount
 * @param {Function} apiFunction - The API service function to call
 * @param {Array} params - Parameters to pass to the API function
 * @param {Array} dependencies - Dependencies array for useEffect
 * @returns {Object} API state and refetch function
 */
export const useApiEffect = (apiFunction, params = [], dependencies = []) => {
    const { data, loading, error, execute, reset } = useApi(apiFunction);
    const [mounted, setMounted] = useState(false);

    // Execute on mount and when dependencies change
    useState(() => {
        if (!mounted) {
            setMounted(true);
            execute(...params);
        }
    });

    /**
     * Refetch the data
     */
    const refetch = useCallback(() => {
        execute(...params);
    }, [execute, ...params]);

    return {
        data,
        loading,
        error,
        refetch,
        reset
    };
};

export default useApi;
