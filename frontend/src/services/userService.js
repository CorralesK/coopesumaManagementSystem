/**
 * @file userService.js
 * @description Service for user management API calls
 * @module services/userService
 */

import api from './api';

/**
 * Get all users with optional filters and pagination
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.role - Filter by role
 * @param {string} params.isActive - Filter by active status
 * @returns {Promise<Object>} Response with data and pagination info
 */
export const getAllUsers = async (params = {}) => {
    const response = await api.get('/users', { params });
    return response;
};

/**
 * Get a single user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User data
 */
export const getUserById = async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response;
};

/**
 * Create a new user
 * @param {Object} userData - User data
 * @param {string} userData.fullName - Full name
 * @param {string} userData.email - Email address
 * @param {string} userData.role - User role (ADMINISTRATOR, REGISTRAR, TREASURER, STUDENT)
 * @returns {Promise<Object>} Created user data
 */
export const createUser = async (userData) => {
    const response = await api.post('/users', userData);
    return response;
};

/**
 * Update an existing user
 * @param {string} userId - User ID
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} Updated user data
 */
export const updateUser = async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response;
};

/**
 * Deactivate a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Response message
 */
export const deactivateUser = async (userId) => {
    const response = await api.post(`/users/${userId}/deactivate`);
    return response;
};

/**
 * Activate a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated user data
 */
export const activateUser = async (userId) => {
    const response = await api.post(`/users/${userId}/activate`);
    return response;
};

/**
 * Update user role
 * @param {string} userId - User ID
 * @param {string} newRole - New role
 * @returns {Promise<Object>} Updated user data
 */
export const updateUserRole = async (userId, newRole) => {
    const response = await api.put(`/users/${userId}/role`, { role: newRole });
    return response;
};

/**
 * Get users by role
 * @param {string} role - User role
 * @param {Object} params - Optional query parameters
 * @returns {Promise<Object>} Users with specified role
 */
export const getUsersByRole = async (role, params = {}) => {
    const response = await api.get('/users', { params: { ...params, role } });
    return response;
};

/**
 * Get user statistics
 * @returns {Promise<Object>} User statistics by role
 */
export const getUserStats = async () => {
    const response = await api.get('/users/stats');
    return response;
};
