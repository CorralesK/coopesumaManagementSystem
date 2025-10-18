/**
 * @file useDebounce.js
 * @description Custom hook for debouncing values
 * @module hooks/useDebounce
 */

import { useState, useEffect } from 'react';

/**
 * Hook to debounce a value
 * Useful for search inputs to avoid making API calls on every keystroke
 *
 * @param {*} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 500ms)
 * @returns {*} Debounced value
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   // This will only run when debouncedSearchTerm changes
 *   // (500ms after the user stops typing)
 *   searchAPI(debouncedSearchTerm);
 * }, [debouncedSearchTerm]);
 */
export const useDebounce = (value, delay = 500) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Set up the timeout
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Clean up the timeout if value changes before delay expires
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

/**
 * Hook to debounce a callback function
 * Returns a debounced version of the callback that delays invoking
 *
 * @param {Function} callback - The callback to debounce
 * @param {number} delay - Delay in milliseconds (default: 500ms)
 * @returns {Function} Debounced callback
 *
 * @example
 * const handleSearch = (term) => {
 *   searchAPI(term);
 * };
 *
 * const debouncedSearch = useDebouncedCallback(handleSearch, 500);
 *
 * <input onChange={(e) => debouncedSearch(e.target.value)} />
 */
export const useDebouncedCallback = (callback, delay = 500) => {
    const [timeoutId, setTimeoutId] = useState(null);

    useEffect(() => {
        // Clean up on unmount
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [timeoutId]);

    const debouncedCallback = (...args) => {
        // Clear existing timeout
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        // Set new timeout
        const newTimeoutId = setTimeout(() => {
            callback(...args);
        }, delay);

        setTimeoutId(newTimeoutId);
    };

    return debouncedCallback;
};

export default useDebounce;
