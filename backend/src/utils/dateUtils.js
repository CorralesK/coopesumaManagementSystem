/**
 * Date and Time Utilities
 */

/**
 * Format date to YYYY-MM-DD
 * @param {Date} date - Date object
 * @returns {string} - Formatted date string
 */
const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Format time to HH:MM:SS
 * @param {Date} date - Date object
 * @returns {string} - Formatted time string
 */
const formatTime = (date) => {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};

/**
 * Format datetime to YYYY-MM-DD HH:MM:SS
 * @param {Date} date - Date object
 * @returns {string} - Formatted datetime string
 */
const formatDateTime = (date) => {
    return `${formatDate(date)} ${formatTime(date)}`;
};

/**
 * Check if date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} - True if date is in the past
 */
const isPastDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    return d < now;
};

/**
 * Check if date is in the future
 * @param {Date|string} date - Date to check
 * @returns {boolean} - True if date is in the future
 */
const isFutureDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    return d > now;
};

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} - True if date is today
 */
const isToday = (date) => {
    const d = new Date(date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
};

/**
 * Add days to a date
 * @param {Date} date - Starting date
 * @param {number} days - Number of days to add
 * @returns {Date} - New date
 */
const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

/**
 * Get date range for reports
 * @param {string} period - Period type (today, week, month, year)
 * @returns {Object} - Object with startDate and endDate
 */
const getDateRange = (period) => {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
    case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
    case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        endDate = new Date();
        break;
    case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
    case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
    default:
        startDate = new Date(now.setDate(now.getDate() - 30));
        endDate = new Date();
    }

    return { startDate, endDate };
};

module.exports = {
    formatDate,
    formatTime,
    formatDateTime,
    isPastDate,
    isFutureDate,
    isToday,
    addDays,
    getDateRange
};