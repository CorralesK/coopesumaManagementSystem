/**
 * Data Normalization Utilities
 * Converts Excel data to database-compatible formats
 */

/**
 * Normalizes identification number from Excel float to formatted string
 * @param {number|string} id - Identification from Excel (e.g., 205750128.0)
 * @returns {string} Formatted identification (e.g., "2-0575-0128")
 */
function normalizeIdentification(id) {
    if (!id) return null;

    // If it's a number (float from Excel)
    if (typeof id === 'number') {
        id = String(id).replace('.0', '');
    }

    // Clean: only digits
    let clean = String(id).replace(/[^\d]/g, '');

    // Format: X-XXXX-XXXX (9 digits)
    if (clean.length === 9) {
        return `${clean[0]}-${clean.slice(1, 5)}-${clean.slice(5)}`;
    }

    // If it doesn't have 9 digits, return without format
    return clean;
}

/**
 * Normalizes date from Excel to ISO format
 * @param {Date|number|string} excelDate - Date from Excel
 * @returns {string|null} ISO date string (YYYY-MM-DD)
 */
function normalizeDate(excelDate) {
    if (!excelDate) return null;

    try {
        // If it's already a Date object
        if (excelDate instanceof Date) {
            return excelDate.toISOString().split('T')[0];
        }

        // If it's an Excel serial number
        if (typeof excelDate === 'number') {
            // Excel counts from 1900-01-01
            const date = new Date((excelDate - 25569) * 86400 * 1000);
            return date.toISOString().split('T')[0];
        }

        // If it's a string, try to parse
        if (typeof excelDate === 'string') {
            const parsed = new Date(excelDate);
            if (!isNaN(parsed.getTime())) {
                return parsed.toISOString().split('T')[0];
            }
        }

        return null;
    } catch (error) {
        console.error('Error normalizing date:', excelDate, error);
        return null;
    }
}

/**
 * Normalizes full name (proper capitalization)
 * @param {string} name - Name from Excel
 * @returns {string} Normalized name
 */
function normalizeFullName(name) {
    if (!name) return '';

    return String(name)
        .trim()
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Normalizes amount (converts to number, handles decimals)
 * @param {any} amount - Amount from Excel
 * @returns {number} Normalized amount
 */
function normalizeAmount(amount) {
    if (!amount) return 0;

    // If it's already a number
    if (typeof amount === 'number') {
        return Math.round(amount * 100) / 100; // Round to 2 decimals
    }

    // If it's a string, clean and parse
    if (typeof amount === 'string') {
        const cleaned = amount.replace(/[^\d.-]/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
    }

    return 0;
}

/**
 * Calculates fiscal year from a date
 * Fiscal year runs from October to September
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {number} Fiscal year
 */
function calculateFiscalYear(dateString) {
    const date = new Date(dateString);
    const month = date.getMonth() + 1; // 1-12
    const year = date.getFullYear();

    // If month >= 10 (Oct-Dec): fiscal year = current year
    // If month < 10 (Jan-Sep): fiscal year = previous year
    return month >= 10 ? year : year - 1;
}

/**
 * Normalizes member code (removes extra spaces, formats consistently)
 * @param {string} code - Member code from Excel
 * @returns {string} Normalized code
 */
function normalizeMemberCode(code) {
    if (!code) return null;

    return String(code).trim().toUpperCase();
}

module.exports = {
    normalizeIdentification,
    normalizeDate,
    normalizeFullName,
    normalizeAmount,
    calculateFiscalYear,
    normalizeMemberCode
};
