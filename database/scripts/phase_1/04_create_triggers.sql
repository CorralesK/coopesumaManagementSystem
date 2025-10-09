-- ============================================================================
-- Script: 04_create_triggers.sql
-- Descripción: Crea todos los triggers necesarios para automatizar procesos
--              y mantener la integridad de datos en la Fase 1
-- Proyecto: CoopeSuma Management System - Phase 1
-- Base de datos: PostgreSQL 14+
-- Prerequisitos: Las funciones del script 01_create_functions.sql deben existir
-- ============================================================================

-- ============================================================================
-- TRIGGERS PARA LA TABLA: users
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TRIGGER: update_users_updated_at
-- Descripción: Actualiza automáticamente el campo updated_at cuando se
--              modifica un registro de usuario
-- Momento: BEFORE UPDATE
-- Función: update_updated_at_column()
-- ----------------------------------------------------------------------------
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_users_updated_at ON users IS
'Actualiza automáticamente el timestamp updated_at cuando se modifica un usuario';


-- ============================================================================
-- TRIGGERS PARA LA TABLA: members
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TRIGGER: update_members_updated_at
-- Descripción: Actualiza automáticamente el campo updated_at cuando se
--              modifica un registro de miembro
-- Momento: BEFORE UPDATE
-- Función: update_updated_at_column()
-- ----------------------------------------------------------------------------
CREATE TRIGGER update_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_members_updated_at ON members IS
'Actualiza automáticamente el timestamp updated_at cuando se modifica un miembro';


-- ============================================================================
-- TRIGGERS PARA LA TABLA: assemblies
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TRIGGER: update_assemblies_updated_at
-- Descripción: Actualiza automáticamente el campo updated_at cuando se
--              modifica un registro de asamblea
-- Momento: BEFORE UPDATE
-- Función: update_updated_at_column()
-- ----------------------------------------------------------------------------
CREATE TRIGGER update_assemblies_updated_at
    BEFORE UPDATE ON assemblies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_assemblies_updated_at ON assemblies IS
'Actualiza automáticamente el timestamp updated_at cuando se modifica una asamblea';


-- ----------------------------------------------------------------------------
-- TRIGGER: ensure_single_active_assembly
-- Descripción: Garantiza que solo una asamblea esté activa al mismo tiempo.
--              Cuando se activa una asamblea (is_active = true), este trigger
--              desactiva automáticamente todas las demás asambleas activas.
-- Momento: BEFORE INSERT OR UPDATE
-- Condición: Solo se ejecuta cuando NEW.is_active = true
-- Función: deactivate_other_assemblies()
-- Regla de negocio: Solo puede haber UNA asamblea activa simultáneamente
-- ----------------------------------------------------------------------------
CREATE TRIGGER ensure_single_active_assembly
    BEFORE INSERT OR UPDATE ON assemblies
    FOR EACH ROW
    WHEN (NEW.is_active = true)
    EXECUTE FUNCTION deactivate_other_assemblies();

COMMENT ON TRIGGER ensure_single_active_assembly ON assemblies IS
'Garantiza que solo una asamblea esté activa al mismo tiempo. Desactiva automáticamente las demás al activar una nueva';


-- ============================================================================
-- RESUMEN DE TRIGGERS CREADOS
-- ============================================================================
-- Tabla users:
--   1. update_users_updated_at
--      - Actualiza updated_at en modificaciones
--
-- Tabla members:
--   1. update_members_updated_at
--      - Actualiza updated_at en modificaciones
--
-- Tabla assemblies:
--   1. update_assemblies_updated_at
--      - Actualiza updated_at en modificaciones
--   2. ensure_single_active_assembly
--      - Garantiza solo una asamblea activa
--
-- Tabla attendance_records:
--   - No requiere triggers (no tiene campo updated_at y las reglas de negocio
--     se manejan mediante constraints y lógica de aplicación)
--
-- TOTAL: 4 triggers
-- ============================================================================

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================
-- 1. Los triggers de updated_at se ejecutan BEFORE UPDATE para garantizar
--    que el timestamp se actualice antes de guardar el registro
--
-- 2. El trigger ensure_single_active_assembly se ejecuta BEFORE INSERT OR UPDATE
--    para garantizar que la regla de negocio se aplique tanto al crear como
--    al modificar asambleas
--
-- 3. La condición WHEN (NEW.is_active = true) en ensure_single_active_assembly
--    optimiza el rendimiento ejecutando el trigger solo cuando es necesario
--
-- 4. attendance_records no tiene trigger de updated_at porque es una tabla
--    de registro histórico que no debe modificarse una vez creada
-- ============================================================================

-- ============================================================================
-- Fin del script 04_create_triggers.sql
-- ============================================================================