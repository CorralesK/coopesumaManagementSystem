-- ============================================================================
-- Script: 99_rollback_phase1.sql
-- Descripción: Elimina todos los objetos de base de datos creados en la Fase 1
--              en orden inverso a su creación para evitar violaciones de
--              dependencias
-- Proyecto: CoopeSuma Management System - Phase 1
-- Base de datos: PostgreSQL 14+
-- ADVERTENCIA: Este script eliminará TODOS los datos y estructuras de Phase 1
-- ============================================================================

-- ============================================================================
-- ADVERTENCIA IMPORTANTE
-- ============================================================================
-- ⚠️  ATENCIÓN: Este script eliminará PERMANENTEMENTE:
--    - Todas las tablas de Phase 1
--    - Todos los índices asociados
--    - Todos los triggers
--    - Todas las funciones
--    - TODOS LOS DATOS almacenados en estas tablas
--
-- ⚠️  NO EJECUTAR EN PRODUCCIÓN sin un backup completo
--
-- ⚠️  Esta operación NO SE PUEDE DESHACER
-- ============================================================================

BEGIN;

-- ============================================================================
-- PASO 1: ELIMINAR TRIGGERS
-- Descripción: Eliminar triggers en orden para evitar errores de dependencias
-- ============================================================================

-- Triggers de la tabla assemblies
DROP TRIGGER IF EXISTS ensure_single_active_assembly ON assemblies;
DROP TRIGGER IF EXISTS update_assemblies_updated_at ON assemblies;

-- Triggers de la tabla members
DROP TRIGGER IF EXISTS update_members_updated_at ON members;

-- Triggers de la tabla users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;


-- ============================================================================
-- PASO 2: ELIMINAR ÍNDICES
-- Descripción: Eliminar índices explícitamente (aunque se eliminarán
--              automáticamente con las tablas, es buena práctica)
-- ============================================================================

-- Índices de attendance_records
DROP INDEX IF EXISTS idx_attendance_method;
DROP INDEX IF EXISTS idx_attendance_registered_by;
DROP INDEX IF EXISTS idx_attendance_registered_at;
DROP INDEX IF EXISTS idx_attendance_assembly_id;
DROP INDEX IF EXISTS idx_attendance_member_id;

-- Índices de assemblies
DROP INDEX IF EXISTS idx_assemblies_single_active;
DROP INDEX IF EXISTS idx_assemblies_created_by;
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
DROP INDEX IF EXISTS idx_users_username;


-- ============================================================================
-- PASO 3: ELIMINAR TABLAS
-- Descripción: Eliminar tablas en orden inverso a su creación
--              (respetar dependencias de foreign keys)
-- Orden: attendance_records -> assemblies -> members -> users
-- ============================================================================

-- Eliminar tabla attendance_records (tiene foreign keys a members, assemblies, users)
DROP TABLE IF EXISTS attendance_records CASCADE;

-- Eliminar tabla assemblies (tiene foreign key a users)
DROP TABLE IF EXISTS assemblies CASCADE;

-- Eliminar tabla members (no tiene dependencias)
DROP TABLE IF EXISTS members CASCADE;

-- Eliminar tabla users (base de todas las relaciones)
DROP TABLE IF EXISTS users CASCADE;


-- ============================================================================
-- PASO 4: ELIMINAR FUNCIONES
-- Descripción: Eliminar funciones personalizadas creadas para triggers
-- ============================================================================

-- Eliminar función para desactivar otras asambleas
DROP FUNCTION IF EXISTS deactivate_other_assemblies() CASCADE;

-- Eliminar función para actualizar updated_at
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;


-- ============================================================================
-- VERIFICACIÓN POST-ROLLBACK
-- ============================================================================
-- Descomentar las siguientes líneas para verificar que todo fue eliminado:
-- ============================================================================

-- Verificar que no existen tablas de Phase 1
-- SELECT table_name
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name IN ('users', 'members', 'assemblies', 'attendance_records');
-- -- Resultado esperado: 0 filas

-- Verificar que no existen funciones de Phase 1
-- SELECT routine_name
-- FROM information_schema.routines
-- WHERE routine_schema = 'public'
-- AND routine_name IN ('update_updated_at_column', 'deactivate_other_assemblies');
-- -- Resultado esperado: 0 filas

-- Verificar que no existen índices de Phase 1 (solo si las tablas fueron eliminadas)
-- SELECT indexname
-- FROM pg_indexes
-- WHERE schemaname = 'public'
-- AND indexname LIKE 'idx_users%'
--    OR indexname LIKE 'idx_members%'
--    OR indexname LIKE 'idx_assemblies%'
--    OR indexname LIKE 'idx_attendance%';
-- -- Resultado esperado: 0 filas


-- ============================================================================
-- RESUMEN DE OBJETOS ELIMINADOS
-- ============================================================================
-- TRIGGERS ELIMINADOS:
--   - ensure_single_active_assembly (assemblies)
--   - update_assemblies_updated_at (assemblies)
--   - update_members_updated_at (members)
--   - update_users_updated_at (users)
--   Total: 4 triggers
--
-- ÍNDICES ELIMINADOS:
--   - 5 índices de attendance_records
--   - 4 índices de assemblies
--   - 5 índices de members
--   - 3 índices de users
--   Total: 17 índices
--
-- TABLAS ELIMINADAS:
--   - attendance_records
--   - assemblies
--   - members
--   - users
--   Total: 4 tablas
--
-- FUNCIONES ELIMINADAS:
--   - deactivate_other_assemblies()
--   - update_updated_at_column()
--   Total: 2 funciones
-- ============================================================================


-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================
-- 1. El uso de CASCADE en las operaciones DROP garantiza que todas las
--    dependencias sean eliminadas automáticamente
--
-- 2. El uso de IF EXISTS previene errores si algún objeto ya fue eliminado
--
-- 3. Este script está envuelto en una transacción (BEGIN/COMMIT) para
--    garantizar atomicidad. Si ocurre algún error, nada será eliminado.
--
-- 4. Para ejecutar este script de forma segura:
--    - Asegurar tener un backup completo de la base de datos
--    - Verificar que no hay conexiones activas a las tablas
--    - Ejecutar en un ambiente de pruebas primero
--    - En producción, considerar backup selectivo de datos importantes
--
-- 5. Si se necesita eliminar solo los datos pero mantener la estructura,
--    usar TRUNCATE en lugar de DROP TABLE:
--    TRUNCATE TABLE attendance_records, assemblies, members, users CASCADE;
-- ============================================================================


-- ============================================================================
-- ALTERNATIVA: ROLLBACK PARCIAL (Solo datos, mantener estructura)
-- ============================================================================
-- Si solo se desean eliminar los datos pero mantener la estructura de tablas,
-- descomentar las siguientes líneas en lugar de ejecutar los DROP TABLE:
-- ============================================================================

-- BEGIN;
--
-- -- Eliminar datos en orden inverso (respetando foreign keys)
-- DELETE FROM attendance_records;
-- DELETE FROM assemblies;
-- DELETE FROM members;
-- DELETE FROM users;
--
-- -- Resetear secuencias de IDs a 1
-- ALTER SEQUENCE users_user_id_seq RESTART WITH 1;
-- ALTER SEQUENCE members_member_id_seq RESTART WITH 1;
-- ALTER SEQUENCE assemblies_assembly_id_seq RESTART WITH 1;
-- ALTER SEQUENCE attendance_records_attendance_id_seq RESTART WITH 1;
--
-- COMMIT;


-- ============================================================================
-- INSTRUCCIONES PARA RECREAR LA BASE DE DATOS DESPUÉS DEL ROLLBACK
-- ============================================================================
-- Después de ejecutar este rollback, para recrear la base de datos ejecutar
-- los scripts en el siguiente orden:
--
-- 1. 01_create_functions.sql
-- 2. 02_create_tables.sql
-- 3. 03_create_indexes.sql
-- 4. 04_create_triggers.sql
-- 5. 05_seed_initial_data.sql (opcional, solo para datos de prueba)
-- ============================================================================

COMMIT;

-- ============================================================================
-- Fin del script 99_rollback_phase1.sql
-- ============================================================================