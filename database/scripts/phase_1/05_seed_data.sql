-- ============================================================================
-- Script: 05_seed_data.sql
-- Descripción: Datos de prueba para testing y desarrollo (OPCIONAL)
-- Proyecto: CoopeSuma Management System
-- Fase: 1 - Control de Asistencia
-- Base de datos: PostgreSQL 14+
-- ============================================================================
--
-- INSTRUCCIONES DE USO:
-- psql -U postgres -d cooplinkcr -f 05_seed_data.sql
--
-- PREREQUISITOS:
-- - Ejecutar 01_create_functions.sql
-- - Ejecutar 02_create_tables.sql
-- - Ejecutar 03_create_indexes.sql
-- - Ejecutar 04_create_triggers.sql
--
-- IMPORTANTE:
-- Este script es OPCIONAL y solo debe ejecutarse en ambientes de desarrollo
-- o testing. NO ejecutar en producción.
--
-- Los usuarios reales se crearán automáticamente al autenticarse con Microsoft OAuth.
-- Los datos de prueba aquí son solo para facilitar el testing del backend.
-- ============================================================================

-- ============================================================================
-- DATOS INICIALES: schools y cooperatives
-- ============================================================================
-- IMPORTANTE: Estos datos SON necesarios para el funcionamiento del sistema
-- y deben insertarse incluso en producción
-- ============================================================================

INSERT INTO schools (name) VALUES
('Escuela Los Chiles Aguas Zarcas');

INSERT INTO cooperatives (school_id, trade_name, legal_name) VALUES
(1, 'Coopesuma R.L.', 'Cooperativa Estudiantil Unida Motivando el Ahorro');

-- ============================================================================
-- DATOS DE PRUEBA: users
-- ============================================================================
-- NOTA: En producción, los usuarios se crean automáticamente al hacer login
-- con Microsoft OAuth. Estos son solo para testing.
--
-- Los microsoft_id y emails aquí son ficticios para testing local.
-- En producción real, estos valores vendrán de Microsoft Azure AD.
-- ============================================================================

INSERT INTO users (cooperative_id, full_name, email, microsoft_id, role, is_active) VALUES
-- Usuario administrador de prueba
(1, 'Kimberly Corrales', 'kicorralesve@est.utn.ac.cr', 'test-ms-id-001', 'administrator', true),

-- Usuario registrador de prueba
(1, 'Registrador de Prueba', 'registrar@escuela.ed.cr', 'test-ms-id-002', 'registrar', true),

-- Usuario tesorero de prueba
(1, 'Tesorero de Prueba', 'treasurer@escuela.ed.cr', 'test-ms-id-003', 'treasurer', true);

-- ============================================================================
-- DATOS DE PRUEBA: members
-- ============================================================================
-- Miembros estudiantiles de diferentes grados
-- QR hash generado de forma simple para testing (en producción se genera con crypto)
-- ============================================================================

INSERT INTO members (cooperative_id, full_name, identification, grade, qr_hash, is_active) VALUES
-- Datos mínimos de prueba
(1, 'Juan Pérez Rodríguez', '1-0234-0567', '1', 'qr_hash_juan_perez_001', true),
(1, 'María González López', '1-0345-0678', '2', 'qr_hash_maria_gonzalez_002', true),
(1, 'Carlos Mora Jiménez', '1-0456-0789', '3', 'qr_hash_carlos_mora_003', true);

-- ============================================================================
-- DATOS DE PRUEBA: assemblies
-- ============================================================================
-- Asambleas de ejemplo para diferentes escenarios de testing
-- ============================================================================

INSERT INTO assemblies (
    cooperative_id,
    title,
    scheduled_date,
    start_time,
    end_time,
    is_active,
    created_by
) VALUES
-- Asamblea activa de prueba
(
    1,
    'Asamblea Mensual de Noviembre 2025',
    '2025-11-15',
    '09:00:00',
    '11:00:00',
    true,
    1  -- Creada por Admin de Prueba
);

-- ============================================================================
-- DATOS DE PRUEBA: attendance_records
-- ============================================================================
-- Registros de asistencia de ejemplo para la asamblea activa
-- ============================================================================

INSERT INTO attendance_records (
    member_id,
    assembly_id,
    registered_by,
    registration_method,
    notes
) VALUES
-- Registros mínimos de asistencia para testing
(1, 1, 1, 'qr_scan', NULL),  -- Juan Pérez
(2, 1, 1, 'qr_scan', NULL);  -- María González

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
-- Resumen de datos insertados:
-- DATOS INICIALES (necesarios en producción):
-- - 1 escuela
-- - 1 cooperativa
--
-- DATOS DE PRUEBA (solo para testing):
-- - 3 usuarios (1 administrator, 1 registrar, 1 treasurer)
-- - 3 miembros activos
-- - 1 asamblea activa
-- - 2 registros de asistencia
--
-- IMPORTANTE:
-- Estos datos son SOLO para desarrollo y testing.
-- En producción:
-- - Los usuarios se crean automáticamente al autenticarse con Microsoft OAuth
-- - Los miembros se crean manualmente por administradores
-- - Las asambleas se crean según el calendario real
-- - La asistencia se registra en tiempo real
--
-- Para limpiar estos datos de prueba:
-- Ejecutar 99_rollback.sql y volver a crear la estructura vacía
-- ============================================================================
