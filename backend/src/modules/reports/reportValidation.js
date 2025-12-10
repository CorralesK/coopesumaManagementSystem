/**
 * Report Validation Schemas
 * Joi validation schemas for report endpoints
 *
 * @module modules/reports/reportValidation
 */

const Joi = require('joi');

/**
 * Schema for assembly ID parameter validation
 */
const assemblyIdParamSchema = Joi.object({
    assemblyId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'Assembly ID must be a number',
            'number.integer': 'Assembly ID must be an integer',
            'number.positive': 'Assembly ID must be positive',
            'any.required': 'Assembly ID is required'
        })
});

/**
 * Schema for attendance report query parameters
 */
const attendanceReportQuerySchema = Joi.object({
    includePhotos: Joi.string()
        .valid('true', 'false')
        .optional()
        .default('false')
        .messages({
            'any.only': 'includePhotos must be "true" or "false"'
        })
});

module.exports = {
    assemblyIdParamSchema,
    attendanceReportQuerySchema
};
