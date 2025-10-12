/**
 * Authentication Validation Schemas
 * Input validation for authentication endpoints using Joi
 *
 * NOTE: Microsoft OAuth does not require validation schemas
 * as authentication is handled by Microsoft's OAuth provider.
 *
 * This file is kept for consistency with the module structure
 * and for potential future validation needs (e.g., state validation).
 *
 * @module modules/auth/authValidation
 */

const Joi = require('joi');

/**
 * State validation schema (for OAuth CSRF protection)
 * Validates state parameter in OAuth callback
 */
const stateValidationSchema = Joi.object({
    state: Joi.string()
        .required()
        .messages({
            'string.empty': 'State parameter is required',
            'any.required': 'State parameter is required'
        })
});

/**
 * OAuth callback query validation schema
 * Validates query parameters received from Microsoft OAuth callback
 */
const oauthCallbackSchema = Joi.object({
    code: Joi.string()
        .optional()
        .messages({
            'string.empty': 'Authorization code cannot be empty'
        }),

    state: Joi.string()
        .required()
        .messages({
            'string.empty': 'State parameter is required',
            'any.required': 'State parameter is required'
        }),

    error: Joi.string()
        .optional(),

    error_description: Joi.string()
        .optional()
});

module.exports = {
    stateValidationSchema,
    oauthCallbackSchema
};
