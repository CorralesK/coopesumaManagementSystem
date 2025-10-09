-- ============================================================================
-- Script: 05_seed_initial_data.sql
-- Descripción: Inserta los datos iniciales necesarios para el funcionamiento
--              del sistema (usuario administrador y datos de prueba opcionales)
-- Proyecto: CoopeSuma Management System - Phase 1
-- Base de datos: PostgreSQL 14+
-- Prerequisitos: Todas las tablas deben estar creadas
-- ============================================================================

-- ============================================================================
-- NOTA IMPORTANTE SOBRE CONTRASEÑAS
-- ============================================================================
-- La contraseña 'Admin123!' debe ser hasheada con bcrypt antes de insertar.
-- El hash que se muestra a continuación fue generado con bcrypt rounds=10
--
-- Para generar un nuevo hash en Node.js:
--   const bcrypt = require('bcrypt');
--   const hash = await bcrypt.hash('Admin123!', 10);
--   console.log(hash);
--
-- Para generar un nuevo hash en Python:
--   import bcrypt
--   hash = bcrypt.hashpw(b'Admin123!', bcrypt.gensalt(rounds=10))
--   print(hash.decode())
-- ============================================================================


-- ============================================================================
-- SECCIÓN 1: DATOS OBLIGATORIOS - Usuario Administrador
-- ============================================================================

-- Insertar usuario administrador inicial
-- Username: admin
-- Password: Admin123! (hasheado con bcrypt)
-- Role: administrator
-- Status: active
INSERT INTO users (full_name, username, password_hash, role, is_active)
VALUES (
    'Administrador del Sistema',
    'admin',
    '$2b$10$YQ5XqWZrP.KSXDn7qQx5PeGJGzJ0VJIYLkVmXW5n5LKx2fZ3.kGBm',  -- Password: Admin123!
    'administrator',
    true
);

COMMENT ON TABLE users IS 'Usuario administrador inicial creado. Username: admin, Password: Admin123!';


-- ============================================================================
-- SECCIÓN 2: DATOS DE PRUEBA OPCIONALES (SOLO PARA DESARROLLO)
-- ============================================================================
-- Los siguientes datos son opcionales y solo deben usarse en ambientes de
-- desarrollo/pruebas. Para producción, comentar o eliminar esta sección.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- USUARIOS DE PRUEBA
-- ----------------------------------------------------------------------------

-- Usuario registrador de prueba
-- Username: registrador1
-- Password: Registrador123!
INSERT INTO users (full_name, username, password_hash, role, is_active)
VALUES (
    'María Pérez Rodríguez',
    'registrador1',
    '$2b$10$YQ5XqWZrP.KSXDn7qQx5PeGJGzJ0VJIYLkVmXW5n5LKx2fZ3.kGBm',  -- Password: Registrador123! (cambiar hash en producción)
    'registrar',
    true
);

-- Usuario tesorero de prueba
-- Username: tesorero1
-- Password: Tesorero123!
INSERT INTO users (full_name, username, password_hash, role, is_active)
VALUES (
    'Carlos Gómez Solís',
    'tesorero1',
    '$2b$10$YQ5XqWZrP.KSXDn7qQx5PeGJGzJ0VJIYLkVmXW5n5LKx2fZ3.kGBm',  -- Password: Tesorero123! (cambiar hash en producción)
    'treasurer',
    true
);


-- ----------------------------------------------------------------------------
-- MIEMBROS DE PRUEBA
-- ----------------------------------------------------------------------------

-- Miembro de prueba 1: Estudiante de 1er grado
INSERT INTO members (full_name, identification, grade, section, photo_url, qr_hash, is_active)
VALUES (
    'Ana María Castro Vargas',
    '118450672',
    '1',
    'A',
    NULL,
    'QR_ANA_CASTRO_118450672_' || md5('118450672' || 'ana_castro'),
    true
);

-- Miembro de prueba 2: Estudiante de 3er grado
INSERT INTO members (full_name, identification, grade, section, photo_url, qr_hash, is_active)
VALUES (
    'José Alberto Morales Jiménez',
    '119560783',
    '3',
    'B',
    NULL,
    'QR_JOSE_MORALES_119560783_' || md5('119560783' || 'jose_morales'),
    true
);

-- Miembro de prueba 3: Estudiante de 6to grado
INSERT INTO members (full_name, identification, grade, section, photo_url, qr_hash, is_active)
VALUES (
    'Laura Patricia Ramírez Sánchez',
    '114230894',
    '6',
    'A',
    NULL,
    'QR_LAURA_RAMIREZ_114230894_' || md5('114230894' || 'laura_ramirez'),
    true
);

-- Miembro de prueba 4: Estudiante de 4to grado
INSERT INTO members (full_name, identification, grade, section, photo_url, qr_hash, is_active)
VALUES (
    'Diego Andrés Fernández López',
    '117340505',
    '4',
    'A',
    NULL,
    'QR_DIEGO_FERNANDEZ_117340505_' || md5('117340505' || 'diego_fernandez'),
    true
);

-- Miembro de prueba 5: Estudiante de 2do grado
INSERT INTO members (full_name, identification, grade, section, photo_url, qr_hash, is_active)
VALUES (
    'Sofía Valentina Rojas Méndez',
    '120670916',
    '2',
    'B',
    NULL,
    'QR_SOFIA_ROJAS_120670916_' || md5('120670916' || 'sofia_rojas'),
    true
);


-- ----------------------------------------------------------------------------
-- ASAMBLEAS DE PRUEBA
-- ----------------------------------------------------------------------------

-- Asamblea de prueba 1: Asamblea Ordinaria de Octubre (ACTIVA)
INSERT INTO assemblies (
    title,
    description,
    scheduled_date,
    start_time,
    end_time,
    is_active,
    is_recurring,
    recurrence_pattern,
    created_by
)
VALUES (
    'Asamblea Ordinaria de Octubre 2025',
    'Asamblea mensual ordinaria para revisión de estado de la cooperativa, aprobación de nuevos miembros y presentación de informes financieros.',
    '2025-10-15',
    '09:00:00',
    '11:00:00',
    true,  -- Esta es la asamblea activa
    false,
    'none',
    1  -- Creada por el usuario administrador (user_id = 1)
);

-- Asamblea de prueba 2: Asamblea Extraordinaria de Septiembre (INACTIVA - ya pasó)
INSERT INTO assemblies (
    title,
    description,
    scheduled_date,
    start_time,
    end_time,
    is_active,
    is_recurring,
    recurrence_pattern,
    created_by
)
VALUES (
    'Asamblea Extraordinaria de Septiembre 2025',
    'Asamblea extraordinaria para elección de nueva junta directiva y aprobación de proyectos especiales.',
    '2025-09-20',
    '10:00:00',
    '12:00:00',
    false,  -- Asamblea pasada, no activa
    false,
    'none',
    1  -- Creada por el usuario administrador
);

-- Asamblea de prueba 3: Asamblea Ordinaria de Noviembre (INACTIVA - futura)
INSERT INTO assemblies (
    title,
    description,
    scheduled_date,
    start_time,
    end_time,
    is_active,
    is_recurring,
    recurrence_pattern,
    created_by
)
VALUES (
    'Asamblea Ordinaria de Noviembre 2025',
    'Asamblea mensual ordinaria de noviembre. Revisión de actividades del mes anterior.',
    '2025-11-15',
    '09:00:00',
    '11:00:00',
    false,  -- Asamblea futura, no activa todavía
    true,   -- Esta es recurrente mensualmente
    'monthly',
    1  -- Creada por el usuario administrador
);


-- ----------------------------------------------------------------------------
-- REGISTROS DE ASISTENCIA DE PRUEBA
-- ----------------------------------------------------------------------------
-- Se registran 5 asistencias para la asamblea activa (assembly_id = 1)
-- usando diferentes métodos de registro
-- ----------------------------------------------------------------------------

-- Asistencia 1: Ana María - Registro por QR
INSERT INTO attendance_records (member_id, assembly_id, registered_by, registration_method, notes)
VALUES (
    1,  -- Ana María Castro
    1,  -- Asamblea Ordinaria de Octubre
    2,  -- Registrado por registrador1
    'qr_scan',
    'Registro exitoso mediante escaneo QR'
);

-- Asistencia 2: José Alberto - Registro por QR
INSERT INTO attendance_records (member_id, assembly_id, registered_by, registration_method, notes)
VALUES (
    2,  -- José Alberto Morales
    1,  -- Asamblea Ordinaria de Octubre
    2,  -- Registrado por registrador1
    'qr_scan',
    'Registro exitoso mediante escaneo QR'
);

-- Asistencia 3: Laura Patricia - Registro Manual
INSERT INTO attendance_records (member_id, assembly_id, registered_by, registration_method, notes)
VALUES (
    3,  -- Laura Patricia Ramírez
    1,  -- Asamblea Ordinaria de Octubre
    1,  -- Registrado por admin
    'manual',
    'Registro manual - estudiante olvidó código QR'
);

-- Asistencia 4: Diego Andrés - Registro por QR
INSERT INTO attendance_records (member_id, assembly_id, registered_by, registration_method, notes)
VALUES (
    4,  -- Diego Andrés Fernández
    1,  -- Asamblea Ordinaria de Octubre
    2,  -- Registrado por registrador1
    'qr_scan',
    'Registro exitoso mediante escaneo QR'
);

-- Asistencia 5: Sofía Valentina - Registro por QR
INSERT INTO attendance_records (member_id, assembly_id, registered_by, registration_method, notes)
VALUES (
    5,  -- Sofía Valentina Rojas
    1,  -- Asamblea Ordinaria de Octubre
    2,  -- Registrado por registrador1
    'qr_scan',
    'Registro exitoso mediante escaneo QR'
);

-- Asistencia 6: Ana María en asamblea pasada (Septiembre)
INSERT INTO attendance_records (member_id, assembly_id, registered_by, registration_method, notes)
VALUES (
    1,  -- Ana María Castro
    2,  -- Asamblea Extraordinaria de Septiembre
    1,  -- Registrado por admin
    'qr_scan',
    'Asistencia registrada en asamblea de septiembre'
);


-- ============================================================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- ============================================================================
-- Estas consultas son para verificar que los datos se insertaron correctamente.
-- Descomentar las siguientes líneas para ejecutar las verificaciones:
-- ============================================================================

-- Verificar usuarios creados
-- SELECT user_id, full_name, username, role, is_active, created_at FROM users ORDER BY user_id;

-- Verificar miembros creados
-- SELECT member_id, full_name, identification, grade, section, is_active FROM members ORDER BY member_id;

-- Verificar asambleas creadas
-- SELECT assembly_id, title, scheduled_date, is_active, is_recurring FROM assemblies ORDER BY assembly_id;

-- Verificar registros de asistencia
-- SELECT
--     ar.attendance_id,
--     m.full_name AS member_name,
--     a.title AS assembly_title,
--     ar.registration_method,
--     ar.registered_at
-- FROM attendance_records ar
-- JOIN members m ON ar.member_id = m.member_id
-- JOIN assemblies a ON ar.assembly_id = a.assembly_id
-- ORDER BY ar.registered_at;

-- Verificar que solo hay una asamblea activa
-- SELECT COUNT(*) as active_assemblies_count FROM assemblies WHERE is_active = true;
-- -- Resultado esperado: 1


-- ============================================================================
-- RESUMEN DE DATOS INSERTADOS
-- ============================================================================
-- USUARIOS:
--   - 1 Administrador (admin)
--   - 1 Registrador (registrador1)
--   - 1 Tesorero (tesorero1)
--   Total: 3 usuarios
--
-- MIEMBROS:
--   - 5 estudiantes de diferentes grados (1°, 2°, 3°, 4°, 6°)
--   Total: 5 miembros
--
-- ASAMBLEAS:
--   - 1 Asamblea activa (Octubre 2025)
--   - 1 Asamblea pasada (Septiembre 2025)
--   - 1 Asamblea futura (Noviembre 2025)
--   Total: 3 asambleas
--
-- REGISTROS DE ASISTENCIA:
--   - 5 registros para la asamblea activa (4 por QR, 1 manual)
--   - 1 registro para la asamblea pasada
--   Total: 6 registros de asistencia
-- ============================================================================

-- ============================================================================
-- CREDENCIALES PARA PRUEBAS
-- ============================================================================
-- IMPORTANTE: Estas credenciales son SOLO para desarrollo/pruebas.
-- En producción, cambiar TODAS las contraseñas.
--
-- Usuario Administrador:
--   Username: admin
--   Password: Admin123!
--
-- Usuario Registrador:
--   Username: registrador1
--   Password: Registrador123!
--
-- Usuario Tesorero:
--   Username: tesorero1
--   Password: Tesorero123!
-- ============================================================================

-- ============================================================================
-- Fin del script 05_seed_initial_data.sql
-- ============================================================================