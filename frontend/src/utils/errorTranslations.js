/**
 * @file errorTranslations.js
 * @description Translation map for backend error messages (English to Spanish)
 * @module utils/errorTranslations
 */

/**
 * Error message translations from English (backend) to Spanish (user-facing)
 */
export const ERROR_TRANSLATIONS = {
    // Authentication
    'Login successful': 'Inicio de sesión exitoso',
    'Invalid credentials': 'Credenciales inválidas',
    'Logout successful': 'Sesión cerrada exitosamente',
    'Session expired': 'Su sesión ha expirado. Por favor, inicie sesión nuevamente',
    'Unauthorized': 'No autorizado. Por favor, inicie sesión',
    'Forbidden': 'No tiene permisos para realizar esta acción',

    // Users
    'User created successfully': 'Usuario creado exitosamente',
    'User updated successfully': 'Usuario actualizado exitosamente',
    'User deleted successfully': 'Usuario eliminado exitosamente',
    'User not found': 'Usuario no encontrado',
    'User already exists': 'El usuario ya existe',
    'User is inactive': 'El usuario está inactivo',

    // Members
    'Member created successfully': 'Miembro afiliado exitosamente',
    'Member updated successfully': 'Miembro actualizado exitosamente',
    'Member deleted successfully': 'Miembro desactivado exitosamente',
    'Member not found': 'Miembro no encontrado',
    'Member with this identification already exists': 'Ya existe un miembro con esta identificación',
    'Member is inactive': 'El miembro está inactivo',
    'Member code already exists': 'El código de miembro ya existe. Por favor, intente nuevamente',
    'QR code generated successfully': 'Código QR generado exitosamente',
    'Invalid QR code': 'Código QR inválido',

    // Assemblies
    'Assembly created successfully': 'Asamblea creada exitosamente',
    'Assembly updated successfully': 'Asamblea actualizada exitosamente',
    'Assembly deleted successfully': 'Asamblea eliminada exitosamente',
    'Assembly activated successfully': 'Asamblea activada exitosamente',
    'Assembly deactivated successfully': 'Asamblea desactivada exitosamente',
    'Assembly not found': 'Asamblea no encontrada',
    'No active assembly': 'No hay ninguna asamblea activa en este momento',
    'Assembly already active': 'Ya existe una asamblea activa',

    // Attendance
    'Attendance registered successfully': 'Asistencia registrada exitosamente',
    'Attendance already registered': 'La asistencia ya fue registrada para este miembro',
    'Attendance record not found': 'Registro de asistencia no encontrado',
    'Manual attendance registered successfully': 'Asistencia manual registrada exitosamente',

    // Reports
    'Report generated successfully': 'Reporte generado exitosamente',
    'Report generation failed': 'Error al generar el reporte',

    // Validation
    'Validation error': 'Error de validación en los datos enviados',
    'Invalid input': 'Los datos enviados son inválidos',
    'Required field': 'Este campo es requerido',
    'Invalid institutional email': 'El correo institucional no es válido',
    'Email already registered': 'El correo institucional ya está registrado en el sistema',
    'Students require an educational level': 'Los estudiantes requieren un nivel educativo (grado)',

    // General
    'Operation successful': 'Operación realizada exitosamente',
    'An error occurred': 'Ha ocurrido un error. Por favor, intente nuevamente',
    'Resource not found': 'Recurso no encontrado',
    'Bad request': 'Solicitud incorrecta',
    'Internal server error': 'Error interno del servidor. Por favor, intente nuevamente más tarde'
};

/**
 * Translates an error message from English to Spanish
 * @param {string} message - Error message in English
 * @returns {string} Translated message in Spanish
 */
export const translateError = (message) => {
    if (!message) {
        return 'Ha ocurrido un error inesperado';
    }

    // Check for exact match
    if (ERROR_TRANSLATIONS[message]) {
        return ERROR_TRANSLATIONS[message];
    }

    // Check for partial matches (in case of dynamic messages)
    const partialMatches = Object.keys(ERROR_TRANSLATIONS).filter(key =>
        message.includes(key) || key.includes(message)
    );

    if (partialMatches.length > 0) {
        return ERROR_TRANSLATIONS[partialMatches[0]];
    }

    // If no translation found, return a generic error message
    // This prevents showing technical English errors to users
    return 'Ha ocurrido un error. Por favor, intente nuevamente';
};

/**
 * Formats an error for display to the user
 * @param {Error|Object} error - Error object from API or caught exception
 * @returns {string} User-friendly error message in Spanish
 */
export const formatErrorForUser = (error) => {
    // Handle API error responses
    if (error.response?.data?.message) {
        return translateError(error.response.data.message);
    }

    // Handle error objects with message property
    if (error.message) {
        return translateError(error.message);
    }

    // Handle string errors
    if (typeof error === 'string') {
        return translateError(error);
    }

    // Fallback for unknown error formats
    return 'Ha ocurrido un error inesperado. Por favor, intente nuevamente';
};

export default {
    ERROR_TRANSLATIONS,
    translateError,
    formatErrorForUser
};