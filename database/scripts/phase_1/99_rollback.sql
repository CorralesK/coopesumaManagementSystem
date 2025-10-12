-- ============================================================================
-- Script: 99_rollback.sql
-- Descripción: Rollback completo de Phase 1 - Elimina toda la estructura
-- Proyecto: CoopeSuma Management System
-- Fase: 1 - Control de Asistencia
-- Base de datos: PostgreSQL 14+
-- ============================================================================
--
-- INSTRUCCIONES DE USO:
-- psql -U postgres -d coopesuma_db -f 99_rollback.sql
--
-- ⚠️  ADVERTENCIA ⚠️
-- Este script elimina TODA la estructura de la base de datos de Phase 1,
-- incluyendo TODOS LOS DATOS. Esta acción es IRREVERSIBLE.
--
-- Solo ejecutar en las siguientes situaciones:
-- 1. Ambiente de desarrollo local
-- 2. Ambiente de testing que necesita reiniciarse
-- 3. Cuando se necesita recrear la estructura desde cero
--
-- ❌ NUNCA ejecutar en producción sin un backup completo
--
-- ============================================================================

-- Confirmación
\echo '⚠️  ADVERTENCIA: Este script eliminará TODA la estructura de Phase 1'
\echo 'Incluyendo todas las tablas, funciones, triggers, índices y DATOS'
\echo ''
\echo 'Presiona Ctrl+C para cancelar o Enter para continuar...'
\prompt 'Escribe YES para confirmar: ' confirmation

-- ============================================================================
-- PASO 1: Eliminar triggers
-- ============================================================================

\echo '🗑️  Eliminando triggers...'

DROP TRIGGER IF EXISTS ensure_single_active_assembly ON assemblies;
DROP TRIGGER IF EXISTS update_assemblies_updated_at ON assemblies;
DROP TRIGGER IF EXISTS update_members_updated_at ON members;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

\echo '✅ Triggers eliminados'

-- ============================================================================
-- PASO 2: Eliminar índices
-- ============================================================================

\echo '🗑️  Eliminando índices...'

-- Índices de attendance_records
DROP INDEX IF EXISTS idx_attendance_method;
DROP INDEX IF EXISTS idx_attendance_registered_by;
DROP INDEX IF EXISTS idx_attendance_registered_at;
DROP INDEX IF EXISTS idx_attendance_assembly_id;
DROP INDEX IF EXISTS idx_attendance_member_id;

-- Índices de assemblies
DROP INDEX IF EXISTS idx_assemblies_created_by;
DROP INDEX IF EXISTS idx_assemblies_single_active;
DROP INDEX IF EXISTS idx_assemblies_is_active;
DROP INDEX IF EXISTS idx_assemblies_scheduled_date;

-- Índices de members
DROP INDEX IF EXISTS idx_members_full_name;
DROP INDEX IF EXISTS idx_members_is_active;
DROP INDEX IF EXISTS idx_members_grade_section;
DROP INDEX IF EXISTS idx_members_qr_hash;
DROP INDEX IF EXISTS idx_members_identification;

-- Índices de users
DROP INDEX IF EXISTS idx_users_is_active;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_microsoft_id;
DROP INDEX IF EXISTS idx_users_email;

\echo '✅ Índices eliminados'

-- ============================================================================
-- PASO 3: Eliminar tablas (en orden inverso por dependencias)
-- ============================================================================

\echo '🗑️  Eliminando tablas...'

-- Eliminar attendance_records primero (tiene foreign keys a members, assemblies, users)
DROP TABLE IF EXISTS attendance_records CASCADE;
\echo '  ✓ attendance_records eliminada'

-- Eliminar assemblies (tiene foreign key a users)
DROP TABLE IF EXISTS assemblies CASCADE;
\echo '  ✓ assemblies eliminada'

-- Eliminar members (sin foreign keys)
DROP TABLE IF EXISTS members CASCADE;
\echo '  ✓ members eliminada'

-- Eliminar users (base, sin foreign keys a otras tablas de negocio)
DROP TABLE IF EXISTS users CASCADE;
\echo '  ✓ users eliminada'

\echo '✅ Todas las tablas eliminadas'

-- ============================================================================
-- PASO 4: Eliminar funciones
-- ============================================================================

\echo '🗑️  Eliminando funciones...'

DROP FUNCTION IF EXISTS deactivate_other_assemblies() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

\echo '✅ Funciones eliminadas'

-- ============================================================================
-- FIN DEL ROLLBACK
-- ============================================================================

\echo ''
\echo '======================================================================'
\echo '✅ ROLLBACK COMPLETADO EXITOSAMENTE'
\echo '======================================================================'
\echo ''
\echo 'Toda la estructura de Phase 1 ha sido eliminada:'
\echo '  - 4 tablas eliminadas'
\echo '  - 22 índices eliminados'
\echo '  - 4 triggers eliminados'
\echo '  - 2 funciones eliminadas'
\echo ''
\echo 'La base de datos coopesuma_db está ahora vacía.'
\echo ''
\echo 'Para recrear la estructura, ejecutar en orden:'
\echo '  1. 01_create_functions.sql'
\echo '  2. 02_create_tables.sql'
\echo '  3. 03_create_indexes.sql'
\echo '  4. 04_create_triggers.sql'
\echo '  5. 05_seed_data.sql (opcional - solo para testing)'
\echo ''
\echo '======================================================================'
