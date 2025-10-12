-- ============================================================================
-- Script: 01_create_functions.sql
-- Descripción: Funciones de utilidad para la base de datos CoopeSuma
-- Proyecto: CoopeSuma Management System
-- Fase: 1 - Control de Asistencia
-- Base de datos: PostgreSQL 14+
-- ============================================================================
--
-- INSTRUCCIONES DE USO:
-- psql -U postgres -d coopesuma_db -f 01_create_functions.sql
--
-- ============================================================================

-- ============================================================================
-- FUNCIÓN 1: update_updated_at_column()
-- Descripción: Actualiza automáticamente el campo updated_at con timestamp actual
-- Uso: Se usa en triggers BEFORE UPDATE en todas las tablas con updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS
'Función de trigger que actualiza automáticamente el campo updated_at con el timestamp actual';

-- ============================================================================
-- FUNCIÓN 2: deactivate_other_assemblies()
-- Descripción: Garantiza que solo una asamblea esté activa simultáneamente
-- Uso: Se usa en trigger BEFORE INSERT OR UPDATE en tabla assemblies
-- ============================================================================

CREATE OR REPLACE FUNCTION deactivate_other_assemblies()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_active = true THEN
        UPDATE assemblies
        SET is_active = false
        WHERE assembly_id != NEW.assembly_id
        AND is_active = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION deactivate_other_assemblies() IS
'Garantiza que solo una asamblea esté activa simultáneamente.
Desactiva todas las demás asambleas cuando se activa una nueva.';

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
-- Resumen:
-- - 2 funciones creadas exitosamente
--
-- Próximo paso:
-- Ejecutar 02_create_tables.sql
-- ============================================================================
