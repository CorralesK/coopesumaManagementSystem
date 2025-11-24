/**
 * Savings Excel Reader
 * Reads savings transactions from CONTROL_AHORROS__FORMULAS_Coopesuma_2025.xlsx
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

        // Process each monthly sheet
        Object.keys(MONTH_MAP).forEach(monthName => {
            const monthNumber = MONTH_MAP[monthName];

            if (!workbook.SheetNames.includes(monthName)) {
                logger.warning(`Hoja "${monthName}" no encontrada, omitiendo...`);
                return;
            }

            logger.info(`Procesando hoja: ${monthName}`);
            const worksheet = workbook.Sheets[monthName];

            // Read data starting from row 8 (headers in row 7)
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

                // Process pairs of columns (RECIBO, AHORRO)
                // Columns: C-D (2-3), E-F (4-5), G-H (6-7), I-J (8-9), K-L (10-11), M-N (12-13)
                // Pattern: RECIBO at even index, AHORRO at odd index (starting from index 3)
                for (let col = 3; col < row.length; col += 2) {
                    const receiptNumber = row[col - 1] ? String(row[col - 1]).trim() : null; // RECIBO column
                    const amount = normalizeAmount(row[col]); // AHORRO column

                    // Only create transaction if amount is positive
                    if (amount && amount > 0) {
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
                    }
                }
            });
        });

        logger.success(`${transactions.length} transacciones de ahorro procesadas`);

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
