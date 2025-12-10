/**
 * Withdrawal Request Service
 * API calls for withdrawal request operations
 */

import api from './api';

/**
 * Create a withdrawal request
 * @param {Object} requestData - { memberId, accountType, requestedAmount, requestNotes? }
 * @returns {Promise} Created withdrawal request
 */
export const createWithdrawalRequest = async (requestData) => {
    return api.post('/withdrawal-requests', requestData);
};

/**
 * Get all withdrawal requests (with optional filters)
 * @param {Object} params - { status?, memberId?, accountType? }
 * @returns {Promise} List of withdrawal requests
 */
export const getAllWithdrawalRequests = async (params = {}) => {
    return api.get('/withdrawal-requests', { params });
};

/**
 * Get specific withdrawal request by ID
 * @param {number} requestId - Request ID
 * @returns {Promise} Withdrawal request details
 */
export const getWithdrawalRequestById = async (requestId) => {
    return api.get(`/withdrawal-requests/${requestId}`);
};

/**
 * Approve a withdrawal request
 * @param {number} requestId - Request ID
 * @param {Object} approvalData - { adminNotes? }
 * @returns {Promise} Updated request with receipt info
 */
export const approveWithdrawalRequest = async (requestId, approvalData = {}) => {
    return api.patch(`/withdrawal-requests/${requestId}/approve`, approvalData);
};

/**
 * Reject a withdrawal request
 * @param {number} requestId - Request ID
 * @param {Object} rejectionData - { adminNotes }
 * @returns {Promise} Updated request
 */
export const rejectWithdrawalRequest = async (requestId, rejectionData) => {
    return api.patch(`/withdrawal-requests/${requestId}/reject`, rejectionData);
};

/**
 * Check the status of a withdrawal request
 * Used when admin clicks on a notification to see if it's already processed
 * @param {number} requestId - Request ID
 * @returns {Promise} Status info { requestId, status, isProcessed, reviewedBy, reviewedByName, reviewedAt }
 */
export const checkWithdrawalRequestStatus = async (requestId) => {
    return api.get(`/notifications/withdrawal-status/${requestId}`);
};