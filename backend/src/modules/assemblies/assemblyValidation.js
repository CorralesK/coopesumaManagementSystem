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
            'string.empty': 'Title is required',
            'string.min': 'Title must have at least 3 characters',
            'string.max': 'Title cannot exceed 150 characters',
            'any.required': 'Title is required'
        }),

    scheduledDate: Joi.date()
        .required()
        .messages({
            'date.base': 'Scheduled date must be a valid date',
            'any.required': 'Scheduled date is required'
        }),

    startTime: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .optional()
        .allow('', null)
        .messages({
            'string.pattern.base': 'Start time must be in HH:MM format (24 hours)'
        }),

    endTime: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .optional()
        .allow('', null)
        .messages({
            'string.pattern.base': 'End time must be in HH:MM format (24 hours)'
        })
}).custom((value, helpers) => {
    // If endTime is provided, it must be after startTime
    if (value.startTime && value.endTime && value.endTime <= value.startTime) {
        return helpers.error('custom.timeRange', {
            message: 'End time must be after start time'
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
            'string.min': 'Title must have at least 3 characters',
            'string.max': 'Title cannot exceed 150 characters'
        }),

    scheduledDate: Joi.date()
        .optional()
        .messages({
            'date.base': 'Scheduled date must be a valid date'
        }),

    startTime: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .optional()
        .allow('', null)
        .messages({
            'string.pattern.base': 'Start time must be in HH:MM format (24 hours)'
        }),

    endTime: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .optional()
        .allow('', null)
        .messages({
            'string.pattern.base': 'End time must be in HH:MM format (24 hours)'
        })
}).min(1).custom((value, helpers) => {
    // If endTime is provided, it must be after startTime
    if (value.startTime && value.endTime && value.endTime <= value.startTime) {
        return helpers.error('custom.timeRange', {
            message: 'End time must be after start time'
        });
    }

    return value;
});

module.exports = {
    createAssemblySchema,
    updateAssemblySchema
};
