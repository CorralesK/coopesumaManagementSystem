/**
 * @file useUsers.js
 * @description Custom hooks for user management
 * @module hooks/useUsers
 */

import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import * as userService from '../services/userService';

/**
 * Hook for fetching list of users with filters and pagination
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.role - Filter by role
 * @param {string} params.isActive - Filter by active status
 * @returns {Object} Users data, loading state, error, and pagination
 */
export const useUsers = (params = {}) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        limit: params.limit || 20
    });

    const [currentPage, setCurrentPage] = useState(params.page || 1);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await userService.getAllUsers({
                ...params,
                page: currentPage
            });

            setUsers(response.data || []);
            setPagination({
                currentPage: response.pagination.currentPage,
                totalPages: response.pagination.totalPages,
                totalItems: response.pagination.totalItems,
                total: response.pagination.totalItems,
                limit: response.pagination.limit
            });
        } catch (err) {
            setError(err.message || 'Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    }, [currentPage, JSON.stringify(params)]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return {
        users,
        loading,
        error,
        pagination,
        setPage: setCurrentPage,
        refetch: fetchUsers
    };
};

/**
 * Hook for fetching a single user by ID
 * @param {string} userId - User ID
 * @returns {Object} User data, loading state, error, and refetch function
 */
export const useUser = (userId) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUser = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await userService.getUserById(userId);
            setUser(response.data);
        } catch (err) {
            setError(err.message || 'Error al cargar usuario');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return { user, loading, error, refetch: fetchUser };
};

/**
 * Hook for user CRUD operations
 * @returns {Object} Operation functions, loading state, and error
 */
export const useUserOperations = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const create = useCallback(async (userData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await userService.createUser(userData);
            return response;
        } catch (err) {
            const errorMessage = err.message || 'Error al crear usuario';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const update = useCallback(async (userId, userData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await userService.updateUser(userId, userData);
            return response;
        } catch (err) {
            const errorMessage = err.message || 'Error al actualizar usuario';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const deactivate = useCallback(async (userId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await userService.deactivateUser(userId);
            return response;
        } catch (err) {
            const errorMessage = err.message || 'Error al desactivar usuario';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const activate = useCallback(async (userId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await userService.activateUser(userId);
            return response;
        } catch (err) {
            const errorMessage = err.message || 'Error al activar usuario';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateRole = useCallback(async (userId, newRole) => {
        try {
            setLoading(true);
            setError(null);
            const response = await userService.updateUserRole(userId, newRole);
            return response;
        } catch (err) {
            const errorMessage = err.message || 'Error al actualizar rol';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        create,
        update,
        deactivate,
        activate,
        updateRole,
        loading,
        error
    };
};

/**
 * Hook for fetching user statistics
 * @returns {Object} Statistics data, loading state, and error
 */
export const useUserStats = () => {
    const { execute, data, loading, error } = useApi(userService.getUserStats);

    useEffect(() => {
        execute();
    }, []);

    return { stats: data, loading, error };
};
