/**
 * @file useUsers.js
 * @description Custom React hooks for managing users, user operations, and user statistics.
 *              Provides list retrieval, filtering, pagination, CRUD operations, and single-user data access.
 * @module hooks/useUsers
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useApi } from "./useApi";
import * as userService from "../services/userService";

/* ============================================================================
   HOOK: useUsers
   ----------------------------------------------------------------------------
   Retrieves a paginated and filterable list of users.
   Automatically cleans empty filter values to prevent backend validation errors.
   ============================================================================ */
export const useUsers = (params = {}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: params.limit || 20,
  });

  const [currentPage, setCurrentPage] = useState(1);

  // Store previous filter values to detect changes
  const prevFiltersRef = useRef({
    search: params.search,
    role: params.role,
    isActive: params.isActive,
  });

  /**
   * Reset page number when filter parameters change.
   */
  useEffect(() => {
    const prev = prevFiltersRef.current;

    if (
      prev.search !== params.search ||
      prev.role !== params.role ||
      prev.isActive !== params.isActive
    ) {
      setCurrentPage(1);
      prevFiltersRef.current = {
        search: params.search,
        role: params.role,
        isActive: params.isActive,
      };
    }
  }, [params.search, params.role, params.isActive]);

  /**
   * Fetch user list from the API.
   * Removes empty filter values to avoid backend validation failures (HTTP 400).
   */
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build a clean parameter object without empty or undefined values
      const cleanParams = { page: currentPage, limit: pagination.limit };

      Object.entries(params).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          // Convert string "true"/"false" to boolean for API compatibility
          if (key === "isActive") {
            cleanParams[key] = value === "true";
          } else {
            cleanParams[key] = value;
          }
        }
      });

      const response = await userService.getAllUsers(cleanParams);

      setUsers(response.data || []);
      setPagination({
        currentPage: response.pagination?.page || currentPage,
        totalPages: response.pagination?.totalPages || 1,
        totalItems: response.pagination?.total || 0,
        limit: response.pagination?.limit || pagination.limit,
      });

    } catch (err) {
      setError(err.message || "Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  }, [currentPage, JSON.stringify(params)]);

  // Trigger data loading when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    pagination,
    setPage: setCurrentPage,
    refetch: fetchUsers,
  };
};

/* ============================================================================
   HOOK: useUser
   ----------------------------------------------------------------------------
   Retrieves a single user by ID.
   Used in detail and edit pages.
   ============================================================================ */
export const useUser = (userId) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch a specific user using the provided ID.
   */
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
      setError(err.message || "Error al cargar el usuario");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, error, refetch: fetchUser };
};

/* ============================================================================
   HOOK: useUserOperations
   ----------------------------------------------------------------------------
   Provides user creation, update, activation, deactivation, and role updates.
   Includes stateful error and loading handling.
   ============================================================================ */
export const useUserOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** Create a new user */
  const create = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      return await userService.createUser(userData);
    } catch (err) {
      const msg = err.message || "Error al crear el usuario";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Update an existing user */
  const update = useCallback(async (userId, userData) => {
    try {
      setLoading(true);
      setError(null);
      return await userService.updateUser(userId, userData);
    } catch (err) {
      const msg = err.message || "Error al actualizar el usuario";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Deactivate a user */
  const deactivate = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      return await userService.deactivateUser(userId);
    } catch (err) {
      const msg = err.message || "Error al desactivar el usuario";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Activate a user */
  const activate = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      return await userService.activateUser(userId);
    } catch (err) {
      const msg = err.message || "Error al activar el usuario";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Update user role */
  const updateRole = useCallback(async (userId, newRole) => {
    try {
      setLoading(true);
      setError(null);
      return await userService.updateUserRole(userId, newRole);
    } catch (err) {
      const msg = err.message || "Error al actualizar el rol del usuario";
      setError(msg);
      throw new Error(msg);
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
    error,
  };
};

/* ============================================================================
   HOOK: useUserStats
   ----------------------------------------------------------------------------
   Retrieves aggregated user statistics.
   ============================================================================ */
export const useUserStats = () => {
  const { execute, data, loading, error } = useApi(userService.getUserStats);

  useEffect(() => {
    execute();
  }, []);

  return { stats: data, loading, error };
};
