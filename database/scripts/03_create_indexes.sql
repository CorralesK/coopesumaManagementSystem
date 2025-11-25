-- ============================================================================
-- Script: 03_create_indexes.sql
-- Descripción: Creación de índices para optimización de consultas
-- Proyecto: CoopeSuma Management System
-- Incluye: Módulo 1 (Asistencia) + Módulo 2 (Ahorros y Económico)
-- Base de datos: PostgreSQL 14+
-- ============================================================================

-- ============================================================================
-- ÍNDICES PARA TABLA: schools
-- ============================================================================

CREATE INDEX idx_schools_name ON schools(name);
COMMENT ON INDEX idx_schools_name IS 'Optimiza búsquedas por nombre de escuela';

-- ============================================================================
-- ÍNDICES PARA TABLA: cooperatives
-- ============================================================================

CREATE INDEX idx_cooperatives_school_id ON cooperatives(school_id);
COMMENT ON INDEX idx_cooperatives_school_id IS 'Optimiza JOIN con tabla schools';

CREATE INDEX idx_cooperatives_trade_name ON cooperatives(trade_name);
COMMENT ON INDEX idx_cooperatives_trade_name IS 'Optimiza búsquedas por nombre comercial';

-- ============================================================================
-- ÍNDICES PARA TABLA: users
-- ============================================================================

CREATE INDEX idx_users_cooperative_id ON users(cooperative_id);
COMMENT ON INDEX idx_users_cooperative_id IS 'Optimiza JOIN con tabla cooperatives';

CREATE INDEX idx_users_email ON users(email);
COMMENT ON INDEX idx_users_email IS 'Optimiza búsquedas por email durante login';

CREATE INDEX idx_users_microsoft_id ON users(microsoft_id);
COMMENT ON INDEX idx_users_microsoft_id IS 'Optimiza búsquedas por Microsoft ID durante autenticación OAuth';

CREATE INDEX idx_users_role ON users(role);
COMMENT ON INDEX idx_users_role IS 'Optimiza filtrado de usuarios por rol';

CREATE INDEX idx_users_is_active ON users(is_active);
COMMENT ON INDEX idx_users_is_active IS 'Optimiza filtrado de usuarios activos vs inactivos';

-- ============================================================================
-- ÍNDICES PARA TABLA: members
-- ============================================================================

CREATE INDEX idx_members_cooperative_id ON members(cooperative_id);
COMMENT ON INDEX idx_members_cooperative_id IS 'Optimiza JOIN con tabla cooperatives';

CREATE INDEX idx_members_identification ON members(identification);
COMMENT ON INDEX idx_members_identification IS 'Optimiza búsquedas por número de identificación';

CREATE INDEX idx_members_qr_hash ON members(qr_hash);
COMMENT ON INDEX idx_members_qr_hash IS 'Optimiza búsquedas por QR hash durante escaneo de asistencia';

CREATE INDEX idx_members_is_active ON members(is_active);
COMMENT ON INDEX idx_members_is_active IS 'Optimiza filtrado de miembros activos vs inactivos';

CREATE INDEX idx_members_full_name ON members(full_name);
COMMENT ON INDEX idx_members_full_name IS 'Optimiza búsquedas por nombre completo';

CREATE INDEX idx_members_institutional_email ON members(institutional_email)
    WHERE institutional_email IS NOT NULL;
COMMENT ON INDEX idx_members_institutional_email IS 'Optimiza búsquedas por correo institucional';

CREATE INDEX idx_members_affiliation_date ON members(affiliation_date);
COMMENT ON INDEX idx_members_affiliation_date IS 'Optimiza cálculos de liquidaciones por antigüedad';

CREATE INDEX idx_members_member_code ON members(member_code);
COMMENT ON INDEX idx_members_member_code IS 'Optimiza búsquedas por código de miembro';

CREATE INDEX idx_members_quality_id ON members(quality_id);
COMMENT ON INDEX idx_members_quality_id IS 'Optimiza filtrado por calidad de miembro (estudiante/funcionario)';

CREATE INDEX idx_members_level_id ON members(level_id);
COMMENT ON INDEX idx_members_level_id IS 'Optimiza filtrado por nivel educativo';

CREATE INDEX idx_members_gender ON members(gender);
COMMENT ON INDEX idx_members_gender IS 'Optimiza filtrado por género';

CREATE INDEX idx_members_user_id ON members(user_id);
COMMENT ON INDEX idx_members_user_id IS 'Optimiza búsquedas de miembros por usuario asociado';

-- ============================================================================
-- ÍNDICES PARA TABLAS DE CATÁLOGO
-- ============================================================================

CREATE INDEX idx_member_qualities_quality_code ON member_qualities(quality_code);
COMMENT ON INDEX idx_member_qualities_quality_code IS 'Optimiza búsqueda por código de calidad';

CREATE INDEX idx_member_levels_level_code ON member_levels(level_code);
COMMENT ON INDEX idx_member_levels_level_code IS 'Optimiza búsqueda por código de nivel';

CREATE INDEX idx_member_levels_quality_code ON member_levels(applies_to_quality_code);
COMMENT ON INDEX idx_member_levels_quality_code IS 'Optimiza búsqueda de niveles por calidad';

-- ============================================================================
-- ÍNDICES PARA TABLA: assemblies
-- ============================================================================

CREATE INDEX idx_assemblies_cooperative_id ON assemblies(cooperative_id);
COMMENT ON INDEX idx_assemblies_cooperative_id IS 'Optimiza JOIN con tabla cooperatives';

CREATE INDEX idx_assemblies_scheduled_date ON assemblies(scheduled_date);
COMMENT ON INDEX idx_assemblies_scheduled_date IS 'Optimiza ordenamiento y filtrado por fecha programada';

CREATE INDEX idx_assemblies_is_active ON assemblies(is_active);
COMMENT ON INDEX idx_assemblies_is_active IS 'Optimiza búsqueda de asamblea activa';

CREATE UNIQUE INDEX idx_assemblies_single_active ON assemblies(cooperative_id, is_active)
    WHERE is_active = true;
COMMENT ON INDEX idx_assemblies_single_active IS
'Garantiza que solo una asamblea pueda estar activa simultáneamente por cooperativa';

CREATE INDEX idx_assemblies_created_by ON assemblies(created_by);
COMMENT ON INDEX idx_assemblies_created_by IS 'Optimiza filtrado de asambleas por usuario creador';

-- ============================================================================
-- ÍNDICES PARA TABLA: attendance_records
-- ============================================================================

CREATE INDEX idx_attendance_member_id ON attendance_records(member_id);
COMMENT ON INDEX idx_attendance_member_id IS 'Optimiza búsqueda de historial de asistencia por miembro';

CREATE INDEX idx_attendance_assembly_id ON attendance_records(assembly_id);
COMMENT ON INDEX idx_attendance_assembly_id IS 'Optimiza búsqueda de asistencia por asamblea';

CREATE INDEX idx_attendance_registered_at ON attendance_records(registered_at);
COMMENT ON INDEX idx_attendance_registered_at IS 'Optimiza ordenamiento por fecha de registro';

CREATE INDEX idx_attendance_registered_by ON attendance_records(registered_by);
COMMENT ON INDEX idx_attendance_registered_by IS 'Optimiza filtrado por usuario que registró la asistencia';

CREATE INDEX idx_attendance_method ON attendance_records(registration_method);
COMMENT ON INDEX idx_attendance_method IS 'Optimiza filtrado por método de registro';

-- ============================================================================
-- ÍNDICES PARA TABLA: accounts (Módulo 2)
-- ============================================================================

CREATE INDEX idx_accounts_member_id ON accounts(member_id);
COMMENT ON INDEX idx_accounts_member_id IS 'Optimiza búsqueda de cuentas por miembro';

CREATE INDEX idx_accounts_cooperative_id ON accounts(cooperative_id);
COMMENT ON INDEX idx_accounts_cooperative_id IS 'Optimiza JOIN con tabla cooperatives';

CREATE INDEX idx_accounts_account_type ON accounts(account_type);
COMMENT ON INDEX idx_accounts_account_type IS 'Optimiza filtrado por tipo de cuenta';

CREATE INDEX idx_accounts_member_type ON accounts(member_id, account_type);
COMMENT ON INDEX idx_accounts_member_type IS 'Optimiza búsqueda de cuenta específica de un miembro';

-- ============================================================================
-- ÍNDICES PARA TABLA: transactions (Módulo 2)
-- ============================================================================

CREATE INDEX idx_transactions_account_id ON transactions(account_id);
COMMENT ON INDEX idx_transactions_account_id IS 'Optimiza búsqueda de transacciones por cuenta';

CREATE INDEX idx_transactions_date ON transactions(transaction_date);
COMMENT ON INDEX idx_transactions_date IS 'Optimiza ordenamiento por fecha';

CREATE INDEX idx_transactions_fiscal_year ON transactions(fiscal_year);
COMMENT ON INDEX idx_transactions_fiscal_year IS 'Optimiza filtrado por año fiscal';

CREATE INDEX idx_transactions_type ON transactions(transaction_type);
COMMENT ON INDEX idx_transactions_type IS 'Optimiza filtrado por tipo de transacción';

CREATE INDEX idx_transactions_status ON transactions(status);
COMMENT ON INDEX idx_transactions_status IS 'Optimiza filtrado por estado';

CREATE INDEX idx_transactions_created_by ON transactions(created_by);
COMMENT ON INDEX idx_transactions_created_by IS 'Optimiza auditoría por usuario';

CREATE INDEX idx_transactions_account_date ON transactions(account_id, transaction_date);
COMMENT ON INDEX idx_transactions_account_date IS 'Optimiza consultas de historial de cuenta por fecha';

CREATE INDEX idx_transactions_fiscal_account ON transactions(fiscal_year, account_id);
COMMENT ON INDEX idx_transactions_fiscal_account IS 'Optimiza reportes anuales por cuenta';

CREATE INDEX idx_transactions_receipt_number ON transactions(receipt_number)
    WHERE receipt_number IS NOT NULL;
COMMENT ON INDEX idx_transactions_receipt_number IS 'Optimiza búsqueda de transacciones por número de recibo';

-- ============================================================================
-- ÍNDICES PARA TABLA: contribution_periods (Módulo 2)
-- ============================================================================

CREATE INDEX idx_contribution_periods_cooperative_id ON contribution_periods(cooperative_id);
COMMENT ON INDEX idx_contribution_periods_cooperative_id IS 'Optimiza JOIN con cooperativas';

CREATE INDEX idx_contribution_periods_fiscal_year ON contribution_periods(fiscal_year);
COMMENT ON INDEX idx_contribution_periods_fiscal_year IS 'Optimiza búsqueda por año fiscal';

CREATE INDEX idx_contribution_periods_dates ON contribution_periods(start_date, end_date);
COMMENT ON INDEX idx_contribution_periods_dates IS 'Optimiza búsqueda de período activo';

-- ============================================================================
-- ÍNDICES PARA TABLA: surplus_distributions (Módulo 2)
-- ============================================================================

CREATE INDEX idx_surplus_distributions_cooperative_id ON surplus_distributions(cooperative_id);
COMMENT ON INDEX idx_surplus_distributions_cooperative_id IS 'Optimiza JOIN con cooperativas';

CREATE INDEX idx_surplus_distributions_fiscal_year ON surplus_distributions(fiscal_year);
COMMENT ON INDEX idx_surplus_distributions_fiscal_year IS 'Optimiza búsqueda por año fiscal';

CREATE INDEX idx_surplus_distributions_status ON surplus_distributions(status);
COMMENT ON INDEX idx_surplus_distributions_status IS 'Optimiza filtrado por estado de distribución';

CREATE INDEX idx_surplus_distributions_date ON surplus_distributions(distribution_date);
COMMENT ON INDEX idx_surplus_distributions_date IS 'Optimiza ordenamiento por fecha';

-- ============================================================================
-- ÍNDICES PARA TABLA: withdrawal_requests (Módulo 2)
-- ============================================================================

CREATE INDEX idx_withdrawal_requests_member_id ON withdrawal_requests(member_id);
COMMENT ON INDEX idx_withdrawal_requests_member_id IS 'Optimiza búsqueda de solicitudes por miembro';

CREATE INDEX idx_withdrawal_requests_account_id ON withdrawal_requests(account_id);
COMMENT ON INDEX idx_withdrawal_requests_account_id IS 'Optimiza búsqueda de solicitudes por cuenta';

CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status);
COMMENT ON INDEX idx_withdrawal_requests_status IS 'Optimiza filtrado por estado (pending, approved, etc)';

CREATE INDEX idx_withdrawal_requests_requested_at ON withdrawal_requests(requested_at);
COMMENT ON INDEX idx_withdrawal_requests_requested_at IS 'Optimiza ordenamiento por fecha de solicitud';

CREATE INDEX idx_withdrawal_requests_reviewed_by ON withdrawal_requests(reviewed_by);
COMMENT ON INDEX idx_withdrawal_requests_reviewed_by IS 'Optimiza auditoría por revisor';

CREATE INDEX idx_withdrawal_requests_pending ON withdrawal_requests(status, requested_at)
    WHERE status = 'pending';
COMMENT ON INDEX idx_withdrawal_requests_pending IS 'Optimiza búsqueda de solicitudes pendientes';

-- ============================================================================
-- ÍNDICES PARA TABLA: liquidations (Módulo 2)
-- ============================================================================

CREATE INDEX idx_liquidations_member_id ON liquidations(member_id);
COMMENT ON INDEX idx_liquidations_member_id IS 'Optimiza búsqueda de liquidaciones por miembro';

CREATE INDEX idx_liquidations_cooperative_id ON liquidations(cooperative_id);
COMMENT ON INDEX idx_liquidations_cooperative_id IS 'Optimiza JOIN con cooperativas';

CREATE INDEX idx_liquidations_type ON liquidations(liquidation_type);
COMMENT ON INDEX idx_liquidations_type IS 'Optimiza filtrado por tipo de liquidación';

CREATE INDEX idx_liquidations_date ON liquidations(liquidation_date);
COMMENT ON INDEX idx_liquidations_date IS 'Optimiza ordenamiento por fecha';

CREATE INDEX idx_liquidations_processed_by ON liquidations(processed_by);
COMMENT ON INDEX idx_liquidations_processed_by IS 'Optimiza auditoría por procesador';

-- ============================================================================
-- ÍNDICES PARA TABLA: receipts (Módulo 2)
-- ============================================================================

CREATE INDEX idx_receipts_cooperative_id ON receipts(cooperative_id);
COMMENT ON INDEX idx_receipts_cooperative_id IS 'Optimiza JOIN con cooperativas';

CREATE INDEX idx_receipts_transaction_id ON receipts(transaction_id);
COMMENT ON INDEX idx_receipts_transaction_id IS 'Optimiza búsqueda de recibo por transacción';

CREATE INDEX idx_receipts_liquidation_id ON receipts(liquidation_id);
COMMENT ON INDEX idx_receipts_liquidation_id IS 'Optimiza búsqueda de recibo por liquidación';

CREATE INDEX idx_receipts_member_id ON receipts(member_id);
COMMENT ON INDEX idx_receipts_member_id IS 'Optimiza búsqueda de recibos por miembro';

CREATE INDEX idx_receipts_receipt_number ON receipts(receipt_number);
COMMENT ON INDEX idx_receipts_receipt_number IS 'Optimiza búsqueda por número de recibo';

CREATE INDEX idx_receipts_created_at ON receipts(created_at);
COMMENT ON INDEX idx_receipts_created_at IS 'Optimiza ordenamiento por fecha de creación';

CREATE INDEX idx_receipts_type_date ON receipts(receipt_type, created_at);
COMMENT ON INDEX idx_receipts_type_date IS 'Optimiza reportes de recibos por tipo y fecha';

-- ============================================================================
-- ÍNDICES PARA TABLA: notifications (Módulo 2)
-- ============================================================================

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
COMMENT ON INDEX idx_notifications_user_id IS 'Optimiza búsqueda de notificaciones por usuario';

CREATE INDEX idx_notifications_type ON notifications(notification_type);
COMMENT ON INDEX idx_notifications_type IS 'Optimiza filtrado por tipo de notificación';

CREATE INDEX idx_notifications_is_read ON notifications(is_read);
COMMENT ON INDEX idx_notifications_is_read IS 'Optimiza filtrado por estado de lectura';

CREATE INDEX idx_notifications_created_at ON notifications(created_at);
COMMENT ON INDEX idx_notifications_created_at IS 'Optimiza ordenamiento por fecha de creación';

CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read, created_at)
    WHERE is_read = false;
COMMENT ON INDEX idx_notifications_unread IS 'Optimiza consulta de notificaciones no leídas';

CREATE INDEX idx_notifications_related_entity ON notifications(related_entity_type, related_entity_id);
COMMENT ON INDEX idx_notifications_related_entity IS 'Optimiza búsqueda por entidad relacionada';
