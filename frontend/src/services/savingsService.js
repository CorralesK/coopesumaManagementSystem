/**
 * Savings Service
 * API calls for savings operations
 */

import api from './api';

/**
 * Register a savings deposit
 * @param {Object} depositData - { memberId, amount, transactionDate?, notes? }
 * @returns {Promise} Deposit transaction data
 */
export const registerDeposit = async (depositData) => {
    return api.post('/savings/deposits', depositData);
};

/**
 * Get savings account for a specific member
 * @param {number} memberId - Member ID
 * @returns {Promise} Savings account with balance and recent transactions
 */
export const getMemberSavings = async (memberId) => {
    return api.get(`/savings/${memberId}`);
};

/**
 * Get full savings ledger for a member
 * @param {number} memberId - Member ID
 * @param {Object} params - { fiscalYear?, limit?, offset? }
 * @returns {Promise} Full transaction history
 */
export const getSavingsLedger = async (memberId, params = {}) => {
    return api.get(`/savings/${memberId}/ledger`, { params });
};

/**
 * Get savings summary for all members (admin only)
 * @param {Object} params - { search?, limit?, offset? }
 * @returns {Promise} Summary of all member savings
 */
export const getSavingsSummary = async (params = {}) => {
    return api.get('/savings/summary', { params });
};

/**
 * Get savings inventory by fiscal year (Excel-like view)
 * @param {number} fiscalYear - Fiscal year
 * @returns {Promise} Annual inventory with monthly breakdown
 */
export const getSavingsInventoryByYear = async (fiscalYear) => {
    return api.get(`/savings/inventory/${fiscalYear}`);
};

/**
 * Get savings inventory for a specific month
 * @param {number} fiscalYear - Fiscal year
 * @param {number} month - Month (1-12)
 * @returns {Promise} Monthly inventory with transactions
 */
export const getSavingsInventoryByMonth = async (fiscalYear, month) => {
    return api.get(`/savings/inventory/${fiscalYear}/${month}`);
};

/**
 * Register a savings withdrawal
 * @param {Object} withdrawalData - { memberId, amount, receiptNumber, transactionDate?, description? }
 * @returns {Promise} Withdrawal transaction data
 */
export const registerWithdrawal = async (withdrawalData) => {
    return api.post('/savings/withdrawals', withdrawalData);
};