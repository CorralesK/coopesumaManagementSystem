/**
 * Case Converter Utility
 * Converts between snake_case and camelCase
 *
 * @module utils/caseConverter
 */

/**
 * Convert snake_case string to camelCase
 *
 * @param {string} str - Snake case string
 * @returns {string} Camel case string
 */
const snakeToCamel = (str) => {
    return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
};

/**
 * Convert camelCase string to snake_case
 *
 * @param {string} str - Camel case string
 * @returns {string} Snake case string
 */
const camelToSnake = (str) => {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

/**
 * Convert object keys from snake_case to camelCase
 *
 * @param {Object|Array} obj - Object or array with snake_case keys
 * @returns {Object|Array} Object or array with camelCase keys
 */
const keysToCamel = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(item => keysToCamel(item));
    }

    if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
        return Object.keys(obj).reduce((acc, key) => {
            const camelKey = snakeToCamel(key);
            acc[camelKey] = keysToCamel(obj[key]);
            return acc;
        }, {});
    }

    return obj;
};

/**
 * Convert object keys from camelCase to snake_case
 *
 * @param {Object|Array} obj - Object or array with camelCase keys
 * @returns {Object|Array} Object or array with snake_case keys
 */
const keysToSnake = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(item => keysToSnake(item));
    }

    if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
        return Object.keys(obj).reduce((acc, key) => {
            const snakeKey = camelToSnake(key);
            acc[snakeKey] = keysToSnake(obj[key]);
            return acc;
        }, {});
    }

    return obj;
};

module.exports = {
    snakeToCamel,
    camelToSnake,
    keysToCamel,
    keysToSnake
};
