/**
 * Error Messages (English)
 * Backend error messages in English for client-side translation
 */

const MESSAGES = {
    // Authentication
    LOGIN_SUCCESS: 'Login successful',
    LOGIN_FAILED: 'Invalid credentials',
    LOGOUT_SUCCESS: 'Logout successful',
    TOKEN_EXPIRED: 'Session expired',
    UNAUTHORIZED: 'Unauthorized',
    FORBIDDEN: 'Forbidden',

    // Users
    USER_CREATED: 'User created successfully',
    USER_UPDATED: 'User updated successfully',
    USER_DELETED: 'User deleted successfully',
    USER_NOT_FOUND: 'User not found',
    USER_ALREADY_EXISTS: 'User already exists',
    USER_INACTIVE: 'User is inactive',

    // Members
    MEMBER_CREATED: 'Member created successfully',
    MEMBER_UPDATED: 'Member updated successfully',
    MEMBER_DELETED: 'Member deleted successfully',
    MEMBER_NOT_FOUND: 'Member not found',
    MEMBER_ALREADY_EXISTS: 'Member with this identification already exists',
    MEMBER_INACTIVE: 'Member is inactive',
    MEMBER_CODE_DUPLICATE: 'Member code already exists',
    QR_GENERATED: 'QR code generated successfully',
    INVALID_QR: 'Invalid QR code',

    // Assemblies
    ASSEMBLY_CREATED: 'Assembly created successfully',
    ASSEMBLY_UPDATED: 'Assembly updated successfully',
    ASSEMBLY_DELETED: 'Assembly deleted successfully',
    ASSEMBLY_ACTIVATED: 'Assembly activated successfully',
    ASSEMBLY_DEACTIVATED: 'Assembly deactivated successfully',
    ASSEMBLY_NOT_FOUND: 'Assembly not found',
    NO_ACTIVE_ASSEMBLY: 'No active assembly',
    ASSEMBLY_ALREADY_ACTIVE: 'Assembly already active',

    // Attendance
    ATTENDANCE_REGISTERED: 'Attendance registered successfully',
    ATTENDANCE_ALREADY_REGISTERED: 'Attendance already registered',
    ATTENDANCE_NOT_FOUND: 'Attendance record not found',
    MANUAL_ATTENDANCE_REGISTERED: 'Manual attendance registered successfully',

    // Reports
    REPORT_GENERATED: 'Report generated successfully',
    REPORT_FAILED: 'Report generation failed',

    // Validation
    VALIDATION_ERROR: 'Validation error',
    INVALID_INPUT: 'Invalid input',
    REQUIRED_FIELD: 'Required field',
    INVALID_EMAIL: 'Invalid institutional email',
    EMAIL_ALREADY_EXISTS: 'Email already registered',
    STUDENT_REQUIRES_LEVEL: 'Students require an educational level',

    // General
    SUCCESS: 'Operation successful',
    ERROR: 'An error occurred',
    NOT_FOUND: 'Resource not found',
    BAD_REQUEST: 'Bad request',
    INTERNAL_ERROR: 'Internal server error'
};

module.exports = MESSAGES;