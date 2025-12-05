/**
 * Surplus Distribution Service
 * API calls for surplus distribution operations
 */

import api from './api';

/**
 * Get distribution preview
 * @param {Object} params - { fiscalYear, totalAmount }
 * @returns {Promise} Preview showing distribution per member
 */
export const getDistributionPreview = async (params) => {
    return api.get('/surplus/preview', { params });
};

/**
 * Execute surplus distribution
 * @param {Object} distributionData - {
 *   fiscalYear: number,
 *   totalDistributableAmount: number,
 *   notes?: string
 * }
 * @returns {Promise} Distribution results
 */
export const distributeSurplus = async (distributionData) => {
    return api.post('/surplus/distribute', distributionData);
};

/**
 * Get distribution history
 * @param {Object} params - { fiscalYear? }
 * @returns {Promise} List of past distributions
 */
export const getDistributionHistory = async (params = {}) => {
    return api.get('/surplus/history', { params });
};