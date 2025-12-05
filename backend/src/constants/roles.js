/**
 * User Roles Constants
 * Updated to match database schema (member, manager instead of student, treasurer)
 */

const USER_ROLES = {
    ADMINISTRATOR: 'administrator',
    REGISTRAR: 'registrar',
    MANAGER: 'manager',        // Changed from TREASURER
    MEMBER: 'member',          // Changed from STUDENT

    // Deprecated aliases for backwards compatibility
    TREASURER: 'manager',      // Alias for MANAGER
    STUDENT: 'member'          // Alias for MEMBER
};

const ROLE_PERMISSIONS = {
    [USER_ROLES.ADMINISTRATOR]: [
        'manage_users',
        'manage_members',
        'manage_assemblies',
        'scan_attendance',
        'generate_reports',
        'manage_savings',
        'manage_contributions',
        'approve_withdrawals',
        'view_all_data',
        'view_qr_codes',
        'generate_qr_codes',
        'manage_surplus',
        'execute_liquidations',
        'broadcast_notifications',
        'generate_receipts'
    ],
    [USER_ROLES.REGISTRAR]: [
        'scan_attendance',
        'view_active_assembly'
    ],
    [USER_ROLES.MANAGER]: [  // Changed from TREASURER
        'manage_savings',
        'manage_contributions',
        'approve_withdrawals',
        'view_savings_reports',
        'view_member_balances',
        'generate_receipts',
        'manage_surplus'
    ],
    [USER_ROLES.MEMBER]: [  // Changed from STUDENT
        'view_own_dashboard',
        'view_own_accounts',
        'view_own_transactions',
        'request_withdrawal'
    ]
};

const isValidRole = (role) => {
    return Object.values(USER_ROLES).includes(role);
};

const hasPermission = (role, permission) => {
    return ROLE_PERMISSIONS[role]?.includes(permission) || false;
};

module.exports = {
    USER_ROLES,
    ROLE_PERMISSIONS,
    isValidRole,
    hasPermission
};