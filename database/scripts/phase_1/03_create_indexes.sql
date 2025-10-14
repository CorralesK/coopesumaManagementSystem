-- ============================================================================
-- Script: 03_create_indexes.sql
-- Descripción: Creación de índices para optimización de consultas
-- Proyecto: CoopeSuma Management System
-- Fase: 1 - Control de Asistencia
-- Base de datos: PostgreSQL 14+
-- ============================================================================
--
-- INSTRUCCIONES DE USO:
-- psql -U postgres -d coopesuma_db -f 03_create_indexes.sql
--
-- PREREQUISITOS:
-- - Ejecutar 01_create_functions.sql
-- - Ejecutar 02_create_tables.sql
--
-- ============================================================================

-- ============================================================================
-- ÍNDICES PARA TABLA: users
-- ============================================================================

-- Índice para búsqueda por email (usado en login y verificación)
CREATE INDEX idx_users_email ON users(email);
COMMENT ON INDEX idx_users_email IS 'Optimiza búsquedas por email durante login';

-- Índice para búsqueda por Microsoft ID (usado en OAuth callback)
CREATE INDEX idx_users_microsoft_id ON users(microsoft_id);
COMMENT ON INDEX idx_users_microsoft_id IS 'Optimiza búsquedas por Microsoft ID durante autenticación OAuth';

-- Índice para filtrado por rol
CREATE INDEX idx_users_role ON users(role);
COMMENT ON INDEX idx_users_role IS 'Optimiza filtrado de usuarios por rol';

-- Índice para filtrado por estado activo
CREATE INDEX idx_users_is_active ON users(is_active);
COMMENT ON INDEX idx_users_is_active IS 'Optimiza filtrado de usuarios activos vs inactivos';

-- ============================================================================
-- ÍNDICES PARA TABLA: members
-- ============================================================================

-- Índice para búsqueda por número de identificación
CREATE INDEX idx_members_identification ON members(identification);
COMMENT ON INDEX idx_members_identification IS 'Optimiza búsquedas por número de identificación';

-- Índice para búsqueda por QR hash (usado en escaneo de asistencia)
CREATE INDEX idx_members_qr_hash ON members(qr_hash);
COMMENT ON INDEX idx_members_qr_hash IS 'Optimiza búsquedas por QR hash durante escaneo de asistencia';

-- Índice para filtrado por grado
CREATE INDEX idx_members_grade ON members(grade);
COMMENT ON INDEX idx_members_grade IS 'Optimiza filtrado de miembros por grado';

-- Índice para filtrado por estado activo
CREATE INDEX idx_members_is_active ON members(is_active);
COMMENT ON INDEX idx_members_is_active IS 'Optimiza filtrado de miembros activos vs inactivos';

-- Índice para búsqueda por nombre (usado en búsquedas de texto)
CREATE INDEX idx_members_full_name ON members(full_name);
COMMENT ON INDEX idx_members_full_name IS 'Optimiza búsquedas por nombre completo';

-- Índice para búsqueda por correo institucional
CREATE INDEX idx_members_institutional_email ON members(institutional_email)
    WHERE institutional_email IS NOT NULL;
COMMENT ON INDEX idx_members_institutional_email IS 'Optimiza búsquedas por correo institucional';

-- ============================================================================
-- ÍNDICES PARA TABLA: assemblies
-- ============================================================================

-- Índice para ordenamiento y filtrado por fecha
CREATE INDEX idx_assemblies_scheduled_date ON assemblies(scheduled_date);
COMMENT ON INDEX idx_assemblies_scheduled_date IS 'Optimiza ordenamiento y filtrado por fecha programada';

-- Índice para búsqueda de asamblea activa
CREATE INDEX idx_assemblies_is_active ON assemblies(is_active);
COMMENT ON INDEX idx_assemblies_is_active IS 'Optimiza búsqueda de asamblea activa';

-- Índice único parcial para garantizar solo una asamblea activa
-- Este índice también sirve como constraint a nivel de base de datos
CREATE UNIQUE INDEX idx_assemblies_single_active ON assemblies(is_active)
    WHERE is_active = true;
COMMENT ON INDEX idx_assemblies_single_active IS
'Garantiza que solo una asamblea pueda estar activa simultáneamente (constraint a nivel DB)';

-- Índice para filtrado por usuario creador
CREATE INDEX idx_assemblies_created_by ON assemblies(created_by);
COMMENT ON INDEX idx_assemblies_created_by IS 'Optimiza filtrado de asambleas por usuario creador';

-- ============================================================================
-- ÍNDICES PARA TABLA: attendance_records
-- ============================================================================

-- Índice para búsqueda de registros por miembro
CREATE INDEX idx_attendance_member_id ON attendance_records(member_id);
COMMENT ON INDEX idx_attendance_member_id IS 'Optimiza búsqueda de historial de asistencia por miembro';

-- Índice para búsqueda de registros por asamblea
CREATE INDEX idx_attendance_assembly_id ON attendance_records(assembly_id);
COMMENT ON INDEX idx_attendance_assembly_id IS 'Optimiza búsqueda de asistencia por asamblea';

-- Índice para ordenamiento por fecha de registro
CREATE INDEX idx_attendance_registered_at ON attendance_records(registered_at);
COMMENT ON INDEX idx_attendance_registered_at IS 'Optimiza ordenamiento por fecha de registro';

-- Índice para filtrado por usuario registrador
CREATE INDEX idx_attendance_registered_by ON attendance_records(registered_by);
COMMENT ON INDEX idx_attendance_registered_by IS 'Optimiza filtrado por usuario que registró la asistencia';

-- Índice para filtrado por método de registro
CREATE INDEX idx_attendance_method ON attendance_records(registration_method);
COMMENT ON INDEX idx_attendance_method IS 'Optimiza filtrado por método de registro (qr_scan vs manual)';

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
-- Próximo paso:
-- Ejecutar 04_create_triggers.sql
-- ============================================================================
