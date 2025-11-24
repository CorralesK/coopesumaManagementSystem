/**
 * Contributions Excel Reader
 * Reads contribution transactions from Registro_de_Aportaciones_2022_al_2025.xlsm
 */

const XLSX = require('xlsx');
const {
    normalizeAmount,
    normalizeDate,
    normalizeMemberCode,
    calculateFiscalYear
} = require('../utils/normalizer');
const logger = require('../utils/logger');

// Sheets to process
const SHEETS = ['APORT. 2022', 'APORT. 2023', 'APORT. 2024', 'APORT. 2025'];

/**
 * Reads contribution transactions from Excel file
 * @param {string} filePath - Path to Excel file
 * @returns {Object} Object with transactions and initialBalances arrays
 */
function readContributionsFromExcel(filePath) {
    logger.step('📖 Leyendo archivo de aportaciones...');

    try {
        const workbook = XLSX.readFile(filePath);
        const transactions = [];
        const initialBalances = []; // Saldos iniciales (aportaciones acumuladas)
        const skipped = [];

        // Process each yearly sheet
        SHEETS.forEach(sheetName => {
            if (!workbook.SheetNames.includes(sheetName)) {
                logger.warning(`Hoja "${sheetName}" no encontrada, omitiendo...`);
                return;
            }

            // Extract fiscal year from sheet name
            const fiscalYearMatch = sheetName.match(/\d{4}/);
            if (!fiscalYearMatch) {
                logger.warning(`No se pudo extraer año fiscal de "${sheetName}", omitiendo...`);
                return;
            }
            const fiscalYear = parseInt(fiscalYearMatch[0]);

            logger.info(`Procesando hoja: ${sheetName} (Año fiscal: ${fiscalYear})`);
            const worksheet = workbook.Sheets[sheetName];

            // Read data starting from row 10 (headers in rows 1-9)
            const rawData = XLSX.utils.sheet_to_json(worksheet, {
                range: 9, // Start from row 10 (0-indexed, so 9)
                header: 1, // Use numeric indices
                defval: null
            });

            rawData.forEach((row, index) => {
                const rowNumber = index + 10; // Actual Excel row number

                // Column A (index 0): Member code
                const memberCode = row[0] ? normalizeMemberCode(row[0]) : null;

                // Skip empty rows or special rows
                if (!memberCode || memberCode === 'NO USAR ESTA FILA') {
                    return;
                }

                // Column E (index 4): Aportaciones acumuladas al año anterior (only for first year - 2022)
                if (sheetName === 'APORT. 2022') {
                    const accumulatedAmount = normalizeAmount(row[4]);

                    if (accumulatedAmount && accumulatedAmount > 0) {
                        initialBalances.push({
                            memberCode: memberCode,
                            identification: memberCode,
                            amount: accumulatedAmount,
                            transactionDate: new Date(2021, 11, 31), // December 31, 2021 (before fiscal year 2022)
                            fiscalYear: 2021,
                            description: `Saldo inicial de aportaciones (acumulado hasta 2021)`,
                            transactionType: 'deposit',
                            accountType: 'contributions',
                            _sheetName: sheetName,
                            _rowIndex: rowNumber,
                            _isInitialBalance: true
                        });
                    }
                }

                // Process 3 tracts (tractos)
                // Each tract has: Monto, Nº Recibo, Fecha
                const tracts = [
                    { num: 1, colAmount: 3, colReceipt: 4, colDate: 5 },   // Columns D (3), E (4), F (5)
                    { num: 2, colAmount: 6, colReceipt: 7, colDate: 8 },   // Columns G (6), H (7), I (8)
                    { num: 3, colAmount: 9, colReceipt: 10, colDate: 11 }  // Columns J (9), K (10), L (11)
                ];

                tracts.forEach(tract => {
                    const amount = normalizeAmount(row[tract.colAmount]);
                    const receiptNumber = row[tract.colReceipt] ? String(row[tract.colReceipt]).trim() : null;
                    const date = normalizeDate(row[tract.colDate]);

                    // Only create transaction if BOTH amount and date exist
                    if (amount && amount > 0 && date) {
                        transactions.push({
                            memberCode: memberCode,
                            identification: memberCode, // Will be resolved to actual ID later
                            amount: amount,
                            receiptNumber: receiptNumber, // Número de recibo
                            transactionDate: date,
                            fiscalYear: fiscalYear,
                            tractNumber: tract.num,
                            description: `Aportación ${fiscalYear} - Tracto ${tract.num} (migración)`,
                            transactionType: 'deposit',
                            accountType: 'contributions',
                            _sheetName: sheetName,
                            _rowIndex: rowNumber
                        });
                    } else if (amount && amount > 0 && !date) {
                        skipped.push({
                            row: rowNumber,
                            memberCode: memberCode,
                            tract: tract.num,
                            reason: 'Monto existe pero falta fecha'
                        });
                    }
                });
            });
        });

        logger.success(`${transactions.length} transacciones de aportaciones procesadas`);
        logger.info(`${initialBalances.length} saldos iniciales de aportaciones capturados`);

        if (skipped.length > 0) {
            logger.warning(`${skipped.length} transacciones omitidas por falta de fecha`);
            skipped.slice(0, 5).forEach(s => {
                logger.warning(`  Fila ${s.row} (${s.memberCode}) - Tracto ${s.tract}: ${s.reason}`);
            });
        }

        return {
            transactions,
            initialBalances
        };

    } catch (error) {
        logger.error(`Error leyendo archivo de aportaciones: ${error.message}`);
        throw error;
    }
}

module.exports = {
    readContributionsFromExcel
};
