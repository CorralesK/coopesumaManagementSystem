/**
 * Authorized Users Whitelist
 * Configuration for authorized users who can access the system via Microsoft OAuth
 *
 * Users NOT in this list will be rejected during OAuth authentication
 *
 * @module config/authorizedUsers
 */

const USER_ROLES = require('../constants/roles');

/**
 * List of authorized users
 * Each entry maps an email to a role and full name
 *
 * IMPORTANT: Update this list with real email addresses from your school
 *
 * Format:
 * {
 *   email: 'user@domain.com',
 *   role: 'administrator' | 'registrar' | 'treasurer',
 *   fullName: 'Full Name'
 * }
 */
const AUTHORIZED_USERS = [
    // Administrators
    {
        email: 'director@escuela.ed.cr',
        role: USER_ROLES.USER_ROLES.ADMINISTRATOR,
        fullName: 'Director Escuela'
    },
    {
        email: 'admin@escuela.ed.cr',
        role: USER_ROLES.USER_ROLES.ADMINISTRATOR,
        fullName: 'Administrador Sistema'
    },

    // Registrars (attendance scanners)
    {
        email: 'registrador1@escuela.ed.cr',
        role: USER_ROLES.USER_ROLES.REGISTRAR,
        fullName: 'Registrador 1'
    },
    {
        email: 'registrador2@escuela.ed.cr',
        role: USER_ROLES.USER_ROLES.REGISTRAR,
        fullName: 'Registrador 2'
    },

    // Treasurers (Phase 2 - for savings management)
    {
        email: 'tesorero@escuela.ed.cr',
        role: USER_ROLES.USER_ROLES.TREASURER,
        fullName: 'Tesorero CoopeSuma'
    }
];

/**
 * Checks if an email is authorized to access the system
 *
 * @param {string} email - Email address to check
 * @returns {Object|null} User object if authorized, null otherwise
 */
const isEmailAuthorized = (email) => {
    if (!email) return null;

    // Case-insensitive email comparison
    const normalizedEmail = email.toLowerCase().trim();

    return AUTHORIZED_USERS.find(
        user => user.email.toLowerCase() === normalizedEmail
    ) || null;
};

/**
 * Gets the role for an authorized email
 *
 * @param {string} email - Email address
 * @returns {string|null} Role if authorized, null otherwise
 */
const getRoleByEmail = (email) => {
    const user = isEmailAuthorized(email);
    return user ? user.role : null;
};

/**
 * Gets the full name for an authorized email
 *
 * @param {string} email - Email address
 * @returns {string|null} Full name if authorized, null otherwise
 */
const getFullNameByEmail = (email) => {
    const user = isEmailAuthorized(email);
    return user ? user.fullName : null;
};

/**
 * Gets all authorized emails (for admin purposes)
 *
 * @returns {string[]} Array of authorized email addresses
 */
const getAllAuthorizedEmails = () => {
    return AUTHORIZED_USERS.map(user => user.email);
};

/**
 * Gets all authorized users (for admin purposes)
 *
 * @returns {Array} Array of authorized user objects
 */
const getAllAuthorizedUsers = () => {
    return AUTHORIZED_USERS.map(user => ({ ...user }));
};

/**
 * Adds a new authorized user (in-memory only, not persisted)
 * NOTE: In production, this should be done via a database admin interface
 *
 * @param {Object} user - User object {email, role, fullName}
 * @returns {boolean} True if added successfully
 */
const addAuthorizedUser = (user) => {
    if (!user.email || !user.role || !user.fullName) {
        return false;
    }

    // Check if email already exists
    if (isEmailAuthorized(user.email)) {
        return false;
    }

    AUTHORIZED_USERS.push({
        email: user.email,
        role: user.role,
        fullName: user.fullName
    });

    return true;
};

module.exports = {
    AUTHORIZED_USERS,
    isEmailAuthorized,
    getRoleByEmail,
    getFullNameByEmail,
    getAllAuthorizedEmails,
    getAllAuthorizedUsers,
    addAuthorizedUser
};
