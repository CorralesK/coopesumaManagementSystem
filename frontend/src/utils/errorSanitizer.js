/**
 * Error Message Sanitizer
 *
 * Sanitizes error messages to prevent exposing internal system details
 * to end users. Replaces technical error messages with user-friendly ones.
 * Translates backend error messages from English to Spanish.
 *
 * @module utils/errorSanitizer
 */

import { translateError } from './errorTranslations';

/**
 * Technical keywords that indicate an error message contains sensitive information
 */
const TECHNICAL_KEYWORDS = [
    // Database-related
    'table', 'column', 'database', 'sql', 'query', 'constraint',
    'foreign key', 'primary key', 'unique key', 'index',
    'null', 'varchar', 'integer', 'timestamp', 'boolean',
    'insert', 'update', 'delete', 'select', 'where',
    'join', 'relation', 'schema', 'pg_', 'postgres',

    // System-related
    'stack trace', 'exception', 'error:', 'at line',
    'file:', 'function', 'module', 'require', 'import',
    'node_modules', '.js', '.ts', 'undefined is not',
    'cannot read property', 'is not a function',

    // Code-related
    'object', 'array', 'string', 'number', 'undefined',
    'null pointer', 'reference error', 'type error',
    'syntax error', 'parse error',

    // Server-related
    'server error', 'internal error', '500', 'localhost',
    'port', 'connection refused', 'econnrefused',
    'timeout', 'cors', 'middleware'
];

/**
 * Spanish technical keywords (case-insensitive)
 */
const SPANISH_TECHNICAL_KEYWORDS = [
    'tabla', 'columna', 'campo', 'registro', 'clave',
    'índice', 'relación', 'esquema', 'consulta'
];

/**
 * Patterns that indicate technical error messages
 */
const TECHNICAL_PATTERNS = [
    /\b[a-z_]+\.[a-z_]+\b/i, // table.column format
    /\b[a-z_]+_id\b/i, // column names ending in _id
    /\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN)\b/i, // SQL keywords
    /\bERROR\s*:\s*/i, // Error prefix
    /\bat\s+[a-zA-Z_]+\s*\(/i, // Stack trace format
    /\b\d{5}\b/, // PostgreSQL error codes
    /column\s+"[^"]+"\s+(cannot be null|does not exist)/i, // Column errors
    /relation\s+"[^"]+"\s+does not exist/i, // Table errors
    /violates\s+(foreign key|check|not-null|unique)\s+constraint/i, // Constraint violations
];

/**
 * Generic error messages for different error types
 */
const GENERIC_MESSAGES = {
    validation: 'Error de validación en los datos proporcionados',
    notFound: 'El recurso solicitado no fue encontrado',
    duplicate: 'Ya existe un registro con estos datos',
    reference: 'El registro referenciado no existe o no está disponible',
    required: 'Faltan datos requeridos para completar la operación',
    format: 'Los datos tienen un formato inválido',
    permission: 'No tiene permisos para realizar esta acción',
    server: 'Ha ocurrido un error en el servidor. Por favor, intente nuevamente',
    network: 'No se pudo conectar con el servidor',
    generic: 'Ha ocurrido un error. Por favor, intente nuevamente'
};

/**
 * Checks if a message contains technical information
 * @param {string} message - The error message to check
 * @returns {boolean} - True if message contains technical details
 */
const containsTechnicalInfo = (message) => {
    if (!message || typeof message !== 'string') {
        return false;
    }

    const lowerMessage = message.toLowerCase();

    // Check for technical keywords
    const hasTechnicalKeyword = TECHNICAL_KEYWORDS.some(keyword =>
        lowerMessage.includes(keyword.toLowerCase())
    );

    const hasSpanishTechnicalKeyword = SPANISH_TECHNICAL_KEYWORDS.some(keyword =>
        lowerMessage.includes(keyword.toLowerCase())
    );

    // Check for technical patterns
    const hasTechnicalPattern = TECHNICAL_PATTERNS.some(pattern =>
        pattern.test(message)
    );

    return hasTechnicalKeyword || hasSpanishTechnicalKeyword || hasTechnicalPattern;
};

/**
 * Determines the appropriate generic message based on error content
 * @param {string} message - The original error message
 * @param {number} statusCode - HTTP status code
 * @returns {string} - Appropriate generic message
 */
const getGenericMessage = (message, statusCode) => {
    if (!message) {
        return GENERIC_MESSAGES.generic;
    }

    const lowerMessage = message.toLowerCase();

    // Check status code first
    switch (statusCode) {
        case 404:
            return GENERIC_MESSAGES.notFound;
        case 403:
            return GENERIC_MESSAGES.permission;
        case 409:
            return GENERIC_MESSAGES.duplicate;
        case 0:
            return GENERIC_MESSAGES.network;
    }

    // Check message content for specific error types
    if (lowerMessage.includes('duplicate') || lowerMessage.includes('unique') ||
        lowerMessage.includes('duplicado') || lowerMessage.includes('ya existe')) {
        return GENERIC_MESSAGES.duplicate;
    }

    if (lowerMessage.includes('not found') || lowerMessage.includes('no encontrado')) {
        return GENERIC_MESSAGES.notFound;
    }

    if (lowerMessage.includes('foreign key') || lowerMessage.includes('reference') ||
        lowerMessage.includes('referenciado')) {
        return GENERIC_MESSAGES.reference;
    }

    if (lowerMessage.includes('not null') || lowerMessage.includes('required') ||
        lowerMessage.includes('requerido') || lowerMessage.includes('obligatorio')) {
        return GENERIC_MESSAGES.required;
    }

    if (lowerMessage.includes('invalid') || lowerMessage.includes('format') ||
        lowerMessage.includes('inválido') || lowerMessage.includes('formato')) {
        return GENERIC_MESSAGES.format;
    }

    if (lowerMessage.includes('validation') || lowerMessage.includes('validación')) {
        return GENERIC_MESSAGES.validation;
    }

    if (lowerMessage.includes('forbidden') || lowerMessage.includes('unauthorized') ||
        lowerMessage.includes('permission') || lowerMessage.includes('permiso')) {
        return GENERIC_MESSAGES.permission;
    }

    if (lowerMessage.includes('server') || lowerMessage.includes('internal') ||
        lowerMessage.includes('servidor')) {
        return GENERIC_MESSAGES.server;
    }

    if (lowerMessage.includes('network') || lowerMessage.includes('connection') ||
        lowerMessage.includes('conexión') || lowerMessage.includes('conectar')) {
        return GENERIC_MESSAGES.network;
    }

    // Default to server error for technical messages
    return statusCode >= 500 ? GENERIC_MESSAGES.server : GENERIC_MESSAGES.generic;
};

/**
 * Sanitizes an error message to remove technical details
 * @param {string} message - The error message to sanitize
 * @param {number} statusCode - HTTP status code (optional)
 * @returns {string} - Sanitized user-friendly message
 */
export const sanitizeErrorMessage = (message, statusCode = 500) => {
    // First, try to translate the message from English to Spanish
    const translatedMessage = translateError(message);

    // If translation was successful (not the default generic message), use it
    if (translatedMessage !== 'Ha ocurrido un error. Por favor, intente nuevamente') {
        return translatedMessage;
    }

    // If message is already safe (doesn't contain technical info), return it
    if (!containsTechnicalInfo(message)) {
        return message;
    }

    // Replace with appropriate generic message
    return getGenericMessage(message, statusCode);
};

/**
 * Sanitizes an error object
 * @param {Object} error - Error object with message, error code, and status
 * @returns {Object} - Sanitized error object
 */
export const sanitizeError = (error) => {
    if (!error) {
        return {
            message: GENERIC_MESSAGES.generic,
            error: 'UNKNOWN_ERROR',
            statusCode: 500
        };
    }

    const sanitizedMessage = sanitizeErrorMessage(
        error.message || error.toString(),
        error.statusCode || 500
    );

    return {
        message: sanitizedMessage,
        error: error.error || error.code || 'UNKNOWN_ERROR',
        statusCode: error.statusCode || 500
    };
};

/**
 * Checks if an error is safe to display to users
 * @param {string} message - Error message to check
 * @returns {boolean} - True if message is safe to display
 */
export const isErrorSafe = (message) => {
    return !containsTechnicalInfo(message);
};
