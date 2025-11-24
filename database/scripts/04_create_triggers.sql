-- ============================================================================
-- Script: 04_create_triggers.sql
-- Descripción: Creación de triggers para automatización y reglas de negocio
-- Proyecto: CoopeSuma Management System
-- Incluye: Módulo 1 (Asistencia) + Módulo 2 (Ahorros y Económico)
-- Base de datos: PostgreSQL 14+
-- ============================================================================

-- ============================================================================
-- TRIGGERS PARA TABLA: schools
-- ============================================================================

CREATE TRIGGER update_schools_updated_at
    BEFORE UPDATE ON schools
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_schools_updated_at ON schools IS
'Actualiza automáticamente el campo updated_at antes de cada UPDATE';

-- ============================================================================
-- TRIGGERS PARA TABLA: cooperatives
-- ============================================================================

CREATE TRIGGER update_cooperatives_updated_at
    BEFORE UPDATE ON cooperatives
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_cooperatives_updated_at ON cooperatives IS
'Actualiza automáticamente el campo updated_at antes de cada UPDATE';

-- ============================================================================
-- TRIGGERS PARA TABLA: users
-- ============================================================================

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_users_updated_at ON users IS
'Actualiza automáticamente el campo updated_at antes de cada UPDATE';

-- ============================================================================
-- TRIGGERS PARA TABLA: members
-- ============================================================================

CREATE TRIGGER update_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_members_updated_at ON members IS
'Actualiza automáticamente el campo updated_at antes de cada UPDATE';

-- ============================================================================
-- FUNCIÓN Y TRIGGER: Validar que level_id corresponda a quality_id
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_member_level_quality()
RETURNS TRIGGER AS $$
DECLARE
    v_quality_code VARCHAR(20);
    v_level_quality_code VARCHAR(20);
BEGIN
    -- Get quality code
    SELECT quality_code INTO v_quality_code
    FROM member_qualities
    WHERE quality_id = NEW.quality_id;

    -- If level_id is provided, validate it applies to this quality
    IF NEW.level_id IS NOT NULL THEN
        SELECT applies_to_quality_code INTO v_level_quality_code
        FROM member_levels
        WHERE level_id = NEW.level_id;

        IF v_level_quality_code != v_quality_code THEN
            RAISE EXCEPTION 'El nivel educativo seleccionado no corresponde a la calidad del miembro';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_member_level_quality() IS
'Valida que el nivel educativo (level_id) corresponda a la calidad del miembro (quality_id)';

CREATE TRIGGER validate_member_level_quality_trigger
    BEFORE INSERT OR UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION validate_member_level_quality();

COMMENT ON TRIGGER validate_member_level_quality_trigger ON members IS
'Valida que el nivel educativo sea apropiado para la calidad del miembro (ej: funcionario no puede tener grado escolar)';

-- ============================================================================
-- TRIGGERS PARA TABLAS DE CATÁLOGO
-- ============================================================================

CREATE TRIGGER update_member_qualities_updated_at
    BEFORE UPDATE ON member_qualities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_member_qualities_updated_at ON member_qualities IS
'Actualiza automáticamente el campo updated_at antes de cada UPDATE';

CREATE TRIGGER update_member_levels_updated_at
    BEFORE UPDATE ON member_levels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_member_levels_updated_at ON member_levels IS
'Actualiza automáticamente el campo updated_at antes de cada UPDATE';

-- ============================================================================
-- TRIGGERS PARA TABLA: assemblies
-- ============================================================================

CREATE TRIGGER update_assemblies_updated_at
    BEFORE UPDATE ON assemblies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_assemblies_updated_at ON assemblies IS
'Actualiza automáticamente el campo updated_at antes de cada UPDATE';

CREATE TRIGGER ensure_single_active_assembly
    BEFORE INSERT OR UPDATE ON assemblies
    FOR EACH ROW
    WHEN (NEW.is_active = true)
    EXECUTE FUNCTION deactivate_other_assemblies();

COMMENT ON TRIGGER ensure_single_active_assembly ON assemblies IS
'Garantiza que solo una asamblea esté activa simultáneamente';

-- ============================================================================
-- TRIGGERS PARA TABLA: accounts (NUEVO - Módulo 2)
-- ============================================================================

CREATE TRIGGER update_accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_accounts_updated_at ON accounts IS
'Actualiza automáticamente el campo updated_at antes de cada UPDATE';

-- ============================================================================
-- FUNCIÓN Y TRIGGER: Calcular año fiscal automáticamente
-- ============================================================================

CREATE OR REPLACE FUNCTION set_transaction_fiscal_year()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fiscal_year := get_fiscal_year(NEW.transaction_date);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION set_transaction_fiscal_year() IS
'Calcula y asigna automáticamente el año fiscal basado en la fecha de transacción';

CREATE TRIGGER set_transaction_fiscal_year_trigger
    BEFORE INSERT OR UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION set_transaction_fiscal_year();

COMMENT ON TRIGGER set_transaction_fiscal_year_trigger ON transactions IS
'Asigna automáticamente el año fiscal antes de insertar o actualizar transacción';

-- ============================================================================
-- FUNCIÓN Y TRIGGER: Actualizar saldo de cuenta después de transacción
-- ============================================================================

CREATE OR REPLACE FUNCTION update_account_balance_after_transaction()
RETURNS TRIGGER AS $$
DECLARE
    v_new_balance NUMERIC(12,2);
BEGIN
    -- Solo actualizar si la transacción está completada
    IF NEW.status = 'completed' AND (TG_OP = 'INSERT' OR OLD.status != 'completed') THEN
        -- Recalcular el saldo de la cuenta
        v_new_balance := calculate_account_balance(NEW.account_id);
        
        -- Actualizar el saldo en la tabla accounts
        UPDATE accounts
        SET current_balance = v_new_balance,
            updated_at = CURRENT_TIMESTAMP
        WHERE account_id = NEW.account_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_account_balance_after_transaction() IS
'Recalcula y actualiza el saldo de una cuenta después de una transacción completada';

CREATE TRIGGER update_account_balance_trigger
    AFTER INSERT OR UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_account_balance_after_transaction();

COMMENT ON TRIGGER update_account_balance_trigger ON transactions IS
'Actualiza el saldo de la cuenta automáticamente después de cada transacción completada';

-- ============================================================================
-- FUNCIÓN Y TRIGGER: Validar año fiscal no cerrado antes de insertar transacción
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_fiscal_year_not_closed()
RETURNS TRIGGER AS $$
DECLARE
    v_fiscal_year INTEGER;
BEGIN
    v_fiscal_year := get_fiscal_year(NEW.transaction_date);
    
    IF is_fiscal_year_closed(v_fiscal_year) THEN
        RAISE EXCEPTION 'No se pueden registrar transacciones en el año fiscal % porque ya está cerrado (cerró el 30 de septiembre de %)',
            v_fiscal_year, v_fiscal_year + 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_fiscal_year_not_closed() IS
'Valida que el año fiscal no esté cerrado antes de permitir una transacción';

CREATE TRIGGER validate_fiscal_year_trigger
    BEFORE INSERT OR UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION validate_fiscal_year_not_closed();

COMMENT ON TRIGGER validate_fiscal_year_trigger ON transactions IS
'Impide registrar transacciones en años fiscales cerrados (después del 30 de septiembre del año siguiente)';

-- ============================================================================
-- TRIGGERS PARA TABLA: transactions
-- ============================================================================

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_transactions_updated_at ON transactions IS
'Actualiza automáticamente el campo updated_at antes de cada UPDATE';

-- ============================================================================
-- TRIGGERS PARA TABLA: contribution_periods
-- ============================================================================

CREATE TRIGGER update_contribution_periods_updated_at
    BEFORE UPDATE ON contribution_periods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_contribution_periods_updated_at ON contribution_periods IS
'Actualiza automáticamente el campo updated_at antes de cada UPDATE';

-- ============================================================================
-- TRIGGERS PARA TABLA: surplus_distributions
-- ============================================================================

CREATE TRIGGER update_surplus_distributions_updated_at
    BEFORE UPDATE ON surplus_distributions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_surplus_distributions_updated_at ON surplus_distributions IS
'Actualiza automáticamente el campo updated_at antes de cada UPDATE';

-- ============================================================================
-- TRIGGERS PARA TABLA: withdrawal_requests
-- ============================================================================

CREATE TRIGGER update_withdrawal_requests_updated_at
    BEFORE UPDATE ON withdrawal_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_withdrawal_requests_updated_at ON withdrawal_requests IS
'Actualiza automáticamente el campo updated_at antes de cada UPDATE';

-- ============================================================================
-- FUNCIÓN Y TRIGGER: Crear notificación cuando hay nueva solicitud de retiro
-- ============================================================================

CREATE OR REPLACE FUNCTION create_withdrawal_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_member_name VARCHAR(100);
    v_account_type VARCHAR(20);
    v_admin_ids INTEGER[];
BEGIN
    -- Solo crear notificación para nuevas solicitudes pendientes
    IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
        -- Obtener nombre del miembro
        SELECT full_name INTO v_member_name
        FROM members
        WHERE member_id = NEW.member_id;
        
        -- Obtener tipo de cuenta
        SELECT account_type INTO v_account_type
        FROM accounts
        WHERE account_id = NEW.account_id;
        
        -- Obtener IDs de todos los administradores activos de la misma cooperativa
        SELECT ARRAY_AGG(user_id) INTO v_admin_ids
        FROM users u
        JOIN accounts a ON a.member_id = (SELECT member_id FROM accounts WHERE account_id = NEW.account_id)
        WHERE u.cooperative_id = (SELECT cooperative_id FROM members WHERE member_id = NEW.member_id)
        AND u.role = 'administrator'
        AND u.is_active = true;
        
        -- Crear notificación para cada administrador
        IF v_admin_ids IS NOT NULL THEN
            INSERT INTO notifications (
                user_id,
                notification_type,
                title,
                message,
                related_entity_type,
                related_entity_id
            )
            SELECT
                unnest(v_admin_ids),
                CASE 
                    WHEN NEW.request_type = 'withdrawal' THEN 'withdrawal_request'
                    WHEN NEW.request_type = 'surplus_to_savings' THEN 'transfer_request'
                END,
                CASE 
                    WHEN NEW.request_type = 'withdrawal' THEN 'Nueva solicitud de retiro'
                    WHEN NEW.request_type = 'surplus_to_savings' THEN 'Nueva solicitud de transferencia'
                END,
                v_member_name || ' ha solicitado ' ||
                CASE 
                    WHEN NEW.request_type = 'withdrawal' THEN 'retirar ₡' || NEW.requested_amount || ' de su cuenta de '
                    WHEN NEW.request_type = 'surplus_to_savings' THEN 'transferir ₡' || NEW.requested_amount || ' de excedentes a ahorros'
                END ||
                CASE v_account_type
                    WHEN 'savings' THEN 'ahorros'
                    WHEN 'contributions' THEN 'aportaciones'
                    WHEN 'surplus' THEN 'excedentes'
                    ELSE v_account_type
                END,
                'withdrawal_request',
                NEW.request_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_withdrawal_notification() IS
'Crea notificaciones para administradores cuando hay una nueva solicitud de retiro o transferencia';

CREATE TRIGGER create_withdrawal_notification_trigger
    AFTER INSERT ON withdrawal_requests
    FOR EACH ROW
    EXECUTE FUNCTION create_withdrawal_notification();

COMMENT ON TRIGGER create_withdrawal_notification_trigger ON withdrawal_requests IS
'Notifica a los administradores sobre nuevas solicitudes de retiro o transferencia';

-- ============================================================================
-- TRIGGERS PARA TABLA: liquidations
-- ============================================================================

CREATE TRIGGER update_liquidations_updated_at
    BEFORE UPDATE ON liquidations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_liquidations_updated_at ON liquidations IS
'Actualiza automáticamente el campo updated_at antes de cada UPDATE';
