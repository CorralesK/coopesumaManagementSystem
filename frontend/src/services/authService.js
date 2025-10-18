/**
 * @file authService.js
 * @description Service for authentication-related API calls
 * @module services/authService
 */

import api from './api';

/**
 * Initiate Microsoft OAuth login
 * @returns {Promise<Object>} OAuth URL and state
 */
export const initiateLogin = async () => {
    const response = await api.get('/auth/microsoft/login');
    return response;
};

/**
 * Handle OAuth callback and exchange code for token
 * @param {string} code - OAuth authorization code
 * @param {string} state - OAuth state parameter
 * @returns {Promise<Object>} Authentication token and user data
 */
export const handleCallback = async (code, state) => {
    const response = await api.get('/auth/microsoft/callback', {
        params: { code, state }
    });
    return response;
};

/**
 * Verify authentication token
 * @param {string} token - JWT token
 * @returns {Promise<Object>} User data if token is valid
 */
export const verifyToken = async (token) => {
    const response = await api.post('/auth/verify', { token });
    return response;
};

/**
 * Logout user (client-side)
 * Clears session storage and returns success
 * @returns {Promise<Object>} Logout confirmation
 */
export const logout = async () => {
    // Clear token from storage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');

    return {
        success: true,
        message: 'Sesión cerrada exitosamente'
    };
};

/**
 * Get current user profile
 * @returns {Promise<Object>} Current user data
 */
export const getCurrentUser = async () => {
    const response = await api.get('/auth/me');
    return response;
};

/**
 * Refresh authentication token
 * @returns {Promise<Object>} New token and user data
 */
export const refreshToken = async () => {
    const response = await api.post('/auth/refresh');
    return response;
};
