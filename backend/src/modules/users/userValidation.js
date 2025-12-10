/**
 * User Validation Schemas
 * Provides Joi validation rules for user operations.
 * Matches the database schema and Microsoft OAuth authentication model.
 *
 * @module modules/users/userValidation
 */

const Joi = require('joi');
const { USER_ROLES } = require('../../constants/roles');

/**
 * Schema for GET /api/users filters.
 * - Supports pagination
 * - Allows empty or optional search text
 * - Allows optional role filtering (no predefined list because roles are dynamic)
 * - Allows optional activation state
 */
const userFiltersSchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .messages({
            'number.base': 'Page must be a number',
            'number.min': 'Page must be at least 1',
        }),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(20)
        .messages({
            'number.base': 'Limit must be a number',
            'number.min': 'Limit must be at least 1',
            'number.max': 'Limit cannot exceed 100',
        }),

    search: Joi.string()
        .allow('')
        .optional()
        .messages({
            'string.base': 'Search must be a string',
        }),

    // Role is optional and not validated against a predefined list
    // because the system supports dynamic roles.
    role: Joi.string()
        .allow('')
        .optional(),

    isActive: Joi.string()
        .valid('true', 'false')
        .optional()
        .messages({
            'any.only': 'isActive must be "true" or "false"',
        }),
});

/**
 * Schema for POST /api/users - Create new user
 * Validates user creation according to database schema and Microsoft OAuth model.
 */
const createUserSchema = Joi.object({
    fullName: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.base': 'Full name must be text',
            'string.empty': 'Full name is required',
            'string.min': 'Full name must have at least 3 characters',
            'string.max': 'Full name cannot exceed 100 characters',
            'any.required': 'Full name is required'
        }),

    email: Joi.string()
        .trim()
        .email()
        .max(255)
        .required()
        .messages({
            'string.base': 'Email must be text',
            'string.empty': 'Email is required',
            'string.email': 'Email format is not valid',
            'string.max': 'Email cannot exceed 255 characters',
            'any.required': 'Email is required'
        }),

    role: Joi.string()
        .valid(...Object.values(USER_ROLES))
        .required()
        .messages({
            'string.base': 'Role must be text',
            'any.only': 'Role must be one of the valid system roles',
            'any.required': 'Role is required'
        }),

    isActive: Joi.boolean()
        .optional()
        .default(true)
        .messages({
            'boolean.base': 'Active status must be true or false'
        })
});

/**
 * Schema for PUT /api/users/:id - Update existing user
 * At least one field must be provided for update.
 */
const updateUserSchema = Joi.object({
    fullName: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .optional()
        .messages({
            'string.base': 'Full name must be text',
            'string.min': 'Full name must have at least 3 characters',
            'string.max': 'Full name cannot exceed 100 characters'
        }),

    email: Joi.string()
        .trim()
        .email()
        .max(255)
        .optional()
        .messages({
            'string.base': 'Email must be text',
            'string.email': 'Email format is not valid',
            'string.max': 'Email cannot exceed 255 characters'
        }),

    role: Joi.string()
        .valid(...Object.values(USER_ROLES))
        .optional()
        .messages({
            'string.base': 'Role must be text',
            'any.only': 'Role must be one of the valid system roles'
        })
}).min(1).messages({
    'object.min': 'At least one field must be provided for update'
});

module.exports = {
    userFiltersSchema,
    createUserSchema,
    updateUserSchema
};
