-- ============================================================================
-- Script: 02_create_tables.sql
-- Descripción: Creación de todas las tablas para Phase 1 - Control de Asistencia
-- Proyecto: CoopeSuma Management System
-- Fase: 1 - Control de Asistencia
-- Base de datos: PostgreSQL 14+
-- ============================================================================
--
-- INSTRUCCIONES DE USO:
-- psql -U postgres -d coopesuma_db -f 02_create_tables.sql
--
-- PREREQUISITOS:
-- - Ejecutar 01_create_functions.sql antes de este script
--
-- ============================================================================

-- ============================================================================
-- TABLA 1: users
-- Descripción: Usuarios del sistema autenticados con Microsoft OAuth
-- Nota: NO incluye password_hash (autenticación solo con Microsoft)
-- ============================================================================

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    microsoft_id VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('administrator', 'registrar', 'treasurer')),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_full_name_not_empty CHECK (TRIM(full_name) != ''),
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

COMMENT ON TABLE users IS 'Usuarios del sistema autenticados únicamente con Microsoft OAuth';
COMMENT ON COLUMN users.user_id IS 'ID único del usuario (clave primaria)';
COMMENT ON COLUMN users.full_name IS 'Nombre completo del usuario';
COMMENT ON COLUMN users.email IS 'Email del usuario obtenido de Microsoft OAuth';
COMMENT ON COLUMN users.microsoft_id IS 'ID único del usuario en Microsoft Azure AD (oid)';
COMMENT ON COLUMN users.role IS 'Rol del usuario: administrator, registrar o treasurer';
COMMENT ON COLUMN users.is_active IS 'Indica si el usuario está activo (soft delete)';
COMMENT ON COLUMN users.created_at IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN users.updated_at IS 'Fecha y hora de última actualización del registro';

-- ============================================================================
-- TABLA 2: members
-- Descripción: Miembros estudiantiles de la cooperativa con QR único
-- ============================================================================

CREATE TABLE members (
    member_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    identification VARCHAR(20) UNIQUE NOT NULL,
    grade VARCHAR(20) NOT NULL,
    section VARCHAR(10),
    photo_url VARCHAR(255),
    qr_hash VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_full_name_not_empty CHECK (TRIM(full_name) != ''),
    CONSTRAINT chk_identification_format CHECK (identification ~ '^[0-9-]+$'),
    CONSTRAINT chk_grade_valid CHECK (grade ~ '^[1-6]$'),
    CONSTRAINT chk_qr_hash_not_empty CHECK (TRIM(qr_hash) != '')
);

COMMENT ON TABLE members IS 'Miembros estudiantiles de la cooperativa CoopeSuma';
COMMENT ON COLUMN members.member_id IS 'ID único del miembro (clave primaria)';
COMMENT ON COLUMN members.full_name IS 'Nombre completo del estudiante';
COMMENT ON COLUMN members.identification IS 'Número de identificación del estudiante (cédula o pasaporte)';
COMMENT ON COLUMN members.grade IS 'Grado escolar del estudiante (1 a 6)';
COMMENT ON COLUMN members.section IS 'Sección del estudiante (A, B, C, etc.)';
COMMENT ON COLUMN members.photo_url IS 'URL de la foto del estudiante (opcional)';
COMMENT ON COLUMN members.qr_hash IS 'Hash único para el código QR del estudiante';
COMMENT ON COLUMN members.is_active IS 'Indica si el miembro está activo (soft delete)';
COMMENT ON COLUMN members.created_at IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN members.updated_at IS 'Fecha y hora de última actualización del registro';

-- ============================================================================
-- TABLA 3: assemblies
-- Descripción: Asambleas de la cooperativa (solo una puede estar activa)
-- Regla de negocio crítica: Solo una asamblea puede tener is_active = true
-- ============================================================================

CREATE TABLE assemblies (
    assembly_id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    scheduled_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT false NOT NULL,
    is_recurring BOOLEAN DEFAULT false NOT NULL,
    recurrence_pattern VARCHAR(20) DEFAULT 'none' NOT NULL
        CHECK (recurrence_pattern IN ('weekly', 'monthly', 'none')),
    created_by INTEGER NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_title_not_empty CHECK (TRIM(title) != ''),
    CONSTRAINT chk_time_range CHECK (
        end_time IS NULL OR start_time IS NULL OR end_time > start_time
    ),
    CONSTRAINT chk_recurring_pattern CHECK (
        (is_recurring = false AND recurrence_pattern = 'none') OR
        (is_recurring = true AND recurrence_pattern IN ('weekly', 'monthly'))
    )
);

COMMENT ON TABLE assemblies IS 'Asambleas de la cooperativa (solo una activa a la vez)';
COMMENT ON COLUMN assemblies.assembly_id IS 'ID único de la asamblea (clave primaria)';
COMMENT ON COLUMN assemblies.title IS 'Título de la asamblea';
COMMENT ON COLUMN assemblies.description IS 'Descripción detallada de la asamblea';
COMMENT ON COLUMN assemblies.scheduled_date IS 'Fecha programada de la asamblea';
COMMENT ON COLUMN assemblies.start_time IS 'Hora de inicio de la asamblea';
COMMENT ON COLUMN assemblies.end_time IS 'Hora de finalización de la asamblea';
COMMENT ON COLUMN assemblies.location IS 'Ubicación física de la asamblea';
COMMENT ON COLUMN assemblies.is_active IS 'Indica si es la asamblea activa actual (solo una permitida)';
COMMENT ON COLUMN assemblies.is_recurring IS 'Indica si la asamblea es recurrente';
COMMENT ON COLUMN assemblies.recurrence_pattern IS 'Patrón de recurrencia: weekly, monthly o none';
COMMENT ON COLUMN assemblies.created_by IS 'ID del usuario que creó la asamblea';
COMMENT ON COLUMN assemblies.created_at IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN assemblies.updated_at IS 'Fecha y hora de última actualización del registro';

-- ============================================================================
-- TABLA 4: attendance_records
-- Descripción: Registros de asistencia de miembros a asambleas
-- Regla de negocio: Un miembro solo puede registrar asistencia una vez por asamblea
-- ============================================================================

CREATE TABLE attendance_records (
    attendance_id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(member_id),
    assembly_id INTEGER NOT NULL REFERENCES assemblies(assembly_id),
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    registered_by INTEGER NOT NULL REFERENCES users(user_id),
    registration_method VARCHAR(20) DEFAULT 'qr_scan' NOT NULL
        CHECK (registration_method IN ('qr_scan', 'manual')),
    notes TEXT,

    CONSTRAINT unique_attendance UNIQUE (member_id, assembly_id)
);

COMMENT ON TABLE attendance_records IS 'Registros de asistencia de miembros a asambleas';
COMMENT ON COLUMN attendance_records.attendance_id IS 'ID único del registro de asistencia (clave primaria)';
COMMENT ON COLUMN attendance_records.member_id IS 'ID del miembro que asistió';
COMMENT ON COLUMN attendance_records.assembly_id IS 'ID de la asamblea a la que asistió';
COMMENT ON COLUMN attendance_records.registered_at IS 'Fecha y hora en que se registró la asistencia';
COMMENT ON COLUMN attendance_records.registered_by IS 'ID del usuario que registró la asistencia';
COMMENT ON COLUMN attendance_records.registration_method IS 'Método de registro: qr_scan o manual';
COMMENT ON COLUMN attendance_records.notes IS 'Notas adicionales sobre el registro (opcional)';
COMMENT ON CONSTRAINT unique_attendance ON attendance_records IS
'Un miembro solo puede registrar asistencia una vez por asamblea';

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
-- Resumen:
-- - 4 tablas creadas exitosamente:
--   1. users (usuarios del sistema)
--   2. members (miembros de la cooperativa)
--   3. assemblies (asambleas)
--   4. attendance_records (registros de asistencia)
--
-- Próximo paso:
-- Ejecutar 03_create_indexes.sql
-- ============================================================================
