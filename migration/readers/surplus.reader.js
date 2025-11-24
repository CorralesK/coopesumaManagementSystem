/**
 * Surplus (Excedentes) Excel Reader
 * Reads surplus transactions from Registro_de_Aportaciones_2022_al_2025.xlsx
 *
 * Columns:
 * - R: Excedentes correspondientes (distribution amount)
 * - S: Excedentes por retirar - Monto (withdrawal amount)
 * - T: Excedentes por retirar - Nº Recibo (withdrawal receipt)
 * - U: Aportaciones por retirar - Monto (contribution withdrawal amount)
 * - V: Aportaciones por retirar - Nº Recibo (contribution withdrawal receipt)
 *
 * NOTE: Columns W-X (Excedentes para Hacienda) are NOT migrated as requested
 */

const XLSX = require('xlsx');
const {
    normalizeAmount,
    normalizeMemberCode
} = require('../utils/normalizer');
const logger = require('../utils/logger');

// Sheets to process
const SHEETS = ['APORT. 2022', 'APORT. 2023', 'APORT. 2024', 'APORT. 2025'];

/**
 * Reads surplus transactions from Excel file
 * @param {string} filePath - Path to Excel file
 * @returns {Object} Object with distributions and withdrawals arrays
 */
function readSurplusFromExcel(filePath) {
    logger.step('📖 Leyendo datos de excedentes...');

    try {
        const workbook = XLSX.readFile(filePath);
        const distributions = []; // Excedentes correspondientes (column R)
        const surplusWithdrawals = []; // Excedentes por retirar (columns S-T)
        const contributionWithdrawals = []; // Aportaciones por retirar (columns U-V)
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

            logger.info(`Procesando excedentes de: ${sheetName} (Año fiscal: ${fiscalYear})`);
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

                // Column R (index 17): Excedentes correspondientes (distribution)
                const distributionAmount = normalizeAmount(row[17]);

                // Columns S-T (indices 18-19): Excedentes por retirar (surplus withdrawal)
                const surplusWithdrawalAmount = normalizeAmount(row[18]);
                const surplusWithdrawalReceipt = row[19] ? String(row[19]).trim() : null;

                // Columns U-V (indices 20-21): Aportaciones por retirar (contribution withdrawal)
                const contributionWithdrawalAmount = normalizeAmount(row[20]);
                const contributionWithdrawalReceipt = row[21] ? String(row[21]).trim() : null;

                // Create distribution transaction (surplus_distribution)
                if (distributionAmount && distributionAmount > 0) {
                    distributions.push({
                        memberCode: memberCode,
                        identification: memberCode,
                        amount: distributionAmount,
                        transactionDate: new Date(fiscalYear + 1, 8, 30), // September 30 of following year (end of fiscal year)
                        fiscalYear: fiscalYear,
                        description: `Distribución de excedentes ${fiscalYear} (migración)`,
                        transactionType: 'surplus_distribution',
                        accountType: 'surplus',
                        _sheetName: sheetName,
                        _rowIndex: rowNumber
                    });
                }

                // Create surplus withdrawal transaction (withdrawal from surplus account)
                if (surplusWithdrawalAmount && surplusWithdrawalAmount > 0) {
                    surplusWithdrawals.push({
                        memberCode: memberCode,
                        identification: memberCode,
                        amount: surplusWithdrawalAmount,
                        receiptNumber: surplusWithdrawalReceipt,
                        transactionDate: new Date(fiscalYear + 1, 8, 30), // September 30 of following year (end of fiscal year)
                        fiscalYear: fiscalYear,
                        description: `Retiro de excedentes ${fiscalYear} (migración)`,
                        transactionType: 'withdrawal',
                        accountType: 'surplus',
                        _sheetName: sheetName,
                        _rowIndex: rowNumber
                    });
                }

                // Create contribution withdrawal transaction (withdrawal from contributions account)
                if (contributionWithdrawalAmount && contributionWithdrawalAmount > 0) {
                    contributionWithdrawals.push({
                        memberCode: memberCode,
                        identification: memberCode,
                        amount: contributionWithdrawalAmount,
                        receiptNumber: contributionWithdrawalReceipt,
                        transactionDate: new Date(fiscalYear + 1, 8, 30), // September 30 of following year (end of fiscal year)
                        fiscalYear: fiscalYear,
                        description: `Retiro de aportaciones ${fiscalYear} (migración)`,
                        transactionType: 'withdrawal',
                        accountType: 'contributions',
                        _sheetName: sheetName,
                        _rowIndex: rowNumber
                    });
                }
            });
        });

        const totalTransactions = distributions.length + surplusWithdrawals.length + contributionWithdrawals.length;

        logger.success(`${totalTransactions} transacciones de excedentes procesadas:`);
        logger.info(`  - ${distributions.length} distribuciones de excedentes`);
        logger.info(`  - ${surplusWithdrawals.length} retiros de excedentes`);
        logger.info(`  - ${contributionWithdrawals.length} retiros de aportaciones`);

        return {
            distributions,
            surplusWithdrawals,
            contributionWithdrawals
        };

    } catch (error) {
        logger.error(`Error leyendo datos de excedentes: ${error.message}`);
        throw error;
    }
}

module.exports = {
    readSurplusFromExcel
};
