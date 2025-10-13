/**
 * ProtectedRoute Component
 * Wrapper component to protect routes that require authentication
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, user, loading } = useAuth();

    // Show loading while checking authentication
    if (loading) {
        return <Loading fullScreen message="Verificando autenticación..." />;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check role if required
    if (requiredRole) {
        const hasRequiredRole = Array.isArray(requiredRole)
            ? requiredRole.includes(user?.role)
            : user?.role === requiredRole;

        if (!hasRequiredRole) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    // Render protected content
    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    requiredRole: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string)
    ])
};

export default ProtectedRoute;
