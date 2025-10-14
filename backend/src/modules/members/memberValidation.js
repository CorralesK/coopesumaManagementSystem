/**
 * Member Validation Schemas
 * Input validation for member endpoints using Joi
 *
 * @module modules/members/memberValidation
 */

const Joi = require('joi');

/**
 * Create member validation schema
 */
const createMemberSchema = Joi.object({
    fullName: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.empty': 'El nombre completo es requerido',
            'string.min': 'El nombre completo debe tener al menos 3 caracteres',
            'string.max': 'El nombre completo no puede exceder 100 caracteres',
            'any.required': 'El nombre completo es requerido'
        }),

    identification: Joi.string()
        .trim()
        .pattern(/^[0-9-]+$/)
        .required()
        .messages({
            'string.empty': 'El número de identificación es requerido',
            'string.pattern.base': 'El número de identificación solo puede contener números y guiones',
            'any.required': 'El número de identificación es requerido'
        }),

    grade: Joi.string()
        .trim()
        .valid('1', '2', '3', '4', '5', '6')
        .required()
        .messages({
            'string.empty': 'El grado es requerido',
            'any.only': 'El grado debe ser un número entre 1 y 6',
            'any.required': 'El grado es requerido'
        }),

    institutionalEmail: Joi.string()
        .trim()
        .email()
        .pattern(/mep\.go\.cr$/)
        .required()
        .messages({
            'string.empty': 'El correo institucional es requerido',
            'string.email': 'El correo institucional debe ser válido',
            'string.pattern.base': 'El correo debe ser un correo institucional del MEP (debe terminar en mep.go.cr)',
            'any.required': 'El correo institucional es requerido'
        }),

    photoUrl: Joi.string()
        .uri()
        .optional()
        .allow('', null)
        .messages({
            'string.uri': 'La URL de la foto debe ser válida'
        })
});

/**
 * Update member validation schema
 * All fields are optional for updates
 */
const updateMemberSchema = Joi.object({
    fullName: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .optional()
        .messages({
            'string.min': 'El nombre completo debe tener al menos 3 caracteres',
            'string.max': 'El nombre completo no puede exceder 100 caracteres'
        }),

    identification: Joi.string()
        .trim()
        .pattern(/^[0-9-]+$/)
        .optional()
        .messages({
            'string.pattern.base': 'El número de identificación solo puede contener números y guiones'
        }),

    grade: Joi.string()
        .trim()
        .valid('1', '2', '3', '4', '5', '6')
        .optional()
        .messages({
            'any.only': 'El grado debe ser un número entre 1 y 6'
        }),

    photoUrl: Joi.string()
        .uri()
        .optional()
        .allow('', null)
        .messages({
            'string.uri': 'La URL de la foto debe ser válida'
        }),

    isActive: Joi.boolean()
        .optional()
        .messages({
            'boolean.base': 'isActive debe ser un valor booleano'
        })
}).min(1); // At least one field must be provided

/**
 * Batch QR generation validation schema
 */
const batchQrSchema = Joi.object({
    memberIds: Joi.array()
        .items(Joi.number().integer().positive())
        .min(1)
        .required()
        .messages({
            'array.base': 'memberIds debe ser un array',
            'array.min': 'Debe proporcionar al menos un ID de miembro',
            'any.required': 'memberIds es requerido'
        })
});

/**
 * Verify QR validation schema
 */
const verifyQrSchema = Joi.object({
    qrHash: Joi.string()
        .trim()
        .required()
        .messages({
            'string.empty': 'El hash del código QR es requerido',
            'any.required': 'El hash del código QR es requerido'
        })
});

module.exports = {
    createMemberSchema,
    updateMemberSchema,
    batchQrSchema,
    verifyQrSchema
};
