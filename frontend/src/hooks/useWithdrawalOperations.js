/**
 * @file useWithdrawalOperations.js
 * @description Custom hook for withdrawal CRUD operations
 * @module hooks/useWithdrawalOperations
 */

import { useState, useCallback } from 'react';
import {
    createWithdrawalRequest,
    approveWithdrawalRequest,
    rejectWithdrawalRequest
} from '../services/withdrawalService';

/**
 * Hook for withdrawal CRUD operations
 * @returns {Object} CRUD operations with loading and error states
 */
export const useWithdrawalOperations = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    /**
     * Create a new withdrawal request
     * @param {Object} requestData - Request data
     * @returns {Promise<Object>} Created request
     */
    const createRequest = useCallback(async (requestData) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const response = await createWithdrawalRequest(requestData);
            setSuccess(true);

            return response;
        } catch (err) {
            setError(err.message || 'Error al crear la solicitud de retiro');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Approve a withdrawal request
     * @param {number} requestId - Request ID
     * @param {Object} approvalData - Approval data
     * @returns {Promise<Object>} Updated request
     */
    const approveRequest = useCallback(async (requestId, approvalData = {}) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const response = await approveWithdrawalRequest(requestId, approvalData);
            setSuccess(true);

            return response;
        } catch (err) {
            setError(err.message || 'Error al aprobar la solicitud');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Reject a withdrawal request
     * @param {number} requestId - Request ID
     * @param {Object} rejectionData - Rejection data
     * @returns {Promise<Object>} Updated request
     */
    const rejectRequest = useCallback(async (requestId, rejectionData) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const response = await rejectWithdrawalRequest(requestId, rejectionData);
            setSuccess(true);

            return response;
        } catch (err) {
            setError(err.message || 'Error al rechazar la solicitud');
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
        createRequest,
        approveRequest,
        rejectRequest,
        clearState
    };
};

export default useWithdrawalOperations;