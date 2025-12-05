/**
 * Receipt Service
 * API calls for receipt operations
 */

import api from './api';

/**
 * Get receipt by ID
 * @param {number} receiptId - Receipt ID
 * @returns {Promise} Receipt details
 */
export const getReceiptById = async (receiptId) => {
    return api.get(`/receipts/${receiptId}`);
};

/**
 * Get all receipts for a member
 * @param {number} memberId - Member ID
 * @param {Object} params - { receiptType?, limit? }
 * @returns {Promise} List of receipts
 */
export const getMemberReceipts = async (memberId, params = {}) => {
    return api.get(`/receipts/member/${memberId}`, { params });
};

/**
 * Download receipt PDF
 * @param {number} receiptId - Receipt ID
 * @returns {Promise} Blob data for PDF
 */
export const downloadReceipt = async (receiptId) => {
    return api.get(`/receipts/${receiptId}/download`, {
        responseType: 'blob'
    });
};

/**
 * Generate receipt for a transaction
 * @param {Object} data - { transactionId }
 * @returns {Promise} Generated receipt data
 */
export const generateReceiptForTransaction = async (data) => {
    return api.post('/receipts/generate-transaction', data);
};

/**
 * Generate receipt for a liquidation
 * @param {Object} data - { liquidationId }
 * @returns {Promise} Generated receipt data
 */
export const generateReceiptForLiquidation = async (data) => {
    return api.post('/receipts/generate-liquidation', data);
};