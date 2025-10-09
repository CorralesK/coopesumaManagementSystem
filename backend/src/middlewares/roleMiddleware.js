/**
 * Role-Based Access Control Middleware
 * Checks if user has required role or permission
 */

const { hasPermission } = require('../constants/roles');
const { errorResponse } = require('../utils/responseFormatter');
const ERROR_CODES = require('../constants/errorCodes');
const MESSAGES = require('../constants/messages');

/**
 * Check if user has one of the allowed roles
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {Function} - Express middleware
 */
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return errorResponse(
                res,
                MESSAGES.UNAUTHORIZED,
                ERROR_CODES.UNAUTHORIZED,
                401
            );
        }

        if (!allowedRoles.includes(req.user.role)) {
            return errorResponse(
                res,
                MESSAGES.FORBIDDEN,
                ERROR_CODES.FORBIDDEN,
                403
            );
        }

        next();
    };
};

/**
 * Check if user has required permission
 * @param {string} permission - Required permission
 * @returns {Function} - Express middleware
 */
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return errorResponse(
                res,
                MESSAGES.UNAUTHORIZED,
                ERROR_CODES.UNAUTHORIZED,
                401
            );
        }

        if (!hasPermission(req.user.role, permission)) {
            return errorResponse(
                res,
                MESSAGES.FORBIDDEN,
                ERROR_CODES.FORBIDDEN,
                403
            );
        }

        next();
    };
};

module.exports = {
    requireRole,
    requirePermission
};