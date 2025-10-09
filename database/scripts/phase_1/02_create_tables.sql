-- ============================================================================
-- Script: 02_create_tables.sql
-- Descripción: Crea todas las tablas necesarias para la Fase 1 del sistema
--              (Control de Asistencia)
-- Proyecto: CoopeSuma Management System - Phase 1
-- Base de datos: PostgreSQL 14+
-- Orden: users -> members -> assemblies -> attendance_records
-- ============================================================================

-- ============================================================================
-- TABLA: users
-- Descripción: Almacena los usuarios del sistema (administradores,
--              registradores y tesoreros)
-- Reglas de negocio:
--   - Username debe ser único
--   - Solo un rol por usuario
--   - Las contraseñas deben ser hasheadas con bcrypt (mínimo 10 rounds)
--   - Los usuarios inactivos no pueden iniciar sesión pero se preservan
--     sus datos históricos
-- ============================================================================
CREATE TABLE users (
    -- Identificador único del usuario (clave primaria autoincremental)
    user_id SERIAL PRIMARY KEY,

    -- Nombre completo del usuario
    full_name VARCHAR(100) NOT NULL,

    -- Nombre de usuario único para inicio de sesión
    username VARCHAR(50) UNIQUE NOT NULL,

    -- Hash de la contraseña (bcrypt)
    password_hash VARCHAR(255) NOT NULL,

    -- Rol del usuario en el sistema
    role VARCHAR(20) NOT NULL CHECK (role IN ('administrator', 'registrar', 'treasurer')),

    -- Indica si el usuario está activo (soft delete)
    is_active BOOLEAN DEFAULT true NOT NULL,

    -- Fecha y hora de creación del registro
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- Fecha y hora de última actualización del registro
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- Constraint: Validar formato del username (solo letras minúsculas, números, puntos, guiones y guión bajo)
    CONSTRAINT chk_username_format CHECK (username ~ '^[a-z0-9._-]{3,50}$'),

    -- Constraint: El nombre completo no puede estar vacío o ser solo espacios
    CONSTRAINT chk_full_name_not_empty CHECK (TRIM(full_name) != '')
);

-- Comentario descriptivo de la tabla
COMMENT ON TABLE users IS 'Usuarios del sistema con roles de administrador, registrador o tesorero';
COMMENT ON COLUMN users.user_id IS 'Identificador único del usuario';
COMMENT ON COLUMN users.full_name IS 'Nombre completo del usuario';
COMMENT ON COLUMN users.username IS 'Nombre de usuario único para inicio de sesión';
COMMENT ON COLUMN users.password_hash IS 'Contraseña hasheada con bcrypt';
COMMENT ON COLUMN users.role IS 'Rol del usuario: administrator, registrar o treasurer';
COMMENT ON COLUMN users.is_active IS 'Indica si el usuario está activo en el sistema';


-- ============================================================================
-- TABLA: members
-- Descripción: Almacena los miembros estudiantiles de la cooperativa
-- Reglas de negocio:
--   - El número de identificación debe ser único
--   - El hash QR debe ser único y generarse automáticamente
--   - La foto es opcional pero recomendada
--   - Formato de grado: "1", "2", "3", "4", "5", "6"
--   - Formato de sección: "A", "B", "C", etc.
-- ============================================================================
CREATE TABLE members (
    -- Identificador único del miembro (clave primaria autoincremental)
    member_id SERIAL PRIMARY KEY,

    -- Nombre completo del miembro
    full_name VARCHAR(100) NOT NULL,

    -- Número de identificación único del estudiante
    identification VARCHAR(20) UNIQUE NOT NULL,

    -- Grado escolar del estudiante (1 a 6)
    grade VARCHAR(20) NOT NULL,

    -- Sección del estudiante (A, B, C, etc.)
    section VARCHAR(10),

    -- URL de la foto del miembro (opcional)
    photo_url VARCHAR(255),

    -- Hash único del código QR del miembro
    qr_hash VARCHAR(255) UNIQUE NOT NULL,

    -- Indica si el miembro está activo (soft delete)
    is_active BOOLEAN DEFAULT true NOT NULL,

    -- Fecha y hora de creación del registro
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- Fecha y hora de última actualización del registro
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- Constraint: El nombre completo no puede estar vacío
    CONSTRAINT chk_full_name_not_empty CHECK (TRIM(full_name) != ''),

    -- Constraint: La identificación debe contener solo números y guiones
    CONSTRAINT chk_identification_format CHECK (identification ~ '^[0-9-]+$'),

    -- Constraint: El grado debe ser un número entre 1 y 6
    CONSTRAINT chk_grade_valid CHECK (grade ~ '^[1-6]$'),

    -- Constraint: El hash QR no puede estar vacío
    CONSTRAINT chk_qr_hash_not_empty CHECK (TRIM(qr_hash) != '')
);

-- Comentarios descriptivos de la tabla
COMMENT ON TABLE members IS 'Miembros estudiantiles de la cooperativa';
COMMENT ON COLUMN members.member_id IS 'Identificador único del miembro';
COMMENT ON COLUMN members.full_name IS 'Nombre completo del estudiante';
COMMENT ON COLUMN members.identification IS 'Número de identificación único del estudiante';
COMMENT ON COLUMN members.grade IS 'Grado escolar (1 a 6)';
COMMENT ON COLUMN members.section IS 'Sección del estudiante (A, B, C, etc.)';
COMMENT ON COLUMN members.photo_url IS 'URL de la fotografía del estudiante';
COMMENT ON COLUMN members.qr_hash IS 'Hash único para el código QR del estudiante';
COMMENT ON COLUMN members.is_active IS 'Indica si el miembro está activo en la cooperativa';


-- ============================================================================
-- TABLA: assemblies
-- Descripción: Almacena información de las asambleas de la cooperativa
-- Reglas de negocio:
--   - Solo UNA asamblea puede estar activa en un momento dado
--   - scheduled_date debe estar en el futuro al crear
--   - Las asambleas recurrentes pueden ser 'weekly', 'monthly' o 'none'
--   - Cuando se activa una asamblea, todas las demás deben desactivarse
-- ============================================================================
CREATE TABLE assemblies (
    -- Identificador único de la asamblea (clave primaria autoincremental)
    assembly_id SERIAL PRIMARY KEY,

    -- Título de la asamblea
    title VARCHAR(150) NOT NULL,

    -- Descripción detallada de la asamblea
    description TEXT,

    -- Fecha programada de la asamblea
    scheduled_date DATE NOT NULL,

    -- Hora de inicio de la asamblea (opcional)
    start_time TIME,

    -- Hora de finalización de la asamblea (opcional)
    end_time TIME,

    -- Indica si esta es la asamblea activa actualmente (solo una puede estar activa)
    is_active BOOLEAN DEFAULT false NOT NULL,

    -- Indica si la asamblea es recurrente
    is_recurring BOOLEAN DEFAULT false NOT NULL,

    -- Patrón de recurrencia de la asamblea
    recurrence_pattern VARCHAR(20) DEFAULT 'none' NOT NULL
        CHECK (recurrence_pattern IN ('weekly', 'monthly', 'none')),

    -- Usuario que creó la asamblea (clave foránea a users)
    created_by INTEGER NOT NULL REFERENCES users(user_id),

    -- Fecha y hora de creación del registro
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- Fecha y hora de última actualización del registro
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- Constraint: El título no puede estar vacío
    CONSTRAINT chk_title_not_empty CHECK (TRIM(title) != ''),

    -- Constraint: La hora de fin debe ser posterior a la hora de inicio
    CONSTRAINT chk_time_range CHECK (
        end_time IS NULL OR
        start_time IS NULL OR
        end_time > start_time
    ),

    -- Constraint: Si es recurrente, debe tener un patrón válido
    CONSTRAINT chk_recurring_pattern CHECK (
        (is_recurring = false AND recurrence_pattern = 'none') OR
        (is_recurring = true AND recurrence_pattern IN ('weekly', 'monthly'))
    )
);

-- Comentarios descriptivos de la tabla
COMMENT ON TABLE assemblies IS 'Asambleas de la cooperativa estudiantil';
COMMENT ON COLUMN assemblies.assembly_id IS 'Identificador único de la asamblea';
COMMENT ON COLUMN assemblies.title IS 'Título de la asamblea';
COMMENT ON COLUMN assemblies.description IS 'Descripción detallada de la asamblea';
COMMENT ON COLUMN assemblies.scheduled_date IS 'Fecha programada de la asamblea';
COMMENT ON COLUMN assemblies.start_time IS 'Hora de inicio de la asamblea';
COMMENT ON COLUMN assemblies.end_time IS 'Hora de finalización de la asamblea';
COMMENT ON COLUMN assemblies.is_active IS 'Indica si esta es la asamblea activa actualmente (solo una)';
COMMENT ON COLUMN assemblies.is_recurring IS 'Indica si la asamblea es recurrente';
COMMENT ON COLUMN assemblies.recurrence_pattern IS 'Patrón de recurrencia: weekly, monthly, o none';
COMMENT ON COLUMN assemblies.created_by IS 'Usuario que creó la asamblea';


-- ============================================================================
-- TABLA: attendance_records
-- Descripción: Almacena los registros de asistencia a las asambleas
-- Reglas de negocio:
--   - Un miembro solo puede registrarse una vez por asamblea
--   - Debe referenciar un miembro y una asamblea existentes
--   - Método de registro: 'qr_scan' o 'manual'
--   - Los registros manuales deben tener un usuario registrador
--   - Los escaneos QR también se rastrean por el usuario que realizó el escaneo
-- ============================================================================
CREATE TABLE attendance_records (
    -- Identificador único del registro de asistencia (clave primaria autoincremental)
    attendance_id SERIAL PRIMARY KEY,

    -- ID del miembro que asiste (clave foránea a members)
    member_id INTEGER NOT NULL REFERENCES members(member_id),

    -- ID de la asamblea a la que asiste (clave foránea a assemblies)
    assembly_id INTEGER NOT NULL REFERENCES assemblies(assembly_id),

    -- Fecha y hora en que se registró la asistencia
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- Usuario que registró la asistencia (clave foránea a users)
    registered_by INTEGER NOT NULL REFERENCES users(user_id),

    -- Método de registro: escaneo QR o manual
    registration_method VARCHAR(20) DEFAULT 'qr_scan' NOT NULL
        CHECK (registration_method IN ('qr_scan', 'manual')),

    -- Notas adicionales sobre el registro de asistencia (opcional)
    notes TEXT,

    -- Constraint: Un miembro solo puede registrar asistencia una vez por asamblea
    CONSTRAINT unique_attendance UNIQUE (member_id, assembly_id)
);

-- Comentarios descriptivos de la tabla
COMMENT ON TABLE attendance_records IS 'Registros de asistencia de miembros a las asambleas';
COMMENT ON COLUMN attendance_records.attendance_id IS 'Identificador único del registro de asistencia';
COMMENT ON COLUMN attendance_records.member_id IS 'ID del miembro que asiste';
COMMENT ON COLUMN attendance_records.assembly_id IS 'ID de la asamblea';
COMMENT ON COLUMN attendance_records.registered_at IS 'Fecha y hora del registro de asistencia';
COMMENT ON COLUMN attendance_records.registered_by IS 'Usuario que registró la asistencia';
COMMENT ON COLUMN attendance_records.registration_method IS 'Método de registro: qr_scan o manual';
COMMENT ON COLUMN attendance_records.notes IS 'Notas adicionales sobre el registro';


-- ============================================================================
-- Fin del script 02_create_tables.sql
-- ============================================================================