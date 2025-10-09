-- ============================================================================
-- Script: 01_create_functions.sql
-- Descripción: Crea las funciones comunes necesarias para la base de datos
-- Proyecto: CoopeSuma Management System - Phase 1
-- Base de datos: PostgreSQL
-- ============================================================================

-- ============================================================================
-- FUNCIÓN: update_updated_at_column()
-- Descripción: Actualiza automáticamente el campo updated_at cuando se
--              modifica un registro en cualquier tabla
-- Retorna: TRIGGER
-- Uso: Se ejecuta BEFORE UPDATE en las tablas que tienen campo updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Asigna el timestamp actual al campo updated_at del nuevo registro
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comentario descriptivo de la función
COMMENT ON FUNCTION update_updated_at_column() IS
'Función de trigger que actualiza automáticamente el campo updated_at con el timestamp actual cuando se modifica un registro';


-- ============================================================================
-- FUNCIÓN: deactivate_other_assemblies()
-- Descripción: Garantiza que solo una asamblea esté activa a la vez.
--              Cuando se activa una asamblea, desactiva automáticamente
--              todas las demás asambleas activas.
-- Retorna: TRIGGER
-- Uso: Se ejecuta BEFORE INSERT OR UPDATE en la tabla assemblies
-- Regla de negocio: Solo puede haber UNA asamblea activa al mismo tiempo
-- ============================================================================
CREATE OR REPLACE FUNCTION deactivate_other_assemblies()
RETURNS TRIGGER AS $$
BEGIN
    -- Si la asamblea nueva o modificada está siendo activada (is_active = true)
    IF NEW.is_active = true THEN
        -- Desactiva todas las demás asambleas que estén activas
        -- excepto la asamblea actual (NEW.assembly_id)
        UPDATE assemblies
        SET is_active = false
        WHERE assembly_id != NEW.assembly_id
        AND is_active = true;
    END IF;

    -- Retorna el registro nuevo para que la operación continue
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comentario descriptivo de la función
COMMENT ON FUNCTION deactivate_other_assemblies() IS
'Función de trigger que asegura que solo una asamblea esté activa simultáneamente. Desactiva automáticamente otras asambleas cuando se activa una nueva';


-- ============================================================================
-- Fin del script 01_create_functions.sql
-- ============================================================================