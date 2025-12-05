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
            'string.base': 'El nombre completo debe ser texto',
            'string.empty': 'El nombre completo es requerido',
            'string.min': 'El nombre completo debe tener al menos 3 caracteres',
            'string.max': 'El nombre completo no puede exceder 100 caracteres',
            'any.required': 'El nombre completo es requerido'
        }),

    email: Joi.string()
        .trim()
        .email()
        .max(255)
        .required()
        .messages({
            'string.base': 'El correo electrónico debe ser texto',
            'string.empty': 'El correo electrónico es requerido',
            'string.email': 'El formato del correo electrónico no es válido',
            'string.max': 'El correo electrónico no puede exceder 255 caracteres',
            'any.required': 'El correo electrónico es requerido'
        }),

    role: Joi.string()
        .valid(...Object.values(USER_ROLES))
        .required()
        .messages({
            'string.base': 'El rol debe ser texto',
            'any.only': 'El rol debe ser uno de los roles válidos del sistema',
            'any.required': 'El rol es requerido'
        }),

    isActive: Joi.boolean()
        .optional()
        .default(true)
        .messages({
            'boolean.base': 'El estado activo debe ser verdadero o falso'
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
            'string.base': 'El nombre completo debe ser texto',
            'string.min': 'El nombre completo debe tener al menos 3 caracteres',
            'string.max': 'El nombre completo no puede exceder 100 caracteres'
        }),

    email: Joi.string()
        .trim()
        .email()
        .max(255)
        .optional()
        .messages({
            'string.base': 'El correo electrónico debe ser texto',
            'string.email': 'El formato del correo electrónico no es válido',
            'string.max': 'El correo electrónico no puede exceder 255 caracteres'
        }),

    role: Joi.string()
        .valid(...Object.values(USER_ROLES))
        .optional()
        .messages({
            'string.base': 'El rol debe ser texto',
            'any.only': 'El rol debe ser uno de los roles válidos del sistema'
        })
}).min(1).messages({
    'object.min': 'Debe proporcionar al menos un campo para actualizar'
});

module.exports = {
    userFiltersSchema,
    createUserSchema,
    updateUserSchema
};
