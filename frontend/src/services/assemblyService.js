/**
 * @file assemblyService.js
 * @description Service for assembly-related API calls
 * @module services/assemblyService
 */

import api from './api';

/**
 * Get all assemblies with optional filters and pagination
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.status - Filter by status
 * @param {string} params.year - Filter by year
 * @returns {Promise<Object>} Response with data and pagination info
 */
export const getAllAssemblies = async (params = {}) => {
    const response = await api.get('/assemblies', { params });
    return response;
};

/**
 * Get a single assembly by ID
 * @param {string} assemblyId - Assembly ID
 * @returns {Promise<Object>} Assembly data
 */
export const getAssemblyById = async (assemblyId) => {
    const response = await api.get(`/assemblies/${assemblyId}`);
    return response;
};

/**
 * Get the currently active assembly
 * @returns {Promise<Object>} Active assembly data or null
 */
export const getActiveAssembly = async () => {
    const response = await api.get('/assemblies/active');
    return response;
};

/**
 * Create a new assembly
 * @param {Object} assemblyData - Assembly data
 * @param {string} assemblyData.title - Assembly title
 * @param {string} assemblyData.scheduledDate - Scheduled date (ISO format)
 * @returns {Promise<Object>} Created assembly data
 */
export const createAssembly = async (assemblyData) => {
    const response = await api.post('/assemblies', assemblyData);
    return response;
};

/**
 * Update an existing assembly
 * @param {string} assemblyId - Assembly ID
 * @param {Object} assemblyData - Updated assembly data
 * @returns {Promise<Object>} Updated assembly data
 */
export const updateAssembly = async (assemblyId, assemblyData) => {
    const response = await api.put(`/assemblies/${assemblyId}`, assemblyData);
    return response;
};

/**
 * Delete an assembly
 * @param {string} assemblyId - Assembly ID
 * @returns {Promise<Object>} Response message
 */
export const deleteAssembly = async (assemblyId) => {
    const response = await api.delete(`/assemblies/${assemblyId}`);
    return response;
};

/**
 * Activate an assembly
 * @param {string} assemblyId - Assembly ID
 * @returns {Promise<Object>} Updated assembly data
 */
export const activateAssembly = async (assemblyId) => {
    const response = await api.post(`/assemblies/${assemblyId}/activate`);
    return response;
};

/**
 * Deactivate an assembly
 * @param {string} assemblyId - Assembly ID
 * @returns {Promise<Object>} Updated assembly data
 */
export const deactivateAssembly = async (assemblyId) => {
    const response = await api.post(`/assemblies/${assemblyId}/deactivate`);
    return response;
};

/**
 * Close an assembly (mark as completed)
 * @param {string} assemblyId - Assembly ID
 * @returns {Promise<Object>} Updated assembly data
 */
export const closeAssembly = async (assemblyId) => {
    const response = await api.post(`/assemblies/${assemblyId}/close`);
    return response;
};

/**
 * Get assembly statistics
 * @param {string} assemblyId - Assembly ID
 * @returns {Promise<Object>} Assembly statistics
 */
export const getAssemblyStats = async (assemblyId) => {
    const response = await api.get(`/assemblies/${assemblyId}/stats`);
    return response;
};
