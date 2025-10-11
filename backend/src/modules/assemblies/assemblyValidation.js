/**
 * Assembly Validation Schemas
 * Input validation for assembly endpoints using Joi
 *
 * @module modules/assemblies/assemblyValidation
 */

const Joi = require('joi');

/**
 * Create assembly validation schema
 */
const createAssemblySchema = Joi.object({
    title: Joi.string()
        .trim()
        .min(3)
        .max(150)
        .required()
        .messages({
            'string.empty': 'El título es requerido',
            'string.min': 'El título debe tener al menos 3 caracteres',
            'string.max': 'El título no puede exceder 150 caracteres',
            'any.required': 'El título es requerido'
        }),

    description: Joi.string()
        .trim()
        .max(1000)
        .optional()
        .allow('', null)
        .messages({
            'string.max': 'La descripción no puede exceder 1000 caracteres'
        }),

    scheduledDate: Joi.date()
        .required()
        .messages({
            'date.base': 'La fecha programada debe ser una fecha válida',
            'any.required': 'La fecha programada es requerida'
        }),

    startTime: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .optional()
        .allow('', null)
        .messages({
            'string.pattern.base': 'La hora de inicio debe estar en formato HH:MM (24 horas)'
        }),

    endTime: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .optional()
        .allow('', null)
        .messages({
            'string.pattern.base': 'La hora de fin debe estar en formato HH:MM (24 horas)'
        }),

    isRecurring: Joi.boolean()
        .optional()
        .default(false)
        .messages({
            'boolean.base': 'isRecurring debe ser un valor booleano'
        }),

    recurrencePattern: Joi.string()
        .valid('none', 'weekly', 'monthly')
        .optional()
        .default('none')
        .messages({
            'any.only': 'El patrón de recurrencia debe ser: none, weekly o monthly'
        })
}).custom((value, helpers) => {
    // If isRecurring is true, recurrencePattern must not be 'none'
    if (value.isRecurring === true && value.recurrencePattern === 'none') {
        return helpers.error('custom.recurringPattern', {
            message: 'Si la asamblea es recurrente, debe especificar un patrón de recurrencia (weekly o monthly)'
        });
    }

    // If endTime is provided, it must be after startTime
    if (value.startTime && value.endTime && value.endTime <= value.startTime) {
        return helpers.error('custom.timeRange', {
            message: 'La hora de fin debe ser posterior a la hora de inicio'
        });
    }

    return value;
});

/**
 * Update assembly validation schema
 * All fields are optional for updates
 */
const updateAssemblySchema = Joi.object({
    title: Joi.string()
        .trim()
        .min(3)
        .max(150)
        .optional()
        .messages({
            'string.min': 'El título debe tener al menos 3 caracteres',
            'string.max': 'El título no puede exceder 150 caracteres'
        }),

    description: Joi.string()
        .trim()
        .max(1000)
        .optional()
        .allow('', null)
        .messages({
            'string.max': 'La descripción no puede exceder 1000 caracteres'
        }),

    scheduledDate: Joi.date()
        .optional()
        .messages({
            'date.base': 'La fecha programada debe ser una fecha válida'
        }),

    startTime: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .optional()
        .allow('', null)
        .messages({
            'string.pattern.base': 'La hora de inicio debe estar en formato HH:MM (24 horas)'
        }),

    endTime: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .optional()
        .allow('', null)
        .messages({
            'string.pattern.base': 'La hora de fin debe estar en formato HH:MM (24 horas)'
        }),

    isRecurring: Joi.boolean()
        .optional()
        .messages({
            'boolean.base': 'isRecurring debe ser un valor booleano'
        }),

    recurrencePattern: Joi.string()
        .valid('none', 'weekly', 'monthly')
        .optional()
        .messages({
            'any.only': 'El patrón de recurrencia debe ser: none, weekly o monthly'
        })
}).min(1).custom((value, helpers) => {
    // If isRecurring is true, recurrencePattern must not be 'none'
    if (value.isRecurring === true && value.recurrencePattern === 'none') {
        return helpers.error('custom.recurringPattern', {
            message: 'Si la asamblea es recurrente, debe especificar un patrón de recurrencia (weekly o monthly)'
        });
    }

    // If endTime is provided, it must be after startTime
    if (value.startTime && value.endTime && value.endTime <= value.startTime) {
        return helpers.error('custom.timeRange', {
            message: 'La hora de fin debe ser posterior a la hora de inicio'
        });
    }

    return value;
});

module.exports = {
    createAssemblySchema,
    updateAssemblySchema
};
