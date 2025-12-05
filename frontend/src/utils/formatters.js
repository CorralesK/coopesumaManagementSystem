/**
 * Utility functions for formatting data
 */

/**
 * Format number as Costa Rican currency (Colones)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) {
        return '₡0.00';
    }

    const numAmount = parseFloat(amount);

    if (isNaN(numAmount)) {
        return '₡0.00';
    }

    return new Intl.NumberFormat('es-CR', {
        style: 'currency',
        currency: 'CRC',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numAmount);
};

/**
 * Format date to Costa Rican format (dd/mm/yyyy)
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
    if (!date) return '-';

    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
        return '-';
    }

    return new Intl.DateTimeFormat('es-CR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(dateObj);
};

/**
 * Format date and time to Costa Rican format (dd/mm/yyyy hh:mm AM/PM)
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date) => {
    if (!date) return '-';

    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
        return '-';
    }

    return new Intl.DateTimeFormat('es-CR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).format(dateObj);
};

/**
 * Format number with thousands separator
 * @param {number} number - The number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (number) => {
    if (number === null || number === undefined) {
        return '0';
    }

    const numValue = parseFloat(number);

    if (isNaN(numValue)) {
        return '0';
    }

    return new Intl.NumberFormat('es-CR').format(numValue);
};

/**
 * Format percentage
 * @param {number} value - The value to format as percentage
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 2) => {
    if (value === null || value === undefined) {
        return '0%';
    }

    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
        return '0%';
    }

    return `${numValue.toFixed(decimals)}%`;
};

/**
 * Truncate text to specified length
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Format identification number (cédula)
 * @param {string} identification - The identification to format
 * @returns {string} Formatted identification
 */
export const formatIdentification = (identification) => {
    if (!identification) return '-';

    // Remove any non-digit characters
    const digits = identification.replace(/\D/g, '');

    // Format as X-XXXX-XXXX for Costa Rican cédula
    if (digits.length === 9) {
        return `${digits.substring(0, 1)}-${digits.substring(1, 5)}-${digits.substring(5)}`;
    }

    return identification;
};

/**
 * Format phone number
 * @param {string} phone - The phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhone = (phone) => {
    if (!phone) return '-';

    // Remove any non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Format as XXXX-XXXX for Costa Rican phone
    if (digits.length === 8) {
        return `${digits.substring(0, 4)}-${digits.substring(4)}`;
    }

    return phone;
};

export default {
    formatCurrency,
    formatDate,
    formatDateTime,
    formatNumber,
    formatPercentage,
    truncateText,
    formatIdentification,
    formatPhone
};