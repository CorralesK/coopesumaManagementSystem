-- ============================================================================
-- Script: 03_create_indexes.sql
-- Descripción: Crea todos los índices necesarios para optimizar las consultas
--              en las tablas de la Fase 1
-- Proyecto: CoopeSuma Management System - Phase 1
-- Base de datos: PostgreSQL 14+
-- Propósito: Mejorar el rendimiento de las consultas frecuentes
-- ============================================================================

-- ============================================================================
-- ÍNDICES PARA LA TABLA: users
-- Propósito: Optimizar búsquedas por username, role y estado activo
-- ============================================================================

-- Índice para búsqueda por username (usado en autenticación)
CREATE INDEX idx_users_username ON users(username);
COMMENT ON INDEX idx_users_username IS 'Optimiza búsquedas de usuarios por nombre de usuario';

-- Índice para filtrado por rol de usuario
CREATE INDEX idx_users_role ON users(role);
COMMENT ON INDEX idx_users_role IS 'Optimiza filtrado de usuarios por rol';

-- Índice para filtrado por estado activo
CREATE INDEX idx_users_is_active ON users(is_active);
COMMENT ON INDEX idx_users_is_active IS 'Optimiza filtrado de usuarios activos/inactivos';


-- ============================================================================
-- ÍNDICES PARA LA TABLA: members
-- Propósito: Optimizar búsquedas por identification, qr_hash, grade/section,
--            estado activo y nombre completo
-- ============================================================================

-- Índice para búsqueda por número de identificación
CREATE INDEX idx_members_identification ON members(identification);
COMMENT ON INDEX idx_members_identification IS 'Optimiza búsquedas de miembros por número de identificación';

-- Índice para búsqueda por hash QR (usado en escaneo de códigos QR)
CREATE INDEX idx_members_qr_hash ON members(qr_hash);
COMMENT ON INDEX idx_members_qr_hash IS 'Optimiza búsquedas de miembros por código QR';

-- Índice compuesto para búsqueda por grado y sección
CREATE INDEX idx_members_grade_section ON members(grade, section);
COMMENT ON INDEX idx_members_grade_section IS 'Optimiza filtrado de miembros por grado y sección';

-- Índice para filtrado por estado activo
CREATE INDEX idx_members_is_active ON members(is_active);
COMMENT ON INDEX idx_members_is_active IS 'Optimiza filtrado de miembros activos/inactivos';

-- Índice para búsqueda por nombre completo (útil para búsquedas y ordenamiento)
CREATE INDEX idx_members_full_name ON members(full_name);
COMMENT ON INDEX idx_members_full_name IS 'Optimiza búsquedas y ordenamiento por nombre de miembro';


-- ============================================================================
-- ÍNDICES PARA LA TABLA: assemblies
-- Propósito: Optimizar búsquedas por fecha, estado activo y usuario creador
--            Incluye índice único para garantizar una sola asamblea activa
-- ============================================================================

-- Índice para búsqueda y ordenamiento por fecha programada
CREATE INDEX idx_assemblies_scheduled_date ON assemblies(scheduled_date);
COMMENT ON INDEX idx_assemblies_scheduled_date IS 'Optimiza búsquedas y ordenamiento por fecha de asamblea';

-- Índice para filtrado por estado activo
CREATE INDEX idx_assemblies_is_active ON assemblies(is_active);
COMMENT ON INDEX idx_assemblies_is_active IS 'Optimiza búsquedas de asambleas activas';

-- Índice para filtrado por usuario creador
CREATE INDEX idx_assemblies_created_by ON assemblies(created_by);
COMMENT ON INDEX idx_assemblies_created_by IS 'Optimiza búsquedas de asambleas por usuario creador';

-- Índice único parcial: garantiza que solo una asamblea esté activa
-- Este índice solo incluye registros donde is_active = true
-- PostgreSQL no permitirá insertar/actualizar si viola esta restricción
CREATE UNIQUE INDEX idx_assemblies_single_active ON assemblies(is_active)
    WHERE is_active = true;
COMMENT ON INDEX idx_assemblies_single_active IS 'Garantiza que solo una asamblea pueda estar activa al mismo tiempo';


-- ============================================================================
-- ÍNDICES PARA LA TABLA: attendance_records
-- Propósito: Optimizar búsquedas por member_id, assembly_id, fecha de registro,
--            usuario registrador y método de registro
-- ============================================================================

-- Índice para búsqueda por ID de miembro (útil para historial de asistencia)
CREATE INDEX idx_attendance_member_id ON attendance_records(member_id);
COMMENT ON INDEX idx_attendance_member_id IS 'Optimiza búsquedas de registros de asistencia por miembro';

-- Índice para búsqueda por ID de asamblea (útil para lista de asistentes)
CREATE INDEX idx_attendance_assembly_id ON attendance_records(assembly_id);
COMMENT ON INDEX idx_attendance_assembly_id IS 'Optimiza búsquedas de registros de asistencia por asamblea';

-- Índice para ordenamiento por fecha de registro
CREATE INDEX idx_attendance_registered_at ON attendance_records(registered_at);
COMMENT ON INDEX idx_attendance_registered_at IS 'Optimiza ordenamiento por fecha de registro de asistencia';

-- Índice para filtrado por usuario que registró la asistencia
CREATE INDEX idx_attendance_registered_by ON attendance_records(registered_by);
COMMENT ON INDEX idx_attendance_registered_by IS 'Optimiza búsquedas de registros por usuario registrador';

-- Índice para filtrado por método de registro (qr_scan o manual)
CREATE INDEX idx_attendance_method ON attendance_records(registration_method);
COMMENT ON INDEX idx_attendance_method IS 'Optimiza filtrado por método de registro (QR o manual)';


-- ============================================================================
-- RESUMEN DE ÍNDICES CREADOS
-- ============================================================================
-- Tabla users: 3 índices
--   - idx_users_username (username)
--   - idx_users_role (role)
--   - idx_users_is_active (is_active)
--
-- Tabla members: 5 índices
--   - idx_members_identification (identification)
--   - idx_members_qr_hash (qr_hash)
--   - idx_members_grade_section (grade, section)
--   - idx_members_is_active (is_active)
--   - idx_members_full_name (full_name)
--
-- Tabla assemblies: 4 índices
--   - idx_assemblies_scheduled_date (scheduled_date)
--   - idx_assemblies_is_active (is_active)
--   - idx_assemblies_created_by (created_by)
--   - idx_assemblies_single_active (is_active WHERE is_active = true) [UNIQUE]
--
-- Tabla attendance_records: 5 índices
--   - idx_attendance_member_id (member_id)
--   - idx_attendance_assembly_id (assembly_id)
--   - idx_attendance_registered_at (registered_at)
--   - idx_attendance_registered_by (registered_by)
--   - idx_attendance_method (registration_method)
--
-- TOTAL: 17 índices
-- ============================================================================

-- ============================================================================
-- Fin del script 03_create_indexes.sql
-- ============================================================================