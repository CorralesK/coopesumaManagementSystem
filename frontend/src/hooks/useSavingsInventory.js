/**
 * @file useSavingsInventory.js
 * @description Custom hook for savings inventory operations
 * @module hooks/useSavingsInventory
 */

import { useState, useEffect, useCallback } from 'react';
import { getSavingsInventoryByYear, getSavingsInventoryByMonth } from '../services/savingsService';

/**
 * Hook for fetching savings inventory by fiscal year
 * @param {number} fiscalYear - Fiscal year
 * @returns {Object} Inventory state and operations
 */
export const useSavingsInventoryByYear = (fiscalYear) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchInventory = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await getSavingsInventoryByYear(fiscalYear);
            // axios interceptor extracts response.data, which is { success, message, data }
            // We need to access response.data for the actual inventory data
            const inventoryData = response?.data || response;
            setData(inventoryData || null);
        } catch (err) {
            console.error('Error fetching inventory by year:', err);
            setError(err.message || 'Error al cargar el inventario');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [fiscalYear]);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    return {
        data,
        loading,
        error,
        refetch: fetchInventory
    };
};

/**
 * Hook for fetching savings inventory by fiscal year and month
 * @param {number} fiscalYear - Fiscal year
 * @param {number} month - Month (1-12)
 * @returns {Object} Monthly inventory state and operations
 */
export const useSavingsInventoryByMonth = (fiscalYear, month) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMonthlyInventory = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await getSavingsInventoryByMonth(fiscalYear, month);
            // axios interceptor extracts response.data, which is { success, message, data }
            const inventoryData = response?.data || response;
            setData(inventoryData || null);
        } catch (err) {
            console.error('Error fetching monthly inventory:', err);
            setError(err.message || 'Error al cargar el inventario mensual');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [fiscalYear, month]);

    useEffect(() => {
        fetchMonthlyInventory();
    }, [fetchMonthlyInventory]);

    return {
        data,
        loading,
        error,
        refetch: fetchMonthlyInventory
    };
};

export default useSavingsInventoryByYear;