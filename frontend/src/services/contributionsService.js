/**
 * Contributions Service
 * API calls for contributions operations
 */

import api from './api';

/**
 * Get contribution periods for a fiscal year
 * @param {number} fiscalYear - Fiscal year (optional)
 * @returns {Promise} Contribution periods (tracts)
 */
export const getContributionPeriods = async (fiscalYear) => {
    const params = fiscalYear ? { fiscalYear } : {};
    return api.get('/contributions/periods', { params });
};

/**
 * Create contribution periods for a fiscal year
 * @param {Object} data - { fiscalYear, tracts: [{startDate, endDate, requiredAmount}] }
 * @returns {Promise} Created periods
 */
export const createContributionPeriods = async (data) => {
    return api.post('/contributions/periods', data);
};

/**
 * Register a contribution payment
 * @param {Object} contributionData - { memberId, tractNumber?, amount, transactionDate?, description? }
 * @returns {Promise} Transaction data
 */
export const registerContribution = async (contributionData) => {
    return api.post('/contributions/register', contributionData);
};

/**
 * Get member's contribution status
 * @param {number} memberId - Member ID
 * @param {number} fiscalYear - Fiscal year (optional)
 * @returns {Promise} Contribution status with periods and transactions
 */
export const getMemberContributions = async (memberId, fiscalYear) => {
    const params = fiscalYear ? { fiscalYear } : {};
    return api.get(`/contributions/${memberId}`, { params });
};

/**
 * Get contributions report for all members
 * @param {Object} params - { fiscalYear? }
 * @returns {Promise} Report with all members' contribution status
 */
export const getContributionsReport = async (params = {}) => {
    return api.get('/contributions/report', { params });
};