-- ============================================================================
-- Script: 04_create_triggers.sql
-- Descripción: Creación de triggers para automatización y reglas de negocio
-- Proyecto: CoopeSuma Management System
-- Fase: 1 - Control de Asistencia
-- Base de datos: PostgreSQL 14+
-- ============================================================================
--
-- INSTRUCCIONES DE USO:
-- psql -U postgres -d cooplinkcr -f 04_create_triggers.sql
--
-- PREREQUISITOS:
-- - Ejecutar 01_create_functions.sql
-- - Ejecutar 02_create_tables.sql
-- - Ejecutar 03_create_indexes.sql
--
-- ============================================================================

-- ============================================================================
-- TRIGGERS PARA TABLA: schools
-- ============================================================================

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_schools_updated_at
    BEFORE UPDATE ON schools
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_schools_updated_at ON schools IS
'Actualiza automáticamente el campo updated_at antes de cada UPDATE';

-- ============================================================================
-- TRIGGERS PARA TABLA: cooperatives
-- ============================================================================

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_cooperatives_updated_at
    BEFORE UPDATE ON cooperatives
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_cooperatives_updated_at ON cooperatives IS
'Actualiza automáticamente el campo updated_at antes de cada UPDATE';

-- ============================================================================
-- TRIGGERS PARA TABLA: users
-- ============================================================================

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_users_updated_at ON users IS
'Actualiza automáticamente el campo updated_at antes de cada UPDATE';

-- ============================================================================
-- TRIGGERS PARA TABLA: members
-- ============================================================================

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_members_updated_at ON members IS
'Actualiza automáticamente el campo updated_at antes de cada UPDATE';

-- ============================================================================
-- TRIGGERS PARA TABLA: assemblies
-- ============================================================================

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_assemblies_updated_at
    BEFORE UPDATE ON assemblies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_assemblies_updated_at ON assemblies IS
'Actualiza automáticamente el campo updated_at antes de cada UPDATE';

-- Trigger para garantizar solo una asamblea activa
-- Este trigger desactiva todas las demás asambleas cuando se activa una nueva
CREATE TRIGGER ensure_single_active_assembly
    BEFORE INSERT OR UPDATE ON assemblies
    FOR EACH ROW
    WHEN (NEW.is_active = true)
    EXECUTE FUNCTION deactivate_other_assemblies();

COMMENT ON TRIGGER ensure_single_active_assembly ON assemblies IS
'Garantiza que solo una asamblea esté activa simultáneamente.
Desactiva automáticamente todas las demás asambleas cuando se activa una nueva.
REGLA DE NEGOCIO CRÍTICA: Solo una asamblea activa a la vez.';

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
-- Resumen:
-- - 6 triggers creados exitosamente:
--   1. update_schools_updated_at (schools)
--   2. update_cooperatives_updated_at (cooperatives)
--   3. update_users_updated_at (users)
--   4. update_members_updated_at (members)
--   5. update_assemblies_updated_at (assemblies)
--   6. ensure_single_active_assembly (assemblies) - REGLA DE NEGOCIO CRÍTICA
--
-- IMPORTANTE:
-- El trigger ensure_single_active_assembly garantiza que solo una asamblea
-- pueda estar activa simultáneamente, desactivando automáticamente todas
-- las demás asambleas cuando se activa una nueva.
--
-- Próximo paso:
-- Ejecutar 05_seed_data.sql (opcional - solo para testing)
-- ============================================================================
