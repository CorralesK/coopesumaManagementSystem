-- ============================================================================
-- Script: 02_create_tables.sql
-- Descripción: Creación de todas las tablas del sistema CoopLink
-- Proyecto: CoopeSuma Management System
-- Incluye: Módulo 1 (Asistencia) + Módulo 2 (Ahorros y Económico)
-- Base de datos: PostgreSQL 14+
-- ============================================================================

-- ============================================================================
-- TABLA 1: schools
-- ============================================================================

CREATE TABLE schools (
    school_id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_school_name_not_empty CHECK (TRIM(name) != '')
);

COMMENT ON TABLE schools IS 'Escuelas que utilizan el sistema CoopLink';

-- ============================================================================
-- TABLA 2: cooperatives
-- ============================================================================

CREATE TABLE cooperatives (
    cooperative_id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(school_id) ON DELETE RESTRICT,
    trade_name VARCHAR(150) NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_trade_name_not_empty CHECK (TRIM(trade_name) != ''),
    CONSTRAINT chk_legal_name_not_empty CHECK (TRIM(legal_name) != '')
);

COMMENT ON TABLE cooperatives IS 'Cooperativas estudiantiles del sistema';

-- ============================================================================
-- TABLA 3: users
-- ============================================================================

CREATE TABLE users (
    cooperative_id INTEGER NOT NULL REFERENCES cooperatives(cooperative_id) ON DELETE RESTRICT,
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    microsoft_id VARCHAR(255) UNIQUE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('administrator', 'registrar', 'treasurer', 'student')),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_full_name_not_empty CHECK (TRIM(full_name) != ''),
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

COMMENT ON TABLE users IS 'Usuarios del sistema autenticados con Microsoft OAuth';
COMMENT ON COLUMN users.cooperative_id IS 'Cooperativa a la que pertenece el usuario';
COMMENT ON COLUMN users.role IS 'Rol del usuario: administrator, registrar, treasurer, student';
COMMENT ON COLUMN users.microsoft_id IS 'ID de Microsoft para autenticación OAuth';

-- ============================================================================
-- TABLA 4: member_qualities
-- Description: Catalog of member quality types (student, staff)
-- ============================================================================

CREATE TABLE member_qualities (
    quality_id SERIAL PRIMARY KEY,
    quality_code VARCHAR(20) UNIQUE NOT NULL,
    quality_name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_quality_code_format CHECK (quality_code ~ '^[a-z_]+$'),
    CONSTRAINT chk_quality_name_not_empty CHECK (TRIM(quality_name) != '')
);

COMMENT ON TABLE member_qualities IS 'Catálogo de calidades de miembros (estudiante, funcionario)';
COMMENT ON COLUMN member_qualities.quality_code IS 'Código único: student (estudiante), staff (funcionario)';

-- Insert predefined qualities
INSERT INTO member_qualities (quality_id, quality_code, quality_name, description) VALUES
(1, 'student', 'Estudiante', 'Miembro activo que es estudiante de la escuela'),
(2, 'staff', 'Funcionario', 'Miembro activo que es funcionario de la escuela (docente, administrativo)');

-- ============================================================================
-- TABLA 5: member_levels
-- Description: Catalog of educational levels
-- ============================================================================

CREATE TABLE member_levels (
    level_id SERIAL PRIMARY KEY,
    level_code VARCHAR(20) UNIQUE NOT NULL,
    level_name VARCHAR(50) NOT NULL,
    applies_to_quality_code VARCHAR(20) NOT NULL REFERENCES member_qualities(quality_code),
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_level_code_format CHECK (level_code ~ '^[a-z_0-9]+$'),
    CONSTRAINT chk_level_name_not_empty CHECK (TRIM(level_name) != '')
);

COMMENT ON TABLE member_levels IS 'Catálogo de niveles educativos para miembros';
COMMENT ON COLUMN member_levels.applies_to_quality_code IS 'Calidad a la que aplica este nivel (student o staff)';
COMMENT ON COLUMN member_levels.display_order IS 'Orden de visualización (menor primero)';

-- Insert predefined levels
INSERT INTO member_levels (level_id, level_code, level_name, applies_to_quality_code, display_order) VALUES
(1, 'grade_1', 'Primer Grado', 'student', 1),
(2, 'grade_2', 'Segundo Grado', 'student', 2),
(3, 'grade_3', 'Tercer Grado', 'student', 3),
(4, 'grade_4', 'Cuarto Grado', 'student', 4),
(5, 'grade_5', 'Quinto Grado', 'student', 5),
(6, 'grade_6', 'Sexto Grado', 'student', 6),
(7, 'not_applicable', 'No Aplica', 'staff', 99),
(8, 'transicion', 'Transición', 'student', 0),
(9, 'materno', 'Materno', 'student', -1);

-- ============================================================================
-- TABLA 6: members
-- Description: Cooperative members with quality and educational level
-- ============================================================================

CREATE TABLE members (
    cooperative_id INTEGER NOT NULL REFERENCES cooperatives(cooperative_id) ON DELETE RESTRICT,
    member_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    identification VARCHAR(20) UNIQUE NOT NULL,
    gender CHAR(1) CHECK (gender IN ('M', 'F', 'O')),
    member_code VARCHAR(20) UNIQUE,
    quality_id INTEGER NOT NULL REFERENCES member_qualities(quality_id),
    level_id INTEGER REFERENCES member_levels(level_id),
    institutional_email VARCHAR(255) UNIQUE,
    photo_url VARCHAR(255),
    qr_hash VARCHAR(255) UNIQUE NOT NULL,
    affiliation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    last_liquidation_date DATE,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_full_name_not_empty CHECK (TRIM(full_name) != ''),
    CONSTRAINT chk_identification_format CHECK (identification ~ '^[0-9-]+$'),
    CONSTRAINT chk_institutional_email_format CHECK (
        institutional_email IS NULL OR
        institutional_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]*mep\.go\.cr$'
    ),
    CONSTRAINT chk_qr_hash_not_empty CHECK (TRIM(qr_hash) != '')
);

COMMENT ON TABLE members IS 'Miembros de la cooperativa (estudiantes y funcionarios)';
COMMENT ON COLUMN members.gender IS 'Género: M=Masculino, F=Femenino, O=Otro';
COMMENT ON COLUMN members.member_code IS 'Código único de miembro (formato: NNN-YYYY, ej: 001-2025)';
COMMENT ON COLUMN members.quality_id IS 'Calidad del miembro (estudiante o funcionario)';
COMMENT ON COLUMN members.level_id IS 'Nivel educativo (grado escolar o N/A para funcionarios)';
COMMENT ON COLUMN members.affiliation_date IS 'Fecha de afiliación a la cooperativa (para calcular liquidaciones cada 6 años)';
COMMENT ON COLUMN members.last_liquidation_date IS 'Fecha de la última liquidación realizada';
COMMENT ON COLUMN members.qr_hash IS 'Hash único para código QR de identificación';

-- ============================================================================
-- TABLA 7: assemblies
-- ============================================================================

CREATE TABLE assemblies (
    cooperative_id INTEGER NOT NULL REFERENCES cooperatives(cooperative_id) ON DELETE RESTRICT,
    assembly_id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    scheduled_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_active BOOLEAN DEFAULT false NOT NULL,
    concluded_at TIMESTAMP,
    created_by INTEGER NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_title_not_empty CHECK (TRIM(title) != ''),
    CONSTRAINT chk_time_range CHECK (
        end_time IS NULL OR start_time IS NULL OR end_time > start_time
    )
);

COMMENT ON TABLE assemblies IS 'Asambleas de la cooperativa (solo una activa a la vez)';

-- ============================================================================
-- TABLA 8: attendance_records
-- ============================================================================

CREATE TABLE attendance_records (
    attendance_id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(member_id),
    assembly_id INTEGER NOT NULL REFERENCES assemblies(assembly_id),
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    registered_by INTEGER NOT NULL REFERENCES users(user_id),
    registration_method VARCHAR(20) DEFAULT 'qr_scan' NOT NULL
        CHECK (registration_method IN ('qr_scan', 'manual')),
    notes TEXT,

    CONSTRAINT unique_attendance UNIQUE (member_id, assembly_id)
);

COMMENT ON TABLE attendance_records IS 'Registros de asistencia de miembros a asambleas';

-- ============================================================================
-- TABLA 9: account_types (Módulo 2)
-- Description: Catalog of account types
-- ============================================================================

CREATE TABLE account_types (
    account_type_code VARCHAR(20) PRIMARY KEY,
    display_name VARCHAR(50) NOT NULL,
    description TEXT,
    is_visible_to_member BOOLEAN DEFAULT true NOT NULL,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_account_type_code_format CHECK (account_type_code ~ '^[a-z_]+$'),
    CONSTRAINT chk_display_name_not_empty CHECK (TRIM(display_name) != '')
);

COMMENT ON TABLE account_types IS 'Catálogo de tipos de cuenta disponibles en el sistema';
COMMENT ON COLUMN account_types.is_visible_to_member IS 'Si el miembro puede ver esta cuenta en su área personal';

-- Insertar tipos de cuenta predefinidos
INSERT INTO account_types (account_type_code, display_name, description, is_visible_to_member, display_order) VALUES
('savings', 'Ahorros', 'Cuenta de ahorros voluntarios', true, 1),
('contributions', 'Aportaciones', 'Cuenta de capital social (₡900/año)', true, 2),
('surplus', 'Excedentes', 'Distribución anual de excedentes', true, 3),
('affiliation', 'Afiliación', 'Cuenta de afiliación (no visible para miembros)', false, 4);

-- ============================================================================
-- TABLA 10: accounts ( Módulo 2)
-- Descripción: Cuentas individuales por miembro (4 tipos)
-- ============================================================================

CREATE TABLE accounts (
    account_id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(member_id) ON DELETE RESTRICT,
    cooperative_id INTEGER NOT NULL REFERENCES cooperatives(cooperative_id) ON DELETE RESTRICT,
    account_type VARCHAR(20) NOT NULL REFERENCES account_types(account_type_code),
    current_balance NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT unique_member_account_type UNIQUE (member_id, account_type),
    CONSTRAINT chk_balance_non_negative CHECK (current_balance >= 0.00)
);

COMMENT ON TABLE accounts IS 'Cuentas individuales de cada miembro (ahorros, aportaciones, excedentes, afiliación)';
COMMENT ON COLUMN accounts.current_balance IS 'Saldo actual calculado automáticamente por trigger';

-- ============================================================================
-- TABLA 11: transactions (Módulo 2)
-- Descripción: Movimientos de dinero en cuentas
-- ============================================================================

CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES accounts(account_id) ON DELETE RESTRICT,
    transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN (
        'deposit',              -- Depósito
        'withdrawal',           -- Retiro
        'adjustment',           -- Ajuste contable
        'transfer_in',          -- Transferencia entrante
        'transfer_out',         -- Transferencia saliente
        'surplus_distribution', -- Distribución de excedentes
        'liquidation'           -- Liquidación
    )),
    amount NUMERIC(12,2) NOT NULL,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    fiscal_year INTEGER NOT NULL,
    receipt_number VARCHAR(50),
    description TEXT,
    related_transaction_id INTEGER REFERENCES transactions(transaction_id),
    status VARCHAR(20) DEFAULT 'completed' NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_by INTEGER NOT NULL REFERENCES users(user_id),
    approved_by INTEGER REFERENCES users(user_id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_amount_positive CHECK (amount > 0.00)
);

COMMENT ON TABLE transactions IS 'Movimientos de dinero en las cuentas de los miembros';
COMMENT ON COLUMN transactions.fiscal_year IS 'Año fiscal calculado automáticamente por trigger';
COMMENT ON COLUMN transactions.receipt_number IS 'Número de recibo asociado a la transacción (generado manualmente o por sistema)';
COMMENT ON COLUMN transactions.related_transaction_id IS 'Para transferencias, apunta a la transacción relacionada';

-- ============================================================================
-- TABLA 12: contribution_periods (Módulo 2)
-- Descripción: Períodos de aportación (tractos) - ₡900/año en 3 tractos
-- ============================================================================

CREATE TABLE contribution_periods (
    period_id SERIAL PRIMARY KEY,
    cooperative_id INTEGER NOT NULL REFERENCES cooperatives(cooperative_id) ON DELETE RESTRICT,
    fiscal_year INTEGER NOT NULL,
    tract_number INTEGER NOT NULL CHECK (tract_number IN (1, 2, 3)),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    required_amount NUMERIC(12,2) DEFAULT 300.00 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT unique_fiscal_year_tract UNIQUE (cooperative_id, fiscal_year, tract_number),
    CONSTRAINT chk_date_range CHECK (end_date > start_date)
);

COMMENT ON TABLE contribution_periods IS 'Períodos de aportación (3 tractos por año fiscal)';
COMMENT ON COLUMN contribution_periods.required_amount IS 'Monto sugerido por tracto (₡300), total ₡900/año';

-- ============================================================================
-- TABLA 13: surplus_distributions (Módulo 2)
-- Descripción: Distribuciones anuales de excedentes
-- ============================================================================

CREATE TABLE surplus_distributions (
    distribution_id SERIAL PRIMARY KEY,
    cooperative_id INTEGER NOT NULL REFERENCES cooperatives(cooperative_id) ON DELETE RESTRICT,
    fiscal_year INTEGER NOT NULL,
    total_distributable_amount NUMERIC(12,2) NOT NULL,
    total_contributions NUMERIC(12,2) NOT NULL,
    distribution_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
    notes TEXT,
    created_by INTEGER NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT unique_cooperative_fiscal_year UNIQUE (cooperative_id, fiscal_year),
    CONSTRAINT chk_amounts_positive CHECK (
        total_distributable_amount > 0.00 AND total_contributions > 0.00
    )
);

COMMENT ON TABLE surplus_distributions IS 'Distribuciones anuales de excedentes proporcionales a aportaciones';
COMMENT ON COLUMN surplus_distributions.total_distributable_amount IS 'Monto total a distribuir (ingresado manualmente por admin)';
COMMENT ON COLUMN surplus_distributions.total_contributions IS 'Total de aportaciones del año para cálculo proporcional';

-- ============================================================================
-- TABLA 14: withdrawal_requests (Módulo 2)
-- Descripción: Solicitudes de retiro iniciadas por miembros
-- ============================================================================

CREATE TABLE withdrawal_requests (
    request_id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(member_id) ON DELETE RESTRICT,
    account_id INTEGER NOT NULL REFERENCES accounts(account_id) ON DELETE RESTRICT,
    requested_amount NUMERIC(12,2) NOT NULL,
    request_type VARCHAR(30) NOT NULL CHECK (request_type IN (
        'withdrawal',           -- Retiro de dinero
        'surplus_to_savings'    -- Transferir excedentes a ahorros
    )),
    status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN (
        'pending', 'approved', 'rejected', 'completed', 'cancelled'
    )),
    request_notes TEXT,
    admin_notes TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reviewed_by INTEGER REFERENCES users(user_id),
    reviewed_at TIMESTAMP,
    completed_transaction_id INTEGER REFERENCES transactions(transaction_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_requested_amount_positive CHECK (requested_amount > 0.00)
);

COMMENT ON TABLE withdrawal_requests IS 'Solicitudes de retiro o transferencia iniciadas por miembros';
COMMENT ON COLUMN withdrawal_requests.request_type IS 'withdrawal = retiro de dinero, surplus_to_savings = pasar excedentes a ahorros';

-- ============================================================================
-- TABLA 15: liquidations (Módulo 2)
-- Descripción: Liquidaciones de miembros (cada 6 años o al dejar cooperativa)
-- ============================================================================

CREATE TABLE liquidations (
    liquidation_id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(member_id) ON DELETE RESTRICT,
    cooperative_id INTEGER NOT NULL REFERENCES cooperatives(cooperative_id) ON DELETE RESTRICT,
    liquidation_type VARCHAR(20) NOT NULL CHECK (liquidation_type IN (
        'periodic',     -- Liquidación cada 6 años
        'exit'          -- Liquidación al dejar de ser miembro
    )),
    liquidation_date DATE NOT NULL,
    total_savings NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    total_contributions NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    total_surplus NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL,
    member_continues BOOLEAN NOT NULL,
    notes TEXT,
    processed_by INTEGER NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_total_amount CHECK (total_amount = total_savings + total_contributions + total_surplus)
);

COMMENT ON TABLE liquidations IS 'Liquidaciones de miembros cada 6 años o al salir de la cooperativa';
COMMENT ON COLUMN liquidations.member_continues IS 'TRUE si sigue como miembro después de liquidación, FALSE si sale';

-- ============================================================================
-- TABLA 16: receipts (Módulo 2)
-- Descripción: Recibos generados por transacciones
-- ============================================================================

CREATE TABLE receipts (
    receipt_id SERIAL PRIMARY KEY,
    cooperative_id INTEGER NOT NULL REFERENCES cooperatives(cooperative_id) ON DELETE RESTRICT,
    transaction_id INTEGER REFERENCES transactions(transaction_id),
    liquidation_id INTEGER REFERENCES liquidations(liquidation_id),
    receipt_number VARCHAR(20) UNIQUE NOT NULL,
    receipt_type VARCHAR(30) NOT NULL CHECK (receipt_type IN (
        'deposit',
        'withdrawal',
        'contribution',
        'surplus_distribution',
        'liquidation',
        'transfer'
    )),
    member_id INTEGER NOT NULL REFERENCES members(member_id),
    amount NUMERIC(12,2) NOT NULL,
    pdf_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_has_reference CHECK (
        (transaction_id IS NOT NULL AND liquidation_id IS NULL) OR
        (transaction_id IS NULL AND liquidation_id IS NOT NULL)
    ),
    CONSTRAINT chk_amount_positive CHECK (amount > 0.00)
);

COMMENT ON TABLE receipts IS 'Recibos generados automáticamente por transacciones y liquidaciones';
COMMENT ON COLUMN receipts.receipt_number IS 'Número único de recibo (formato: YYYY-NNNN)';

-- ============================================================================
-- TABLA 15: notifications (- Módulo 2)
-- Descripción: Notificaciones para administradores
-- ============================================================================

CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    notification_type VARCHAR(30) NOT NULL CHECK (notification_type IN (
        'withdrawal_request',
        'transfer_request',
        'liquidation_due',
        'contribution_overdue',
        'system_alert'
    )),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    related_entity_type VARCHAR(30),
    related_entity_id INTEGER,
    is_read BOOLEAN DEFAULT false NOT NULL,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_title_not_empty CHECK (TRIM(title) != ''),
    CONSTRAINT chk_message_not_empty CHECK (TRIM(message) != '')
);

COMMENT ON TABLE notifications IS 'Notificaciones para administradores sobre solicitudes y alertas';
COMMENT ON COLUMN notifications.related_entity_type IS 'Tipo de entidad relacionada (withdrawal_request, member, etc)';
COMMENT ON COLUMN notifications.related_entity_id IS 'ID de la entidad relacionada';
