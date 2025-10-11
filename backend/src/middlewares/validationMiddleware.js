/**
 * Validation Middleware
 * Validates request data using Joi schemas
 */

const { errorResponse } = require('../utils/responseFormatter');
const ERROR_CODES = require('../constants/errorCodes');
const MESSAGES = require('../constants/messages');

/**
 * Validate request body, query, or params using Joi schema
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Property to validate (body, query, params)
 * @returns {Function} - Express middleware
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const details = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return errorResponse(
                res,
                MESSAGES.VALIDATION_ERROR,
                ERROR_CODES.VALIDATION_ERROR,
                400,
                details
            );
        }

        // Replace request data with validated data
        req[property] = value;
        next();
    };
};

/**
 * Convenience function for validating query parameters
 * @param {Object} schema - Joi validation schema
 * @returns {Function} - Express middleware
 */
const validateQuery = (schema) => validate(schema, 'query');

/**
 * Convenience function for validating URL parameters
 * @param {Object} schema - Joi validation schema
 * @returns {Function} - Express middleware
 */
const validateParams = (schema) => validate(schema, 'params');

module.exports = {
    validate,
    validateQuery,
    validateParams
};