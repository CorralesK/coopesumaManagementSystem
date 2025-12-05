/**
 * @file HomePage.jsx
 * @description Smart redirect component that sends users to appropriate dashboard based on role
 * @module pages
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../utils/constants';
import Loading from '../components/common/Loading';

/**
 * HomePage Component
 * Redirects authenticated users to their role-specific dashboard
 * Redirects unauthenticated users to login
 */
const HomePage = () => {
    const { isAuthenticated, user, loading } = useAuth();

    // Show loading while checking authentication
    if (loading) {
        return <Loading fullScreen message="Verificando autenticación..." />;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Redirect based on user role
    switch (user?.role) {
        case USER_ROLES.ADMINISTRATOR:
            return <Navigate to="/dashboard" replace />;

        case USER_ROLES.MEMBER:
            return <Navigate to="/my-dashboard" replace />;

        case USER_ROLES.REGISTRAR:
            return <Navigate to="/attendance/scan" replace />;

        case USER_ROLES.MANAGER:
            // For now, redirect managers to dashboard
            // Later we can create a specific manager dashboard
            return <Navigate to="/dashboard" replace />;

        default:
            // Unknown role, redirect to unauthorized
            return <Navigate to="/unauthorized" replace />;
    }
};

export default HomePage;