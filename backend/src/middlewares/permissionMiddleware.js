/**
 * Permission Middleware
 * Check if user has required permission based on role
 */

const { ROLE_PERMISSIONS } = require('../constants/roles');
const logger = require('../utils/logger');

/**
 * Check if user has required permission
 *
 * @param {string} requiredPermission - Permission required
 * @returns {Function} Express middleware
 */
const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        try {
            const userRole = req.user?.role;

            if (!userRole) {
                logger.warn('Permission check failed: No role found in user object');
                return res.status(401).json({
                    success: false,
                    message: 'No autenticado',
                    error: 'UNAUTHORIZED'
                });
            }

            const userPermissions = ROLE_PERMISSIONS[userRole] || [];

            if (userPermissions.includes(requiredPermission)) {
                return next();
            }

            logger.warn('Permission denied', {
                userId: req.user.userId,
                role: userRole,
                requiredPermission,
                userPermissions
            });

            return res.status(403).json({
                success: false,
                message: 'No tiene permisos para realizar esta acción',
                error: 'FORBIDDEN',
                requiredPermission
            });
        } catch (error) {
            logger.error('Error in permission middleware:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al verificar permisos',
                error: 'INTERNAL_ERROR'
            });
        }
    };
};

/**
 * Check if user has any of the required roles
 *
 * @param {Array<string>} allowedRoles - Array of allowed roles
 * @returns {Function} Express middleware
 */
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            const userRole = req.user?.role;

            if (!userRole) {
                return res.status(401).json({
                    success: false,
                    message: 'No autenticado',
                    error: 'UNAUTHORIZED'
                });
            }

            if (allowedRoles.includes(userRole)) {
                return next();
            }

            logger.warn('Role check failed', {
                userId: req.user.userId,
                userRole,
                allowedRoles
            });

            return res.status(403).json({
                success: false,
                message: 'No tiene el rol necesario para realizar esta acción',
                error: 'FORBIDDEN'
            });
        } catch (error) {
            logger.error('Error in role middleware:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al verificar rol',
                error: 'INTERNAL_ERROR'
            });
        }
    };
};

module.exports = {
    checkPermission,
    checkRole
};