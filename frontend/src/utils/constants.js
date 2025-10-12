/**
 * Application Constants
 * Centralized constants for the application
 *
 * @module utils/constants
 */

/**
 * User roles
 */
export const USER_ROLES = {
    ADMINISTRATOR: 'administrator',
    REGISTRAR: 'registrar',
    TREASURER: 'treasurer',
};

/**
 * Registration methods for attendance
 */
export const REGISTRATION_METHODS = {
    QR_SCAN: 'qr_scan',
    MANUAL: 'manual',
};

/**
 * Recurrence patterns for assemblies
 */
export const RECURRENCE_PATTERNS = {
    NONE: 'none',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
};

/**
 * Grade options (1-6 for elementary school)
 */
export const GRADES = ['1', '2', '3', '4', '5', '6'];

/**
 * Section options
 */
export const SECTIONS = ['A', 'B', 'C', 'D'];

/**
 * Pagination defaults
 */
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 50,
    MAX_LIMIT: 100,
};

/**
 * Route paths
 */
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    AUTH_SUCCESS: '/auth/success',
    AUTH_ERROR: '/auth/error',
    DASHBOARD: '/dashboard',
    MEMBERS: '/members',
    MEMBERS_NEW: '/members/new',
    MEMBERS_EDIT: '/members/:id/edit',
    MEMBERS_DETAIL: '/members/:id',
    ASSEMBLIES: '/assemblies',
    ASSEMBLIES_NEW: '/assemblies/new',
    ASSEMBLIES_EDIT: '/assemblies/:id/edit',
    ASSEMBLIES_DETAIL: '/assemblies/:id',
    ATTENDANCE: '/attendance',
    ATTENDANCE_SCAN: '/attendance/scan',
    ATTENDANCE_MANUAL: '/attendance/manual',
    USERS: '/users',
    USERS_NEW: '/users/new',
    USERS_EDIT: '/users/:id/edit',
    REPORTS: '/reports',
    REPORTS_ATTENDANCE: '/reports/attendance/:assemblyId',
    UNAUTHORIZED: '/unauthorized',
    NOT_FOUND: '/404',
};

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
    // Auth
    AUTH_MICROSOFT: '/auth/microsoft',
    AUTH_CALLBACK: '/auth/callback',
    AUTH_VERIFY: '/auth/verify',
    AUTH_LOGOUT: '/auth/logout',

    // Members
    MEMBERS: '/members',
    MEMBERS_BY_ID: (id) => `/members/${id}`,
    MEMBERS_QR_GENERATE: (id) => `/members/${id}/generate-qr`,
    MEMBERS_QR_REGENERATE: (id) => `/members/${id}/regenerate-qr`,
    MEMBERS_QR_PRINT: '/members/qr-codes/print',
    MEMBERS_VERIFY_QR: '/members/verify-qr',

    // Assemblies
    ASSEMBLIES: '/assemblies',
    ASSEMBLIES_BY_ID: (id) => `/assemblies/${id}`,
    ASSEMBLIES_ACTIVE: '/assemblies/active',
    ASSEMBLIES_ACTIVATE: (id) => `/assemblies/${id}/activate`,
    ASSEMBLIES_DEACTIVATE: (id) => `/assemblies/${id}/deactivate`,

    // Attendance
    ATTENDANCE: '/attendance',
    ATTENDANCE_BY_ID: (id) => `/attendance/${id}`,
    ATTENDANCE_SCAN: '/attendance/scan',
    ATTENDANCE_MANUAL: '/attendance/manual',
    ATTENDANCE_BY_ASSEMBLY: (assemblyId) => `/attendance/assembly/${assemblyId}`,
    ATTENDANCE_BY_MEMBER: (memberId) => `/attendance/member/${memberId}`,
    ATTENDANCE_STATS: (assemblyId) => `/attendance/assembly/${assemblyId}/stats`,

    // Users
    USERS: '/users',
    USERS_BY_ID: (id) => `/users/${id}`,
    USERS_DEACTIVATE: (id) => `/users/${id}/deactivate`,
    USERS_ACTIVATE: (id) => `/users/${id}/activate`,

    // Reports
    REPORTS_ATTENDANCE: (assemblyId) => `/reports/attendance/${assemblyId}`,
    REPORTS_ATTENDANCE_STATS: (assemblyId) => `/reports/attendance-stats/${assemblyId}`,
};

/**
 * Local storage keys
 * NOTE: Avoid using localStorage for sensitive data like tokens
 * Use React state/context instead
 */
export const STORAGE_KEYS = {
    USER_PREFERENCES: 'coopesuma_user_preferences',
    THEME: 'coopesuma_theme',
};

/**
 * Toast notification types
 */
export const TOAST_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
};

/**
 * Date/Time formats
 */
export const DATE_FORMATS = {
    DISPLAY: 'DD/MM/YYYY',
    API: 'YYYY-MM-DD',
    DATETIME: 'DD/MM/YYYY HH:mm',
};

/**
 * Error codes (should match backend)
 */
export const ERROR_CODES = {
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    TOKEN_INVALID: 'TOKEN_INVALID',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
    USER_INACTIVE: 'USER_INACTIVE',
    MEMBER_NOT_FOUND: 'MEMBER_NOT_FOUND',
    MEMBER_ALREADY_EXISTS: 'MEMBER_ALREADY_EXISTS',
    INVALID_QR_CODE: 'INVALID_QR_CODE',
    ASSEMBLY_NOT_FOUND: 'ASSEMBLY_NOT_FOUND',
    NO_ACTIVE_ASSEMBLY: 'NO_ACTIVE_ASSEMBLY',
    ATTENDANCE_ALREADY_REGISTERED: 'ATTENDANCE_ALREADY_REGISTERED',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
};
