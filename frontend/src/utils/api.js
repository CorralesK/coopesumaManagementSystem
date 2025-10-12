/**
 * API Client Configuration
 * Axios instance with interceptors for authentication and error handling
 *
 * @module utils/api
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Create axios instance with base configuration
 */
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds
});

/**
 * Request interceptor
 * Adds authentication token to all requests
 */
api.interceptors.request.use(
    (config) => {
        // Get token from sessionStorage or React context
        // NOTE: Token should ideally be stored in React state/context
        // This is a fallback for refresh scenarios
        const token = sessionStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response interceptor
 * Handles common error cases globally
 */
api.interceptors.response.use(
    (response) => {
        // Return response data directly
        return response.data;
    },
    (error) => {
        // Handle different error scenarios
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            // Handle specific HTTP status codes
            switch (status) {
                case 401:
                    // Unauthorized - token expired or invalid
                    // Clear token and redirect to login
                    sessionStorage.removeItem('token');
                    window.location.href = '/login';
                    break;

                case 403:
                    // Forbidden - insufficient permissions
                    console.error('Access forbidden:', data.message);
                    break;

                case 404:
                    // Not found
                    console.error('Resource not found:', data.message);
                    break;

                case 500:
                    // Server error
                    console.error('Server error:', data.message);
                    break;

                default:
                    console.error('API error:', data.message);
            }

            // Return error in consistent format
            return Promise.reject({
                message: data.message || 'Error en la solicitud',
                error: data.error || 'UNKNOWN_ERROR',
                statusCode: status,
            });
        } else if (error.request) {
            // Request was made but no response received
            console.error('No response from server');
            return Promise.reject({
                message: 'No se pudo conectar con el servidor',
                error: 'NETWORK_ERROR',
                statusCode: 0,
            });
        } else {
            // Error in request configuration
            console.error('Request error:', error.message);
            return Promise.reject({
                message: 'Error al configurar la solicitud',
                error: 'REQUEST_ERROR',
                statusCode: 0,
            });
        }
    }
);

export default api;
