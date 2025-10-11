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
            'number.base': 'El ID de asamblea debe ser un número',
            'number.integer': 'El ID de asamblea debe ser un número entero',
            'number.positive': 'El ID de asamblea debe ser positivo',
            'any.required': 'El ID de asamblea es requerido'
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
            'any.only': 'includePhotos debe ser "true" o "false"'
        })
});

module.exports = {
    assemblyIdParamSchema,
    attendanceReportQuerySchema
};
