/**
 * User Validation Schemas
 * Joi validation schemas for user management endpoints
 * Note: Only Microsoft OAuth authentication is supported
 *
 * @module modules/users/userValidation
 */

const Joi = require('joi');

/**
 * Schema for creating a new user
 * Note: All users must authenticate via Microsoft OAuth
 */
const createUserSchema = Joi.object({
    fullName: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.empty': 'El nombre completo es requerido',
            'string.min': 'El nombre completo debe tener al menos 3 caracteres',
            'string.max': 'El nombre completo no puede exceder 100 caracteres',
            'any.required': 'El nombre completo es requerido'
        }),
    username: Joi.string()
        .min(3)
        .max(50)
        .pattern(/^[a-zA-Z0-9_]+$/)
        .required()
        .messages({
            'string.empty': 'El nombre de usuario es requerido',
            'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
            'string.max': 'El nombre de usuario no puede exceder 50 caracteres',
            'string.pattern.base': 'El nombre de usuario solo puede contener letras, números y guiones bajos',
            'any.required': 'El nombre de usuario es requerido'
        }),
    email: Joi.string()
        .email()
        .max(255)
        .optional()
        .messages({
            'string.email': 'El email debe ser válido',
            'string.max': 'El email no puede exceder 255 caracteres'
        }),
    role: Joi.string()
        .valid('administrator', 'registrar', 'treasurer')
        .required()
        .messages({
            'any.only': 'El rol debe ser "administrator", "registrar" o "treasurer"',
            'any.required': 'El rol es requerido'
        }),
    isActive: Joi.boolean()
        .optional()
        .default(true)
        .messages({
            'boolean.base': 'isActive debe ser un valor booleano'
        }),
    microsoftId: Joi.string()
        .max(255)
        .required()
        .messages({
            'string.max': 'El Microsoft ID no puede exceder 255 caracteres',
            'any.required': 'El Microsoft ID es requerido para la autenticación'
        })
});

/**
 * Schema for updating a user
 * Note: Password updates are not supported (Microsoft OAuth only)
 */
const updateUserSchema = Joi.object({
    fullName: Joi.string()
        .min(3)
        .max(100)
        .optional()
        .messages({
            'string.min': 'El nombre completo debe tener al menos 3 caracteres',
            'string.max': 'El nombre completo no puede exceder 100 caracteres'
        }),
    username: Joi.string()
        .min(3)
        .max(50)
        .pattern(/^[a-zA-Z0-9_]+$/)
        .optional()
        .messages({
            'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
            'string.max': 'El nombre de usuario no puede exceder 50 caracteres',
            'string.pattern.base': 'El nombre de usuario solo puede contener letras, números y guiones bajos'
        }),
    email: Joi.string()
        .email()
        .max(255)
        .optional()
        .messages({
            'string.email': 'El email debe ser válido',
            'string.max': 'El email no puede exceder 255 caracteres'
        }),
    role: Joi.string()
        .valid('administrator', 'registrar', 'treasurer')
        .optional()
        .messages({
            'any.only': 'El rol debe ser "administrator", "registrar" o "treasurer"'
        })
}).min(1).messages({
    'object.min': 'Se debe proporcionar al menos un campo para actualizar'
});

/**
 * Schema for query filters
 */
const userFiltersSchema = Joi.object({
    role: Joi.string()
        .valid('administrator', 'registrar', 'treasurer')
        .optional()
        .messages({
            'any.only': 'El rol debe ser "administrator", "registrar" o "treasurer"'
        }),
    isActive: Joi.string()
        .valid('true', 'false')
        .optional()
        .messages({
            'any.only': 'isActive debe ser "true" o "false"'
        })
});

module.exports = {
    createUserSchema,
    updateUserSchema,
    userFiltersSchema
};
