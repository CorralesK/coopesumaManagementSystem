/**
 * User Roles Constants
 */

const USER_ROLES = {
    ADMINISTRATOR: 'administrator',
    REGISTRAR: 'registrar',
    TREASURER: 'treasurer'
};

const ROLE_PERMISSIONS = {
    [USER_ROLES.ADMINISTRATOR]: [
        'manage_users',
        'manage_members',
        'manage_assemblies',
        'scan_attendance',
        'generate_reports',
        'manage_savings',
        'view_all_data',
        'view_qr_codes',
        'generate_qr_codes'
    ],
    [USER_ROLES.REGISTRAR]: [
        'scan_attendance',
        'view_active_assembly'
    ],
    [USER_ROLES.TREASURER]: [
        'manage_savings',
        'view_savings_reports',
        'view_member_balances'
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