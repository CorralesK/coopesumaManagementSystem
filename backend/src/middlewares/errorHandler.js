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

    // Database errors (PostgreSQL)
    if (err.code) {
        // Constraint violations (23xxx codes)
        if (err.code.startsWith('23')) {
            switch (err.code) {
                case '23505': // Unique violation
                    return errorResponse(
                        res,
                        'A record with this data already exists',
                        ERROR_CODES.VALIDATION_ERROR,
                        409
                    );
                case '23503': // Foreign key violation
                    return errorResponse(
                        res,
                        'The referenced record does not exist',
                        ERROR_CODES.VALIDATION_ERROR,
                        400
                    );
                case '23502': // NOT NULL constraint violation
                    return errorResponse(
                        res,
                        'Required data is missing to complete the operation',
                        ERROR_CODES.VALIDATION_ERROR,
                        400
                    );
                case '23514': // CHECK constraint violation
                    return errorResponse(
                        res,
                        'Data does not meet the required constraints',
                        ERROR_CODES.VALIDATION_ERROR,
                        400
                    );
                default:
                    // Other constraint violations
                    return errorResponse(
                        res,
                        'Validation error in the provided data',
                        ERROR_CODES.VALIDATION_ERROR,
                        400
                    );
            }
        }

        // Data type errors (22xxx codes)
        if (err.code.startsWith('22')) {
            return errorResponse(
                res,
                'The provided data has an invalid format',
                ERROR_CODES.VALIDATION_ERROR,
                400
            );
        }

        // Syntax errors and access rule violations (42xxx codes)
        if (err.code.startsWith('42')) {
            // These are programming errors, don't expose details
            return errorResponse(
                res,
                MESSAGES.INTERNAL_ERROR,
                ERROR_CODES.DATABASE_ERROR,
                500
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