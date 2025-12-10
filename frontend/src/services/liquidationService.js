/**
 * Liquidation Service
 * API calls for liquidation operations
 */

import api from './api';

/**
 * Get members pending liquidation (6+ years)
 * @returns {Promise} List of members needing liquidation
 */
export const getMembersPendingLiquidation = async () => {
    return api.get('/liquidations/pending');
};

/**
 * Get liquidation preview for a member
 * @param {number} memberId - Member ID
 * @returns {Promise} Preview with calculated amounts
 */
export const getLiquidationPreview = async (memberId) => {
    return api.get(`/liquidations/preview/${memberId}`);
};

/**
 * Execute liquidation for member(s)
 * @param {Object} liquidationData - {
 *   memberIds: number[],
 *   liquidationType: 'periodic' | 'exit',
 *   memberContinues: boolean,
 *   notes?
 * }
 * @returns {Promise} Liquidation results with receipts
 */
export const executeLiquidation = async (liquidationData) => {
    return api.post('/liquidations/execute', liquidationData);
};

/**
 * Get liquidation by ID
 * @param {number} liquidationId - Liquidation ID
 * @returns {Promise} Liquidation details
 */
export const getLiquidationById = async (liquidationId) => {
    return api.get(`/liquidations/${liquidationId}`);
};

/**
 * Get liquidation history
 * @param {Object} params - { fiscalYear?, memberId?, liquidationType?, startDate?, endDate? }
 * @returns {Promise} List of historical liquidations
 */
export const getLiquidationHistory = async (params = {}) => {
    return api.get('/liquidations/history', { params });
};

/**
 * Get liquidation statistics for dashboard
 * @returns {Promise} Statistics including pending count and yearly totals
 */
export const getLiquidationStats = async () => {
    return api.get('/liquidations/stats');
};