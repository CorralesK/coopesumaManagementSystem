/**
 * @file usePermissions.js
 * @description Custom hook for role-based permissions
 * @module hooks/usePermissions
 */

import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../utils/constants';

/**
 * Custom hook to check user permissions based on role
 * @returns {Object} Permission checking functions
 */
export const usePermissions = () => {
    const { user } = useAuth();
    const userRole = user?.role;

    // Check if user is admin
    const isAdmin = () => userRole === USER_ROLES.ADMINISTRATOR;

    // Check if user is manager (treasurer)
    const isManager = () => userRole === USER_ROLES.MANAGER;

    // Check if user is registrar
    const isRegistrar = () => userRole === USER_ROLES.REGISTRAR;

    // Check if user is member (student)
    const isMember = () => userRole === USER_ROLES.MEMBER;

    // Check if user has admin or manager role
    const isAdminOrManager = () => isAdmin() || isManager();

    // Permissions for specific features
    const permissions = {
        // Dashboard access
        canAccessDashboard: isAdmin() || isRegistrar(),

        // Members management
        canViewMembers: isAdmin() || isManager() || isRegistrar(),
        canCreateMembers: isAdmin() || isRegistrar(),
        canEditMembers: isAdmin() || isRegistrar(),
        canDeleteMembers: isAdmin(),
        canRegenerateQR: isAdmin() || isRegistrar(),

        // Member detail page - specific sections
        canViewMemberBasicInfo: isAdmin() || isManager() || isRegistrar(),
        canViewMemberPersonalData: isAdmin() || isRegistrar(), // Only admin and registrar see personal data
        canViewMemberPhoto: isAdmin() || isRegistrar(),
        canViewMemberAffiliationInfo: isAdmin() || isManager() || isRegistrar(),
        canViewMemberSavings: isAdmin() || isManager(),
        canViewMemberLiquidations: isAdmin() || isManager(),

        // Savings operations
        canDepositSavings: isAdmin() || isManager(),
        canWithdrawSavings: isAdmin() || isManager(),
        canLiquidateMember: isAdmin() || isManager(),
        canViewSavingsManagement: isAdmin() || isManager(),
        canViewWithdrawalRequests: isAdmin() || isManager(),

        // Users management
        canViewUsers: isAdmin(),
        canCreateUsers: isAdmin(),
        canEditUsers: isAdmin(),
        canDeleteUsers: isAdmin(),

        // Assemblies
        canViewAssemblies: isAdmin() || isRegistrar(),
        canCreateAssemblies: isAdmin() || isRegistrar(),
        canEditAssemblies: isAdmin() || isRegistrar(),
        canDeleteAssemblies: isAdmin(),
        canManageAttendance: isAdmin() || isRegistrar(),

        // Notifications
        canViewNotifications: isAdmin() || isManager(),
        canSendNotifications: isAdmin(), // Only admin can send
        canDeleteNotifications: isAdmin(),

        // QR Code operations
        canScanQR: isAdmin() || isRegistrar(),
        canViewQRCode: isAdmin() || isRegistrar(),

        // Reports and analytics
        canViewReports: isAdmin() || isManager(),
        canExportData: isAdmin() || isManager(),
    };

    return {
        userRole,
        isAdmin,
        isManager,
        isRegistrar,
        isMember,
        isAdminOrManager,
        ...permissions,
    };
};

export default usePermissions;