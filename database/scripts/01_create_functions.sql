-- ============================================================================
-- Script: 01_create_functions.sql
-- Description: Utility functions for CoopeSuma Management System
-- Project: CoopeSuma Management System
-- Database: PostgreSQL 14+
-- ============================================================================

-- ============================================================================
-- FUNCTION: update_updated_at_column()
-- Description: Generic trigger function to automatically update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS
'Generic trigger function to automatically update updated_at timestamp before UPDATE';

-- ============================================================================
-- FUNCTION: deactivate_other_assemblies()
-- Description: Ensures only one assembly can be active at a time
-- ============================================================================

CREATE OR REPLACE FUNCTION deactivate_other_assemblies()
RETURNS TRIGGER AS $$
BEGIN
    -- Deactivate all other assemblies in the same cooperative
    UPDATE assemblies
    SET is_active = false,
        updated_at = CURRENT_TIMESTAMP
    WHERE cooperative_id = NEW.cooperative_id
    AND assembly_id != NEW.assembly_id
    AND is_active = true;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION deactivate_other_assemblies() IS
'Deactivates all other assemblies when a new one is activated (ensures single active assembly)';

-- ============================================================================
-- FUNCTION: get_fiscal_year()
-- Description: Calculates fiscal year based on transaction date
-- Fiscal year runs from October 1 to September 30 of following year
-- ============================================================================

CREATE OR REPLACE FUNCTION get_fiscal_year(transaction_date DATE)
RETURNS INTEGER AS $$
BEGIN
    -- If month is January-September (1-9), fiscal year is previous year
    -- If month is October-December (10-12), fiscal year is current year
    IF EXTRACT(MONTH FROM transaction_date) <= 9 THEN
        RETURN EXTRACT(YEAR FROM transaction_date) - 1;
    ELSE
        RETURN EXTRACT(YEAR FROM transaction_date);
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION get_fiscal_year(DATE) IS
'Calculates fiscal year from transaction date (fiscal year: Oct 1 - Sep 30)';

-- ============================================================================
-- FUNCTION: is_fiscal_year_closed()
-- Description: Checks if a fiscal year is closed (past September 30)
-- ============================================================================

CREATE OR REPLACE FUNCTION is_fiscal_year_closed(fiscal_year INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN CURRENT_DATE > make_date(fiscal_year + 1, 9, 30);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION is_fiscal_year_closed(INTEGER) IS
'Returns TRUE if fiscal year is closed (after September 30 of following year)';

-- ============================================================================
-- FUNCTION: calculate_account_balance()
-- Description: Calculates current balance for an account from all completed transactions
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_account_balance(p_account_id INTEGER)
RETURNS NUMERIC(12,2) AS $$
DECLARE
    v_balance NUMERIC(12,2);
BEGIN
    SELECT COALESCE(SUM(
        CASE
            WHEN transaction_type = 'deposit' THEN amount
            WHEN transaction_type = 'withdrawal' THEN -amount
            WHEN transaction_type = 'adjustment' THEN amount
            WHEN transaction_type = 'transfer_in' THEN amount
            WHEN transaction_type = 'transfer_out' THEN -amount
            WHEN transaction_type = 'surplus_distribution' THEN amount
            WHEN transaction_type = 'liquidation' THEN -amount
            ELSE 0
        END
    ), 0.00) INTO v_balance
    FROM transactions
    WHERE account_id = p_account_id
    AND status = 'completed';

    RETURN v_balance;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION calculate_account_balance(INTEGER) IS
'Calculates current account balance from all completed transactions';

-- ============================================================================
-- FUNCTION: validate_sufficient_balance()
-- Description: Checks if account has sufficient balance for withdrawal
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_sufficient_balance(
    p_account_id INTEGER,
    p_amount NUMERIC(12,2)
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_balance NUMERIC(12,2);
BEGIN
    v_current_balance := calculate_account_balance(p_account_id);
    RETURN v_current_balance >= p_amount;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION validate_sufficient_balance(INTEGER, NUMERIC) IS
'Returns TRUE if account has sufficient balance for specified amount';

-- ============================================================================
-- FUNCTION: get_member_contribution_total()
-- Description: Gets total contributions for a member in a specific fiscal year
-- ============================================================================

CREATE OR REPLACE FUNCTION get_member_contribution_total(
    p_member_id INTEGER,
    p_fiscal_year INTEGER
)
RETURNS NUMERIC(12,2) AS $$
DECLARE
    v_total NUMERIC(12,2);
    v_account_id INTEGER;
BEGIN
    -- Get contributions account for member
    SELECT account_id INTO v_account_id
    FROM accounts
    WHERE member_id = p_member_id
    AND account_type = 'contributions';

    IF v_account_id IS NULL THEN
        RETURN 0.00;
    END IF;

    -- Sum deposits in contributions account for fiscal year
    SELECT COALESCE(SUM(amount), 0.00) INTO v_total
    FROM transactions
    WHERE account_id = v_account_id
    AND transaction_type = 'deposit'
    AND status = 'completed'
    AND get_fiscal_year(transaction_date) = p_fiscal_year;

    RETURN v_total;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_member_contribution_total(INTEGER, INTEGER) IS
'Returns total contributions deposited by member in specified fiscal year';

-- ============================================================================
-- FUNCTION: generate_receipt_number()
-- Description: Generates sequential receipt number for cooperative (format: YYYY-NNNN)
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_receipt_number(p_cooperative_id INTEGER)
RETURNS VARCHAR(20) AS $$
DECLARE
    v_year INTEGER;
    v_sequence INTEGER;
    v_receipt_number VARCHAR(20);
BEGIN
    v_year := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;

    -- Get next sequence number for current year
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(receipt_number FROM POSITION('-' IN receipt_number) + 1) AS INTEGER)
    ), 0) + 1 INTO v_sequence
    FROM receipts
    WHERE cooperative_id = p_cooperative_id
    AND EXTRACT(YEAR FROM created_at) = v_year;

    -- Format: YYYY-NNNN (e.g., 2025-0001)
    v_receipt_number := v_year || '-' || LPAD(v_sequence::TEXT, 4, '0');

    RETURN v_receipt_number;
END;
$$ LANGUAGE plpgsql VOLATILE;

COMMENT ON FUNCTION generate_receipt_number(INTEGER) IS
'Generates sequential receipt number in format YYYY-NNNN for cooperative';
