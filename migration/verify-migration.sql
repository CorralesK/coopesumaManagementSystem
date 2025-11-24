-- ============================================================================
-- SQL Script para Verificar la Migración
-- Ejecutar DESPUÉS de completar la migración
-- ============================================================================

-- 1. Verificar total de miembros
SELECT
    '1. Total de Miembros' as verificacion,
    COUNT(*) as total
FROM members;

-- 2. Verificar cuentas por tipo
SELECT
    '2. Cuentas por Tipo' as verificacion,
    account_type,
    COUNT(*) as cantidad
FROM accounts
GROUP BY account_type
ORDER BY account_type;

-- 3. Verificar transacciones por tipo
SELECT
    '3. Transacciones por Tipo' as verificacion,
    transaction_type,
    COUNT(*) as cantidad,
    CONCAT('₡', TO_CHAR(SUM(amount), 'FM999,999,990.00')) as total
FROM transactions
GROUP BY transaction_type
ORDER BY transaction_type;

-- 4. Verificar saldos por tipo de cuenta
SELECT
    '4. Saldos por Tipo de Cuenta' as verificacion,
    a.account_type,
    COUNT(*) as cuentas_con_saldo,
    CONCAT('₡', TO_CHAR(SUM(a.current_balance), 'FM999,999,990.00')) as total_saldo,
    CONCAT('₡', TO_CHAR(AVG(a.current_balance), 'FM999,990.00')) as promedio
FROM accounts a
WHERE a.current_balance > 0
GROUP BY a.account_type
ORDER BY a.account_type;

-- 5. Top 10 miembros con mayor ahorro
SELECT
    '5. Top 10 Ahorros' as verificacion,
    m.identification,
    m.full_name,
    CONCAT('₡', TO_CHAR(a.current_balance, 'FM999,999,990.00')) as saldo
FROM members m
JOIN accounts a ON m.member_id = a.member_id
WHERE a.account_type = 'savings'
ORDER BY a.current_balance DESC
LIMIT 10;

-- 6. Top 10 miembros con mayores aportaciones
SELECT
    '6. Top 10 Aportaciones' as verificacion,
    m.identification,
    m.full_name,
    CONCAT('₡', TO_CHAR(a.current_balance, 'FM999,999,990.00')) as saldo
FROM members m
JOIN accounts a ON m.member_id = a.member_id
WHERE a.account_type = 'contributions'
ORDER BY a.current_balance DESC
LIMIT 10;

-- 7. Transacciones por año fiscal
SELECT
    '7. Transacciones por Año Fiscal' as verificacion,
    fiscal_year,
    COUNT(*) as cantidad,
    CONCAT('₡', TO_CHAR(SUM(amount), 'FM999,999,990.00')) as total
FROM transactions
GROUP BY fiscal_year
ORDER BY fiscal_year;

-- 8. Transacciones de ahorros por mes (2025)
SELECT
    '8. Ahorros por Mes (2025)' as verificacion,
    EXTRACT(MONTH FROM transaction_date) as mes,
    COUNT(*) as cantidad,
    CONCAT('₡', TO_CHAR(SUM(amount), 'FM999,999,990.00')) as total
FROM transactions t
JOIN accounts a ON t.account_id = a.account_id
WHERE a.account_type = 'savings'
AND EXTRACT(YEAR FROM transaction_date) = 2025
GROUP BY EXTRACT(MONTH FROM transaction_date)
ORDER BY mes;

-- 9. Aportaciones por año y tracto
SELECT
    '9. Aportaciones por Año' as verificacion,
    fiscal_year,
    COUNT(*) as cantidad_tractos,
    CONCAT('₡', TO_CHAR(SUM(amount), 'FM999,999,990.00')) as total
FROM transactions t
JOIN accounts a ON t.account_id = a.account_id
WHERE a.account_type = 'contributions'
GROUP BY fiscal_year
ORDER BY fiscal_year;

-- 10. Miembros sin transacciones (posible error)
SELECT
    '10. Miembros Sin Transacciones' as verificacion,
    m.identification,
    m.full_name,
    m.affiliation_date
FROM members m
WHERE NOT EXISTS (
    SELECT 1
    FROM transactions t
    JOIN accounts a ON t.account_id = a.account_id
    WHERE a.member_id = m.member_id
)
ORDER BY m.full_name;

-- 11. Cuentas con saldo negativo (error crítico)
SELECT
    '11. Cuentas con Saldo Negativo (ERROR)' as verificacion,
    m.identification,
    m.full_name,
    a.account_type,
    a.current_balance
FROM accounts a
JOIN members m ON a.member_id = m.member_id
WHERE a.current_balance < 0;

-- 12. Verificar integridad: balance = suma de transacciones
SELECT
    '12. Verificación de Integridad' as verificacion,
    a.account_id,
    m.full_name,
    a.account_type,
    CONCAT('₡', TO_CHAR(a.current_balance, 'FM999,990.00')) as saldo_cuenta,
    CONCAT('₡', TO_CHAR(COALESCE(SUM(
        CASE
            WHEN t.transaction_type IN ('deposit', 'transfer_in', 'surplus_distribution') THEN t.amount
            WHEN t.transaction_type IN ('withdrawal', 'transfer_out', 'liquidation') THEN -t.amount
            ELSE 0
        END
    ), 0), 'FM999,990.00')) as suma_transacciones,
    CASE
        WHEN a.current_balance = COALESCE(SUM(
            CASE
                WHEN t.transaction_type IN ('deposit', 'transfer_in', 'surplus_distribution') THEN t.amount
                WHEN t.transaction_type IN ('withdrawal', 'transfer_out', 'liquidation') THEN -t.amount
                ELSE 0
            END
        ), 0) THEN '✅ OK'
        ELSE '❌ ERROR'
    END as estado
FROM accounts a
JOIN members m ON a.member_id = m.member_id
LEFT JOIN transactions t ON a.account_id = t.account_id
GROUP BY a.account_id, m.full_name, a.account_type, a.current_balance
HAVING a.current_balance != COALESCE(SUM(
    CASE
        WHEN t.transaction_type IN ('deposit', 'transfer_in', 'surplus_distribution') THEN t.amount
        WHEN t.transaction_type IN ('withdrawal', 'transfer_out', 'liquidation') THEN -t.amount
        ELSE 0
    END
), 0)
ORDER BY m.full_name;

-- 13. Resumen general
SELECT
    '13. RESUMEN GENERAL' as verificacion,
    (SELECT COUNT(*) FROM members) as total_miembros,
    (SELECT COUNT(*) FROM accounts) as total_cuentas,
    (SELECT COUNT(*) FROM transactions) as total_transacciones,
    CONCAT('₡', TO_CHAR((SELECT SUM(current_balance) FROM accounts WHERE account_type = 'savings'), 'FM999,999,990.00')) as total_ahorros,
    CONCAT('₡', TO_CHAR((SELECT SUM(current_balance) FROM accounts WHERE account_type = 'contributions'), 'FM999,999,990.00')) as total_aportaciones,
    CONCAT('₡', TO_CHAR((SELECT SUM(current_balance) FROM accounts), 'FM999,999,990.00')) as gran_total;

-- ============================================================================
-- NOTAS:
-- - Si "Miembros Sin Transacciones" retorna filas, investiga por qué
-- - Si "Cuentas con Saldo Negativo" retorna filas, hay un ERROR CRÍTICO
-- - Si "Verificación de Integridad" retorna filas, los saldos están incorrectos
-- ============================================================================
