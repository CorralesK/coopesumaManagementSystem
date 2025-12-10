/**
 * Savings Excel Reader
 * Reads savings transactions from CONTROL_AHORROS__FORMULAS_Coopesuma_2025.xlsx
 *
 * Excel Structure:
 * - PRINCIPAL sheet: Contains "AÑO ANTERIOR" (previous year balance) and monthly totals
 * - Monthly sheets (FEBRERO-DICIEMBRE): Contains individual transactions with receipt numbers
 */

const XLSX = require('xlsx');
const {
    normalizeAmount,
    normalizeIdentification,
    normalizeMemberCode,
    calculateFiscalYear
} = require('../utils/normalizer');
const logger = require('../utils/logger');

// Month name to number mapping (note: SETIEMBRE with S, not SEPTIEMBRE)
const MONTH_MAP = {
    'FEBRERO': 2,
    'MARZO': 3,
    'ABRIL': 4,
    'MAYO': 5,
    'JUNIO': 6,
    'JULIO': 7,
    'AGOSTO': 8,
    'SETIEMBRE': 9,
    'OCTUBRE': 10,
    'NOVIEMBRE': 11,
    'DICIEMBRE': 12
};

/**
 * Reads previous year balances and monthly totals from PRINCIPAL sheet
 * @param {Object} workbook - XLSX workbook
 * @returns {Object} Object with transactions array and monthlyTotals map
 */
function readPrincipalSheet(workbook) {
    const transactions = [];
    const monthlyTotals = new Map(); // Map<memberCode, Map<monthNumber, expectedTotal>>

    if (!workbook.SheetNames.includes('PRINCIPAL')) {
        logger.warning('Hoja "PRINCIPAL" no encontrada, no se migrarán saldos de años anteriores');
        return { transactions, monthlyTotals };
    }

    logger.info('Procesando hoja: PRINCIPAL (saldos de años anteriores y totales mensuales)');
    const worksheet = workbook.Sheets['PRINCIPAL'];

    // Read data starting from row 8 (headers in row 7)
    // Headers: [#, ASOCIADO, NOMBRE, AÑO ANTERIOR, FEBRERO, MARZO, ABRIL, MAYO, JUNIO, JULIO, AGOSTO, SETIEMBRE, OCTUBRE, NOVIEMBRE, DICIEMBRE, INTERESES, TOTAL AHORRADO]
    // Indices: [0, 1,        2,      3,            4,       5,     6,     7,    8,     9,     10,     11,        12,      13,        14,        15,        16]
    const rawData = XLSX.utils.sheet_to_json(worksheet, {
        range: 7,
        header: 1,
        defval: null
    });

    // Month column indices in PRINCIPAL sheet
    const PRINCIPAL_MONTH_COLS = {
        2: 4,   // FEBRERO -> index 4
        3: 5,   // MARZO -> index 5
        4: 6,   // ABRIL -> index 6
        5: 7,   // MAYO -> index 7
        6: 8,   // JUNIO -> index 8
        7: 9,   // JULIO -> index 9
        8: 10,  // AGOSTO -> index 10
        9: 11,  // SETIEMBRE -> index 11
        10: 12, // OCTUBRE -> index 12
        11: 13, // NOVIEMBRE -> index 13
        12: 14  // DICIEMBRE -> index 14
    };

    rawData.forEach((row, index) => {
        const rowNumber = index + 8;

        // Column B (index 1): Member code
        const memberCode = row[1] ? normalizeMemberCode(row[1]) : null;

        if (!memberCode) {
            return;
        }

        // Column D (index 3): AÑO ANTERIOR (previous year balance)
        const previousYearBalance = normalizeAmount(row[3]);

        if (previousYearBalance && previousYearBalance > 0) {
            // Create a deposit transaction for the previous year balance
            // Use January 1st of 2025 as the transaction date (fiscal year start)
            transactions.push({
                memberCode: memberCode,
                identification: memberCode,
                amount: previousYearBalance,
                receiptNumber: null,
                transactionDate: '2025-01-01',
                fiscalYear: 2025,
                description: 'Saldo acumulado años anteriores (migración)',
                transactionType: 'deposit',
                accountType: 'savings',
                _sheetName: 'PRINCIPAL',
                _rowIndex: rowNumber,
                _isPreviousYearBalance: true
            });
        }

        // Extract monthly totals for later comparison
        const memberMonthlyTotals = new Map();
        Object.entries(PRINCIPAL_MONTH_COLS).forEach(([monthNum, colIndex]) => {
            const monthTotal = normalizeAmount(row[colIndex]);
            if (monthTotal && monthTotal > 0) {
                memberMonthlyTotals.set(parseInt(monthNum), monthTotal);
            }
        });

        if (memberMonthlyTotals.size > 0) {
            monthlyTotals.set(memberCode, memberMonthlyTotals);
        }
    });

    logger.info(`${transactions.length} saldos de años anteriores encontrados`);
    logger.info(`${monthlyTotals.size} miembros con totales mensuales registrados`);
    return { transactions, monthlyTotals };
}

/**
 * Reads savings transactions from Excel file
 * @param {string} filePath - Path to Excel file
 * @returns {Array} Array of savings transaction objects
 */
function readSavingsFromExcel(filePath) {
    logger.step('📖 Leyendo archivo de ahorros...');

    try {
        const workbook = XLSX.readFile(filePath);
        const transactions = [];
        const skipped = [];

        // STEP 1: Read previous year balances AND monthly totals from PRINCIPAL sheet
        const { transactions: previousYearTransactions, monthlyTotals } = readPrincipalSheet(workbook);
        transactions.push(...previousYearTransactions);

        // Track monthly sums per member from individual transactions
        // Map<memberCode, Map<monthNumber, sumFromIndividualTransactions>>
        const monthlyIndividualSums = new Map();

        // STEP 2: Process each monthly sheet for individual transactions
        Object.keys(MONTH_MAP).forEach(monthName => {
            const monthNumber = MONTH_MAP[monthName];

            if (!workbook.SheetNames.includes(monthName)) {
                logger.warning(`Hoja "${monthName}" no encontrada, omitiendo...`);
                return;
            }

            logger.info(`Procesando hoja: ${monthName}`);
            const worksheet = workbook.Sheets[monthName];

            // Read data starting from row 8 (headers in row 7)
            // Headers: [#, ASOCIADO, NOMBRE, RECIBO, AHORRO, RECIBO, AHORRO, ...]
            const rawData = XLSX.utils.sheet_to_json(worksheet, {
                range: 7, // Start from row 8 (0-indexed, so 7)
                header: 1, // Use numeric indices
                defval: null
            });

            rawData.forEach((row, index) => {
                const rowNumber = index + 8; // Actual Excel row number

                // Column B (index 1): Member code
                const memberCode = row[1] ? normalizeMemberCode(row[1]) : null;

                // Skip empty rows
                if (!memberCode) {
                    return;
                }

                // Initialize tracking for this member if needed
                if (!monthlyIndividualSums.has(memberCode)) {
                    monthlyIndividualSums.set(memberCode, new Map());
                }
                const memberSums = monthlyIndividualSums.get(memberCode);
                if (!memberSums.has(monthNumber)) {
                    memberSums.set(monthNumber, 0);
                }

                // Process pairs of columns (RECIBO, AHORRO)
                // Column indices:
                //   RECIBO at index 3, AHORRO at index 4
                //   RECIBO at index 5, AHORRO at index 6
                //   ...
                //   RECIBO at index 13, AHORRO at index 14
                //   INTERESES at index 15 (skip)
                //   TOTAL at index 16 (skip - this is a calculated sum)
                //
                // We only process up to index 14 (last AHORRO column)
                // Pattern: RECIBO at odd index (3,5,7...), AHORRO at even index (4,6,8...)
                const maxCol = 14; // Last AHORRO column before INTERESES/TOTAL
                for (let col = 3; col <= maxCol; col += 2) {
                    const receiptNumber = row[col] ? String(row[col]).trim() : null; // RECIBO column
                    const amount = normalizeAmount(row[col + 1]); // AHORRO column (next column)

                    // Only create transaction if:
                    // 1. Amount is positive
                    // 2. There's a receipt number (to avoid picking up calculated totals)
                    if (amount && amount > 0 && receiptNumber) {
                        const transactionDate = `2025-${String(monthNumber).padStart(2, '0')}-01`;

                        transactions.push({
                            memberCode: memberCode,
                            identification: memberCode, // Will be resolved to actual ID later
                            amount: amount,
                            receiptNumber: receiptNumber, // Número de recibo
                            transactionDate: transactionDate,
                            fiscalYear: calculateFiscalYear(transactionDate),
                            description: `Ahorro ${monthName} 2025 (migración)`,
                            transactionType: 'deposit',
                            accountType: 'savings',
                            _sheetName: monthName,
                            _rowIndex: rowNumber
                        });

                        // Track sum for adjustment calculation
                        memberSums.set(monthNumber, memberSums.get(monthNumber) + amount);
                    }
                }
            });
        });

        // STEP 3: Create adjustment transactions for discrepancies
        // Compare monthly totals from PRINCIPAL with sums from individual transactions
        let adjustmentCount = 0;
        const monthNames = ['', 'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
                           'JULIO', 'AGOSTO', 'SETIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

        monthlyTotals.forEach((memberMonthlyTotals, memberCode) => {
            memberMonthlyTotals.forEach((expectedTotal, monthNumber) => {
                const memberSums = monthlyIndividualSums.get(memberCode);
                const actualSum = memberSums ? (memberSums.get(monthNumber) || 0) : 0;
                const difference = expectedTotal - actualSum;

                if (difference > 0) {
                    // There's a positive difference - need to add an adjustment transaction
                    const transactionDate = `2025-${String(monthNumber).padStart(2, '0')}-01`;
                    const monthName = monthNames[monthNumber];

                    transactions.push({
                        memberCode: memberCode,
                        identification: memberCode,
                        amount: difference,
                        receiptNumber: null,
                        transactionDate: transactionDate,
                        fiscalYear: 2025,
                        description: `Ajuste ${monthName} 2025 - diferencia sin recibo (migración)`,
                        transactionType: 'deposit',
                        accountType: 'savings',
                        _sheetName: 'ADJUSTMENT',
                        _rowIndex: null,
                        _isAdjustment: true
                    });
                    adjustmentCount++;
                } else if (difference < 0) {
                    // Individual transactions sum to MORE than expected - this is unusual
                    logger.warning(`Miembro ${memberCode}, ${monthNames[monthNumber]}: suma individual (${actualSum}) > esperado (${expectedTotal})`);
                }
            });
        });

        if (adjustmentCount > 0) {
            logger.info(`${adjustmentCount} transacciones de ajuste creadas para cubrir diferencias`);
        }

        logger.success(`${transactions.length} transacciones de ahorro procesadas (incluyendo saldos anteriores y ajustes)`);

        if (skipped.length > 0) {
            logger.warning(`${skipped.length} filas omitidas`);
        }

        return transactions;

    } catch (error) {
        logger.error(`Error leyendo archivo de ahorros: ${error.message}`);
        throw error;
    }
}

module.exports = {
    readSavingsFromExcel
};
