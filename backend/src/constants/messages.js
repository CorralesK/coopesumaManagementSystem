/**
 * User-facing Messages (Spanish)
 * All messages shown to end users must be in Spanish
 */

const MESSAGES = {
    // Authentication
    LOGIN_SUCCESS: 'Inicio de sesión exitoso',
    LOGIN_FAILED: 'Credenciales inválidas',
    LOGOUT_SUCCESS: 'Sesión cerrada exitosamente',
    TOKEN_EXPIRED: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente',
    UNAUTHORIZED: 'No autorizado. Por favor, inicie sesión',
    FORBIDDEN: 'No tiene permisos para realizar esta acción',

    // Users
    USER_CREATED: 'Usuario creado exitosamente',
    USER_UPDATED: 'Usuario actualizado exitosamente',
    USER_DELETED: 'Usuario eliminado exitosamente',
    USER_NOT_FOUND: 'Usuario no encontrado',
    USER_ALREADY_EXISTS: 'El nombre de usuario ya existe',
    USER_INACTIVE: 'El usuario está inactivo',

    // Members
    MEMBER_CREATED: 'Miembro creado exitosamente',
    MEMBER_UPDATED: 'Miembro actualizado exitosamente',
    MEMBER_DELETED: 'Miembro eliminado exitosamente',
    MEMBER_NOT_FOUND: 'Miembro no encontrado',
    MEMBER_ALREADY_EXISTS: 'Ya existe un miembro con esta identificación',
    MEMBER_INACTIVE: 'El miembro está inactivo',
    QR_GENERATED: 'Código QR generado exitosamente',
    INVALID_QR: 'Código QR inválido',

    // Assemblies
    ASSEMBLY_CREATED: 'Asamblea creada exitosamente',
    ASSEMBLY_UPDATED: 'Asamblea actualizada exitosamente',
    ASSEMBLY_DELETED: 'Asamblea eliminada exitosamente',
    ASSEMBLY_ACTIVATED: 'Asamblea activada exitosamente',
    ASSEMBLY_DEACTIVATED: 'Asamblea desactivada exitosamente',
    ASSEMBLY_NOT_FOUND: 'Asamblea no encontrada',
    NO_ACTIVE_ASSEMBLY: 'No hay ninguna asamblea activa en este momento',
    ASSEMBLY_ALREADY_ACTIVE: 'Ya existe una asamblea activa',

    // Attendance
    ATTENDANCE_REGISTERED: 'Asistencia registrada exitosamente',
    ATTENDANCE_ALREADY_REGISTERED: 'La asistencia ya fue registrada para este miembro',
    ATTENDANCE_NOT_FOUND: 'Registro de asistencia no encontrado',
    MANUAL_ATTENDANCE_REGISTERED: 'Asistencia manual registrada exitosamente',

    // Reports
    REPORT_GENERATED: 'Reporte generado exitosamente',
    REPORT_FAILED: 'Error al generar el reporte',

    // Validation
    VALIDATION_ERROR: 'Error de validación en los datos enviados',
    INVALID_INPUT: 'Los datos enviados son inválidos',
    REQUIRED_FIELD: 'Este campo es requerido',

    // General
    SUCCESS: 'Operación realizada exitosamente',
    ERROR: 'Ha ocurrido un error. Por favor, intente nuevamente',
    NOT_FOUND: 'Recurso no encontrado',
    BAD_REQUEST: 'Solicitud incorrecta',
    INTERNAL_ERROR: 'Error interno del servidor'
};

module.exports = MESSAGES;