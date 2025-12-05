/**
 * @file useReceipts.js
 * @description Custom hook for receipt operations
 * @module hooks/useReceipts
 */

import { useState, useEffect, useCallback } from 'react';
import { getMemberReceipts, downloadReceipt as downloadReceiptService } from '../services/receiptService';

/**
 * Hook for fetching member receipts
 * @param {number} memberId - Member ID
 * @param {Object} filters - Receipt filters
 * @returns {Object} Receipts state and operations
 */
export const useReceipts = (memberId, filters = {}) => {
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchReceipts = useCallback(async () => {
        if (!memberId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const params = {
                ...(filters.receiptType && { receiptType: filters.receiptType }),
                ...(filters.limit && { limit: filters.limit })
            };

            const response = await getMemberReceipts(memberId, params);
            setReceipts(response.data || []);
        } catch (err) {
            setError(err.message || 'Error al cargar los recibos');
            setReceipts([]);
        } finally {
            setLoading(false);
        }
    }, [memberId, filters.receiptType, filters.limit]);

    /**
     * Download receipt PDF
     * @param {number} receiptId - Receipt ID
     */
    const downloadReceipt = useCallback(async (receiptId) => {
        try {
            const blob = await downloadReceiptService(receiptId);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `recibo-${receiptId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError(err.message || 'Error al descargar el recibo');
            throw err;
        }
    }, []);

    useEffect(() => {
        fetchReceipts();
    }, [fetchReceipts]);

    return {
        receipts,
        loading,
        error,
        downloadReceipt,
        refetch: fetchReceipts
    };
};

export default useReceipts;