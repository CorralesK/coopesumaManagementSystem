/**
 * @file useUsers.js
 * @description Custom React hooks for managing users, user operations, and user statistics.
 *              Provides list retrieval, filtering, pagination, CRUD operations, and single-user data access.
 * @module hooks/useUsers
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useApi } from "./useApi";
import * as userService from "../services/userService";
import { normalizeText } from "../utils/formatters";

/* ============================================================================
   HOOK: useUsers
   ----------------------------------------------------------------------------
   Retrieves all users and filters/paginates in frontend for better UX
   with accent-insensitive search.
   ============================================================================ */
export const useUsers = (params = {}) => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = params.limit || 10;

  /**
   * Fetch all users from the API (backend filters by role and isActive only)
   */
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Only send backend filters (not search, that's done in frontend)
      // Backend has a max limit of 100, so we use that
      const cleanParams = { limit: 100 };

      if (params.role && params.role !== "") {
        cleanParams.role = params.role;
      }
      if (params.isActive !== "" && params.isActive !== null && params.isActive !== undefined) {
        cleanParams.isActive = params.isActive === "true";
      }

      const response = await userService.getAllUsers(cleanParams);

      // Sort users: active first, then by name
      const sortedUsers = (response.data || []).sort((a, b) => {
        if (a.isActive !== b.isActive) {
          return b.isActive - a.isActive;
        }
        return (a.fullName || "").localeCompare(b.fullName || "", "es");
      });

      setAllUsers(sortedUsers);
    } catch (err) {
      setError(err.message || "Error al cargar los usuarios");
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  }, [params.role, params.isActive]);

  // Filter users by search term in frontend (supports accents)
  const filteredUsers = useMemo(() => {
    if (!params.search) return allUsers;
    const normalizedSearch = normalizeText(params.search);
    return allUsers.filter(user =>
      normalizeText(user.fullName || "").includes(normalizedSearch) ||
      normalizeText(user.email || "").includes(normalizedSearch)
    );
  }, [allUsers, params.search]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [params.search]);

  // Pagination in frontend
  const totalPages = Math.ceil(filteredUsers.length / limit);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * limit;
    return filteredUsers.slice(startIndex, startIndex + limit);
  }, [filteredUsers, currentPage, limit]);

  const pagination = useMemo(() => ({
    currentPage,
    totalPages: totalPages || 1,
    totalItems: filteredUsers.length,
    limit,
  }), [currentPage, totalPages, filteredUsers.length, limit]);

  // Trigger data loading when backend filters change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users: paginatedUsers,
    allUsers: filteredUsers,
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
