/**
 * Catalog Service
 * API service for catalog operations (qualities, levels, account types)
 *
 * @module services/catalogService
 */

import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Get all member qualities
 *
 * @returns {Promise<Array>} Array of quality objects
 */
export const getAllQualities = async () => {
    const response = await api.get(API_ENDPOINTS.CATALOGS_QUALITIES);

    // The API interceptor returns response.data, which is { success, message, data }
    // We need to extract the data property which contains the array
    return response.data || [];
};

/**
 * Get all member levels
 *
 * @param {string} qualityCode - Optional quality code filter ('student' or 'employee')
 * @returns {Promise<Array>} Array of level objects
 */
export const getAllLevels = async (qualityCode = null) => {
    const params = qualityCode ? { qualityCode } : {};
    const response = await api.get(API_ENDPOINTS.CATALOGS_LEVELS, { params });

    // The API interceptor returns response.data, which is { success, message, data }
    // We need to extract the data property which contains the array
    return response.data || [];
};

/**
 * Get all account types
 *
 * @returns {Promise<Array>} Array of account type objects
 */
export const getAllAccountTypes = async () => {
    const response = await api.get(API_ENDPOINTS.CATALOGS_ACCOUNT_TYPES);

    // The API interceptor returns response.data, which is { success, message, data }
    // We need to extract the data property which contains the array
    return response.data || [];
};

export default {
    getAllQualities,
    getAllLevels,
    getAllAccountTypes,
};
