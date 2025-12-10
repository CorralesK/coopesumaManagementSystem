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
            'string.empty': 'QR code hash is required',
            'string.min': 'QR code hash must have at least 10 characters',
            'any.required': 'QR code hash is required'
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
            'number.base': 'Member ID must be a number',
            'number.integer': 'Member ID must be an integer',
            'number.positive': 'Member ID must be positive',
            'any.required': 'Member ID is required'
        }),
    notes: Joi.string()
        .max(500)
        .allow(null, '')
        .optional()
        .messages({
            'string.max': 'Notes cannot exceed 500 characters'
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
            'number.base': 'Assembly ID must be a number',
            'number.integer': 'Assembly ID must be an integer',
            'number.positive': 'Assembly ID must be positive'
        }),
    memberId: Joi.number()
        .integer()
        .positive()
        .optional()
        .messages({
            'number.base': 'Member ID must be a number',
            'number.integer': 'Member ID must be an integer',
            'number.positive': 'Member ID must be positive'
        }),
    registrationMethod: Joi.string()
        .valid('qr_scan', 'manual')
        .optional()
        .messages({
            'any.only': 'Registration method must be "qr_scan" or "manual"'
        }),
    registeredBy: Joi.number()
        .integer()
        .positive()
        .optional()
        .messages({
            'number.base': 'User ID must be a number',
            'number.integer': 'User ID must be an integer',
            'number.positive': 'User ID must be positive'
        }),
    fromDate: Joi.date()
        .iso()
        .optional()
        .messages({
            'date.base': 'From date must be a valid date',
            'date.format': 'From date must be in ISO 8601 format'
        }),
    toDate: Joi.date()
        .iso()
        .optional()
        .messages({
            'date.base': 'To date must be a valid date',
            'date.format': 'To date must be in ISO 8601 format'
        }),
    grade: Joi.string()
        .max(20)
        .optional()
        .messages({
            'string.max': 'Grade cannot exceed 20 characters'
        }),
    section: Joi.string()
        .max(20)
        .optional()
        .messages({
            'string.max': 'Section cannot exceed 20 characters'
        }),
    page: Joi.number()
        .integer()
        .positive()
        .optional()
        .messages({
            'number.base': 'Page must be a number',
            'number.integer': 'Page must be an integer',
            'number.positive': 'Page must be positive'
        }),
    limit: Joi.number()
        .integer()
        .positive()
        .max(100)
        .optional()
        .messages({
            'number.base': 'Limit must be a number',
            'number.integer': 'Limit must be an integer',
            'number.positive': 'Limit must be positive',
            'number.max': 'Limit cannot exceed 100'
        })
}).custom((value, helpers) => {
    // Validate date range
    if (value.fromDate && value.toDate && value.fromDate > value.toDate) {
        return helpers.error('any.invalid', {
            message: 'From date must be before to date'
        });
    }
    return value;
});

module.exports = {
    registerByQrSchema,
    registerManuallySchema,
    attendanceFiltersSchema
};
