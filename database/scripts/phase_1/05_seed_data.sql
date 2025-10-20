-- ============================================================================
-- Script: 05_seed_data.sql
-- Descripción: Datos de prueba para testing y desarrollo (OPCIONAL)
-- Proyecto: CoopeSuma Management System
-- Fase: 1 - Control de Asistencia
-- Base de datos: PostgreSQL 14+
-- ============================================================================
--
-- INSTRUCCIONES DE USO:
-- psql -U postgres -d coopesuma_db -f 05_seed_data.sql
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
-- DATOS DE PRUEBA: users
-- ============================================================================
-- NOTA: En producción, los usuarios se crean automáticamente al hacer login
-- con Microsoft OAuth. Estos son solo para testing.
--
-- Los microsoft_id y emails aquí son ficticios para testing local.
-- En producción real, estos valores vendrán de Microsoft Azure AD.
-- ============================================================================

INSERT INTO users (full_name, email, microsoft_id, role, is_active) VALUES
-- Usuario administrador de prueba
('Kimberly Corrales', 'kicorralesve@est.utn.ac.cr', 'test-ms-id-001', 'administrator', true),

-- Usuario registrador de prueba
('Registrador de Prueba', 'registrar@escuela.ed.cr', 'test-ms-id-002', 'registrar', true),

-- Usuario tesorero de prueba
('Tesorero de Prueba', 'treasurer@escuela.ed.cr', 'test-ms-id-003', 'treasurer', true);

-- ============================================================================
-- DATOS DE PRUEBA: members
-- ============================================================================
-- Miembros estudiantiles de diferentes grados
-- QR hash generado de forma simple para testing (en producción se genera con crypto)
-- ============================================================================

INSERT INTO members (full_name, identification, grade, qr_hash, is_active) VALUES
-- Primer grado
('Juan Pérez Rodríguez', '1-0234-0567', '1', 'qr_hash_juan_perez_001', true),
('María González López', '1-0345-0678', '1', 'qr_hash_maria_gonzalez_002', true),
('Carlos Mora Jiménez', '1-0456-0789', '1', 'qr_hash_carlos_mora_003', true),

-- Segundo grado
('Ana Ramírez Castro', '2-0123-0456', '2', 'qr_hash_ana_ramirez_004', true),
('Pedro Sánchez Vargas', '2-0234-0567', '2', 'qr_hash_pedro_sanchez_005', true),
('Laura Fernández Rojas', '2-0345-0678', '2', 'qr_hash_laura_fernandez_006', true),

-- Tercer grado
('Diego Hernández Solís', '3-0456-0789', '3', 'qr_hash_diego_hernandez_007', true),
('Sofia Martínez Gómez', '3-0567-0890', '3', 'qr_hash_sofia_martinez_008', true),
('Luis Castro Méndez', '3-0678-0901', '3', 'qr_hash_luis_castro_009', true),

-- Cuarto grado
('Gabriela Ruiz Navarro', '4-0789-0123', '4', 'qr_hash_gabriela_ruiz_010', true),
('Miguel Ángel Vega Cruz', '4-0890-0234', '4', 'qr_hash_miguel_vega_011', true),
('Daniela Torres Mora', '4-0901-0345', '4', 'qr_hash_daniela_torres_012', true),

-- Quinto grado
('Andrés López Arias', '5-0123-0789', '5', 'qr_hash_andres_lopez_013', true),
('Camila Jiménez Rojas', '5-0234-0890', '5', 'qr_hash_camila_jimenez_014', true),
('Sebastián Vargas Luna', '5-0345-0901', '5', 'qr_hash_sebastian_vargas_015', true),

-- Sexto grado
('Valeria Chaves Mata', '6-0456-0123', '6', 'qr_hash_valeria_chaves_016', true),
('Mateo Rojas Solano', '6-0567-0234', '6', 'qr_hash_mateo_rojas_017', true),
('Isabella Mora Quesada', '6-0678-0345', '6', 'qr_hash_isabella_mora_018', true),

-- Miembro inactivo (para testing soft delete)
('Estudiante Inactivo Test', '1-9999-9999', '3', 'qr_hash_inactive_test_019', false);

-- ============================================================================
-- DATOS DE PRUEBA: assemblies
-- ============================================================================
-- Asambleas de ejemplo para diferentes escenarios de testing
-- ============================================================================

INSERT INTO assemblies (
    title,
    scheduled_date,
    start_time,
    end_time,
    is_active,
    created_by
) VALUES
-- Asamblea activa (solo puede haber una)
(
    'Asamblea Mensual de Noviembre 2025',
    '2025-11-15',
    '09:00:00',
    '11:00:00',
    true,
    1  -- Creada por Admin de Prueba
),

-- Asambleas pasadas (inactivas)
(
    'Asamblea Mensual de Octubre 2025',
    '2025-10-15',
    '09:00:00',
    '11:00:00',
    false,
    1
),

(
    'Asamblea Mensual de Septiembre 2025',
    '2025-09-15',
    '09:00:00',
    '11:00:00',
    false,
    1
),

-- Asamblea futura (inactiva)
(
    'Asamblea Mensual de Diciembre 2025',
    '2025-12-15',
    '09:00:00',
    '11:00:00',
    false,
    1
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
-- Registros de asistencia para la asamblea activa (assembly_id = 1)
-- Método QR scan
(1, 1, 2, 'qr_scan', NULL),  -- Juan Pérez - registrado por Registrador
(2, 1, 2, 'qr_scan', NULL),  -- María González - registrado por Registrador
(3, 1, 2, 'qr_scan', NULL),  -- Carlos Mora - registrado por Registrador
(4, 1, 1, 'qr_scan', NULL),  -- Ana Ramírez - registrado por Admin
(5, 1, 1, 'qr_scan', NULL),  -- Pedro Sánchez - registrado por Admin
(6, 1, 2, 'qr_scan', NULL),  -- Laura Fernández - registrado por Registrador

-- Método manual (con notas)
(7, 1, 1, 'manual', 'Olvidó su código QR, verificado manualmente'),
(8, 1, 1, 'manual', 'Código QR dañado, verificado por foto'),

-- Registros de asistencia para asamblea pasada (assembly_id = 2)
(1, 2, 2, 'qr_scan', NULL),
(2, 2, 2, 'qr_scan', NULL),
(4, 2, 1, 'qr_scan', NULL),
(5, 2, 2, 'qr_scan', NULL),
(7, 2, 1, 'qr_scan', NULL),
(9, 2, 2, 'qr_scan', NULL),

-- Registros de asistencia para otra asamblea pasada (assembly_id = 3)
(1, 3, 1, 'qr_scan', NULL),
(3, 3, 2, 'qr_scan', NULL),
(4, 3, 1, 'qr_scan', NULL),
(6, 3, 2, 'qr_scan', NULL),
(8, 3, 1, 'qr_scan', NULL),
(10, 3, 2, 'qr_scan', NULL);

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
-- Resumen de datos de prueba insertados:
-- - 3 usuarios (1 administrator, 1 registrar, 1 treasurer)
-- - 19 miembros (18 activos, 1 inactivo)
--   * Distribuidos en grados 1-6
-- - 4 asambleas (1 activa, 3 inactivas)
-- - 20 registros de asistencia
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
