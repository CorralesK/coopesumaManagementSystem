/**
 * Global Error Handler Middleware
 */

const logger = require('../utils/logger');
const { errorResponse } = require('../utils/responseFormatter');
const ERROR_CODES = require('../constants/errorCodes');
const MESSAGES = require('../constants/messages');

const errorHandler = (err, req, res, next) => {
    // Log the error
    logger.error('Error occurred:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    // Operational errors (expected)
    if (err.isOperational) {
        return errorResponse(
            res,
            err.message,
            err.errorCode || ERROR_CODES.INTERNAL_ERROR,
            err.statusCode || 500
        );
    }

    // Database errors
    if (err.code && err.code.startsWith('23')) { // PostgreSQL constraint violations
        if (err.code === '23505') { // Unique violation
            return errorResponse(
                res,
                'Ya existe un registro con estos datos',
                ERROR_CODES.VALIDATION_ERROR,
                409
            );
        }
        if (err.code === '23503') { // Foreign key violation
            return errorResponse(
                res,
                'El registro referenciado no existe',
                ERROR_CODES.VALIDATION_ERROR,
                400
            );
        }
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return errorResponse(
            res,
            MESSAGES.UNAUTHORIZED,
            ERROR_CODES.TOKEN_INVALID,
            401
        );
    }

    if (err.name === 'TokenExpiredError') {
        return errorResponse(
            res,
            MESSAGES.TOKEN_EXPIRED,
            ERROR_CODES.TOKEN_EXPIRED,
            401
        );
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        return errorResponse(
            res,
            MESSAGES.VALIDATION_ERROR,
            ERROR_CODES.VALIDATION_ERROR,
            400,
            err.details
        );
    }

    // Default to 500 server error
    return errorResponse(
        res,
        MESSAGES.INTERNAL_ERROR,
        ERROR_CODES.INTERNAL_ERROR,
        500
    );
};

module.exports = errorHandler;