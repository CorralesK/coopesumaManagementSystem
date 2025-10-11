/**
 * Attendance Validation Schemas
 * Joi validation schemas for attendance endpoints
 *
 * @module modules/attendance/attendanceValidation
 */

const Joi = require('joi');

/**
 * Schema for QR scan registration
 */
const registerByQrSchema = Joi.object({
    qrHash: Joi.string()
        .required()
        .min(10)
        .messages({
            'string.empty': 'El hash del código QR es requerido',
            'string.min': 'El hash del código QR debe tener al menos 10 caracteres',
            'any.required': 'El hash del código QR es requerido'
        })
});

/**
 * Schema for manual registration
 */
const registerManuallySchema = Joi.object({
    memberId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'El ID del miembro debe ser un número',
            'number.integer': 'El ID del miembro debe ser un número entero',
            'number.positive': 'El ID del miembro debe ser positivo',
            'any.required': 'El ID del miembro es requerido'
        }),
    notes: Joi.string()
        .max(500)
        .allow(null, '')
        .optional()
        .messages({
            'string.max': 'Las notas no pueden exceder 500 caracteres'
        })
});

/**
 * Schema for query filters
 */
const attendanceFiltersSchema = Joi.object({
    assemblyId: Joi.number()
        .integer()
        .positive()
        .optional()
        .messages({
            'number.base': 'El ID de asamblea debe ser un número',
            'number.integer': 'El ID de asamblea debe ser un número entero',
            'number.positive': 'El ID de asamblea debe ser positivo'
        }),
    memberId: Joi.number()
        .integer()
        .positive()
        .optional()
        .messages({
            'number.base': 'El ID del miembro debe ser un número',
            'number.integer': 'El ID del miembro debe ser un número entero',
            'number.positive': 'El ID del miembro debe ser positivo'
        }),
    registrationMethod: Joi.string()
        .valid('qr_scan', 'manual')
        .optional()
        .messages({
            'any.only': 'El método de registro debe ser "qr_scan" o "manual"'
        }),
    registeredBy: Joi.number()
        .integer()
        .positive()
        .optional()
        .messages({
            'number.base': 'El ID de usuario debe ser un número',
            'number.integer': 'El ID de usuario debe ser un número entero',
            'number.positive': 'El ID de usuario debe ser positivo'
        }),
    fromDate: Joi.date()
        .iso()
        .optional()
        .messages({
            'date.base': 'La fecha desde debe ser una fecha válida',
            'date.format': 'La fecha desde debe estar en formato ISO 8601'
        }),
    toDate: Joi.date()
        .iso()
        .optional()
        .messages({
            'date.base': 'La fecha hasta debe ser una fecha válida',
            'date.format': 'La fecha hasta debe estar en formato ISO 8601'
        }),
    grade: Joi.string()
        .max(20)
        .optional()
        .messages({
            'string.max': 'El grado no puede exceder 20 caracteres'
        }),
    section: Joi.string()
        .max(20)
        .optional()
        .messages({
            'string.max': 'La sección no puede exceder 20 caracteres'
        }),
    page: Joi.number()
        .integer()
        .positive()
        .optional()
        .messages({
            'number.base': 'La página debe ser un número',
            'number.integer': 'La página debe ser un número entero',
            'number.positive': 'La página debe ser positiva'
        }),
    limit: Joi.number()
        .integer()
        .positive()
        .max(100)
        .optional()
        .messages({
            'number.base': 'El límite debe ser un número',
            'number.integer': 'El límite debe ser un número entero',
            'number.positive': 'El límite debe ser positivo',
            'number.max': 'El límite no puede exceder 100'
        })
}).custom((value, helpers) => {
    // Validate date range
    if (value.fromDate && value.toDate && value.fromDate > value.toDate) {
        return helpers.error('any.invalid', {
            message: 'La fecha desde debe ser anterior a la fecha hasta'
        });
    }
    return value;
});

module.exports = {
    registerByQrSchema,
    registerManuallySchema,
    attendanceFiltersSchema
};
