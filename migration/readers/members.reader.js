/**
 * Members Excel Reader
 * Reads member data from Lista_asociados__madre_y_depurada__2025.xlsx
 */

const XLSX = require('xlsx');
const {
    normalizeIdentification,
    normalizeDate,
    normalizeFullName
} = require('../utils/normalizer');
const logger = require('../utils/logger');

/**
 * Reads members from Excel file
 * @param {string} filePath - Path to Excel file
 * @returns {Array} Array of member objects
 */
function readMembersFromExcel(filePath) {
    logger.step('📖 Leyendo archivo de miembros...');

    try {
        // Read Excel file
        const workbook = XLSX.readFile(filePath);
        const sheetName = 'LISTA DE ASOCIADOS';

        if (!workbook.SheetNames.includes(sheetName)) {
            throw new Error(`Hoja "${sheetName}" no encontrada en el archivo`);
        }

        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON (skip first 4 rows - headers are in row 4, data starts at row 5)
        const rawData = XLSX.utils.sheet_to_json(worksheet, {
            range: 4, // Start from row 5 (0-indexed, so 4)
            header: ['memberCode', 'fullName', 'identification', 'gender', 'affiliationDate', 'quality', 'level', 'admissionFee', 'status', 'exitDate', 'currentLevel'],
            defval: null
        });

        logger.info(`Encontradas ${rawData.length} filas en Excel`);

        // Process and normalize data
        const members = [];
        const skipped = [];

        rawData.forEach((row, index) => {
            const rowNumber = index + 5; // Actual Excel row number

            // Skip empty rows
            if (!row.identification && !row.fullName) {
                skipped.push({ row: rowNumber, reason: 'Fila vacía' });
                return;
            }

            try {
                const member = {
                    memberCode: row.memberCode ? String(row.memberCode).trim() : null,
                    fullName: normalizeFullName(row.fullName),
                    identification: normalizeIdentification(row.identification),
                    gender: row.gender ? String(row.gender).trim().toUpperCase() : null,
                    affiliationDate: normalizeDate(row.affiliationDate),
                    quality: row.quality ? String(row.quality).trim().toUpperCase() : null, // E=Estudiante, F=Funcionario
                    level: row.level ? String(row.level).trim() : null, // 1-6, TRANSICION, MATERNO, Docente, etc.
                    currentLevel: row.currentLevel ? String(row.currentLevel).trim() : null, // Nivel actual del estudiante
                    status: row.status ? String(row.status).trim().toUpperCase() : 'A', // A=Activo, R=Retirado
                    exitDate: normalizeDate(row.exitDate),
                    institutionalEmail: null, // Will be assigned manually later
                    isActive: row.status ? String(row.status).trim().toUpperCase() === 'A' : true,
                    _rowIndex: rowNumber
                };

                // Validate required fields
                if (!member.identification) {
                    skipped.push({ row: rowNumber, reason: 'Identificación inválida', value: row.identification });
                    return;
                }

                if (!member.fullName) {
                    skipped.push({ row: rowNumber, reason: 'Nombre vacío', value: row.fullName });
                    return;
                }

                if (!member.affiliationDate) {
                    skipped.push({ row: rowNumber, reason: 'Fecha de afiliación inválida', value: row.affiliationDate });
                    return;
                }

                members.push(member);
            } catch (error) {
                skipped.push({ row: rowNumber, reason: `Error procesando fila: ${error.message}` });
            }
        });

        logger.success(`${members.length} miembros procesados correctamente`);

        if (skipped.length > 0) {
            logger.warning(`${skipped.length} filas omitidas`);
            skipped.slice(0, 5).forEach(s => {
                logger.warning(`  Fila ${s.row}: ${s.reason}${s.value ? ` (${s.value})` : ''}`);
            });
        }

        return members;

    } catch (error) {
        logger.error(`Error leyendo archivo de miembros: ${error.message}`);
        throw error;
    }
}

module.exports = {
    readMembersFromExcel
};
