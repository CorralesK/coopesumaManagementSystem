-- ============================================================================
-- Script: 06_add_microsoft_oauth_columns.sql
-- Descripción: Agrega columnas necesarias para Microsoft OAuth authentication
-- Proyecto: CoopeSuma Management System - Phase 1
-- Base de datos: PostgreSQL 14+
-- Especificación: 03_attendance_module_spec.md (Section 3.4)
-- ============================================================================

-- ============================================================================
-- MODIFICACIÓN: Agregar columnas de Microsoft OAuth a la tabla users
-- Descripción: Permite autenticación con Microsoft 365 / Azure AD
-- Cambios:
--   - Añade microsoft_id: ID único del usuario en Microsoft
--   - Añade email: Email del usuario (obtenido de Microsoft)
--   - password_hash ahora es NULLABLE (usuarios OAuth no tienen contraseña local)
-- ============================================================================

-- Agregar columna microsoft_id (ID único de Microsoft)
ALTER TABLE users
ADD COLUMN microsoft_id VARCHAR(255) UNIQUE;

-- Agregar columna email (correo electrónico)
ALTER TABLE users
ADD COLUMN email VARCHAR(255) UNIQUE;

-- Hacer password_hash NULLABLE (usuarios OAuth no tienen contraseña local)
ALTER TABLE users
ALTER COLUMN password_hash DROP NOT NULL;

-- ============================================================================
-- ÍNDICES: Para optimizar búsquedas por microsoft_id y email
-- ============================================================================

-- Índice para búsquedas por microsoft_id
CREATE INDEX idx_users_microsoft_id ON users(microsoft_id);

-- Índice para búsquedas por email
CREATE INDEX idx_users_email ON users(email);

-- ============================================================================
-- COMENTARIOS: Documentación de las nuevas columnas
-- ============================================================================

COMMENT ON COLUMN users.microsoft_id IS 'ID único del usuario en Microsoft Azure AD (usado para OAuth)';
COMMENT ON COLUMN users.email IS 'Correo electrónico del usuario (obtenido de Microsoft OAuth)';

-- ============================================================================
-- CONSTRAINT: Validación de datos
-- ============================================================================

-- Agregar constraint para validar que al menos uno de los métodos de autenticación esté presente
-- (microsoft_id O password_hash)
ALTER TABLE users
ADD CONSTRAINT chk_auth_method
CHECK (
    (microsoft_id IS NOT NULL) OR
    (password_hash IS NOT NULL)
);

COMMENT ON CONSTRAINT chk_auth_method ON users IS
'Valida que el usuario tenga al menos un método de autenticación: Microsoft OAuth o contraseña local';

-- ============================================================================
-- Fin del script 06_add_microsoft_oauth_columns.sql
-- ============================================================================
