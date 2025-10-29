-- ============================================================================
-- Script: 02_create_tables.sql
-- Descripción: Creación de todas las tablas para Phase 1 - Control de Asistencia
-- Proyecto: CoopeSuma Management System
-- Fase: 1 - Control de Asistencia
-- Base de datos: PostgreSQL 14+
-- ============================================================================
--
-- INSTRUCCIONES DE USO:
-- psql -U postgres -d cooplinkcr -f 02_create_tables.sql
--
-- PREREQUISITOS:
-- - Ejecutar 01_create_functions.sql antes de este script
--
-- ============================================================================

-- ============================================================================
-- TABLA 1: schools
-- Descripción: Escuelas que utilizan el sistema
-- ============================================================================

CREATE TABLE schools (
    school_id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_school_name_not_empty CHECK (TRIM(name) != '')
);

COMMENT ON TABLE schools IS 'Escuelas que utilizan el sistema CoopLink';
COMMENT ON COLUMN schools.school_id IS 'ID único de la escuela (clave primaria)';
COMMENT ON COLUMN schools.name IS 'Nombre de la escuela';
COMMENT ON COLUMN schools.created_at IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN schools.updated_at IS 'Fecha y hora de última actualización del registro';

-- ============================================================================
-- TABLA 2: cooperatives
-- Descripción: Cooperativas estudiantiles asociadas a escuelas
-- ============================================================================

CREATE TABLE cooperatives (
    cooperative_id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(school_id) ON DELETE RESTRICT,
    trade_name VARCHAR(150) NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_trade_name_not_empty CHECK (TRIM(trade_name) != ''),
    CONSTRAINT chk_legal_name_not_empty CHECK (TRIM(legal_name) != '')
);

COMMENT ON TABLE cooperatives IS 'Cooperativas estudiantiles del sistema';
COMMENT ON COLUMN cooperatives.cooperative_id IS 'ID único de la cooperativa (clave primaria)';
COMMENT ON COLUMN cooperatives.school_id IS 'ID de la escuela a la que pertenece la cooperativa';
COMMENT ON COLUMN cooperatives.trade_name IS 'Nombre comercial/fantasía de la cooperativa (ej: Coopesuma R.L.)';
COMMENT ON COLUMN cooperatives.legal_name IS 'Nombre legal completo de la cooperativa';
COMMENT ON COLUMN cooperatives.created_at IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN cooperatives.updated_at IS 'Fecha y hora de última actualización del registro';

-- ============================================================================
-- TABLA 3: users
-- Descripción: Usuarios del sistema autenticados con Microsoft OAuth
-- Nota: NO incluye password_hash (autenticación solo con Microsoft)
-- ============================================================================

CREATE TABLE users (
    cooperative_id INTEGER NOT NULL REFERENCES cooperatives(cooperative_id) ON DELETE RESTRICT,
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    microsoft_id VARCHAR(255) UNIQUE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('administrator', 'registrar', 'treasurer', 'student')),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_full_name_not_empty CHECK (TRIM(full_name) != ''),
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

COMMENT ON TABLE users IS 'Usuarios del sistema autenticados con Microsoft OAuth';
COMMENT ON COLUMN users.cooperative_id IS 'ID de la cooperativa a la que pertenece el usuario';
COMMENT ON COLUMN users.user_id IS 'ID único del usuario (clave primaria)';
COMMENT ON COLUMN users.full_name IS 'Nombre completo del usuario';
COMMENT ON COLUMN users.email IS 'Email del usuario obtenido de Microsoft OAuth';
COMMENT ON COLUMN users.microsoft_id IS 'ID único del usuario en Microsoft Azure AD (oid) - NULL para usuarios estudiantes hasta que inicien sesión';
COMMENT ON COLUMN users.role IS 'Rol del usuario: administrator, registrar, treasurer o student';
COMMENT ON COLUMN users.is_active IS 'Indica si el usuario está activo (soft delete)';
COMMENT ON COLUMN users.created_at IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN users.updated_at IS 'Fecha y hora de última actualización del registro';

-- ============================================================================
-- TABLA 4: members
-- Descripción: Miembros estudiantiles de la cooperativa con QR único
-- ============================================================================

CREATE TABLE members (
    cooperative_id INTEGER NOT NULL REFERENCES cooperatives(cooperative_id) ON DELETE RESTRICT,
    member_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    identification VARCHAR(20) UNIQUE NOT NULL,
    grade VARCHAR(20) NOT NULL,
    institutional_email VARCHAR(255) UNIQUE,
    photo_url VARCHAR(255),
    qr_hash VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_full_name_not_empty CHECK (TRIM(full_name) != ''),
    CONSTRAINT chk_identification_format CHECK (identification ~ '^[0-9-]+$'),
    CONSTRAINT chk_grade_valid CHECK (grade ~ '^[1-6]$'),
    CONSTRAINT chk_institutional_email_format CHECK (
        institutional_email IS NULL OR
        institutional_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]*mep\.go\.cr$'
    ),
    CONSTRAINT chk_qr_hash_not_empty CHECK (TRIM(qr_hash) != '')
);

COMMENT ON TABLE members IS 'Miembros estudiantiles de la cooperativa CoopeSuma';
COMMENT ON COLUMN members.cooperative_id IS 'ID de la cooperativa a la que pertenece el miembro';
COMMENT ON COLUMN members.member_id IS 'ID único del miembro (clave primaria)';
COMMENT ON COLUMN members.full_name IS 'Nombre completo del estudiante';
COMMENT ON COLUMN members.identification IS 'Número de identificación del estudiante (cédula o pasaporte)';
COMMENT ON COLUMN members.grade IS 'Grado escolar del estudiante (1 a 6)';
COMMENT ON COLUMN members.institutional_email IS 'Correo institucional del estudiante (debe terminar en mep.go.cr) - usado para crear cuenta de usuario estudiante';
COMMENT ON COLUMN members.photo_url IS 'URL de la foto del estudiante (opcional)';
COMMENT ON COLUMN members.qr_hash IS 'Hash único para el código QR del estudiante';
COMMENT ON COLUMN members.is_active IS 'Indica si el miembro está activo (soft delete)';
COMMENT ON COLUMN members.created_at IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN members.updated_at IS 'Fecha y hora de última actualización del registro';

-- ============================================================================
-- TABLA 5: assemblies
-- Descripción: Asambleas de la cooperativa (solo una puede estar activa)
-- Regla de negocio crítica: Solo una asamblea puede tener is_active = true
-- ============================================================================

CREATE TABLE assemblies (
    cooperative_id INTEGER NOT NULL REFERENCES cooperatives(cooperative_id) ON DELETE RESTRICT,
    assembly_id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    scheduled_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_active BOOLEAN DEFAULT false NOT NULL,
    concluded_at TIMESTAMP,
    created_by INTEGER NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_title_not_empty CHECK (TRIM(title) != ''),
    CONSTRAINT chk_time_range CHECK (
        end_time IS NULL OR start_time IS NULL OR end_time > start_time
    )
);

COMMENT ON TABLE assemblies IS 'Asambleas de la cooperativa (solo una activa a la vez)';
COMMENT ON COLUMN assemblies.cooperative_id IS 'ID de la cooperativa a la que pertenece la asamblea';
COMMENT ON COLUMN assemblies.assembly_id IS 'ID único de la asamblea (clave primaria)';
COMMENT ON COLUMN assemblies.title IS 'Título de la asamblea';
COMMENT ON COLUMN assemblies.scheduled_date IS 'Fecha programada de la asamblea';
COMMENT ON COLUMN assemblies.start_time IS 'Hora real en que se inició la asamblea (seteada al activar)';
COMMENT ON COLUMN assemblies.end_time IS 'Hora real en que finalizó la asamblea (seteada al concluir)';
COMMENT ON COLUMN assemblies.is_active IS 'Indica si es la asamblea activa actual (solo una permitida)';
COMMENT ON COLUMN assemblies.concluded_at IS 'Fecha y hora en que la asamblea fue concluida (marcada como finalizada)';
COMMENT ON COLUMN assemblies.created_by IS 'ID del usuario que creó la asamblea';
COMMENT ON COLUMN assemblies.created_at IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN assemblies.updated_at IS 'Fecha y hora de última actualización del registro';

-- ============================================================================
-- TABLA 6: attendance_records
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
-- Próximo paso:
-- Ejecutar 03_create_indexes.sql
-- ============================================================================
