/**
 * Simple Logger Utility
 */

const config = require('../config/environment');

const LOG_LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
};

const currentLevel = LOG_LEVELS[config.logLevel] || LOG_LEVELS.info;

const formatMessage = (level, message, meta = {}) => {
    const timestamp = new Date().toISOString();
    return {
        timestamp,
        level,
        message,
        ...meta
    };
};

const logger = {
    error: (message, meta) => {
        if (currentLevel >= LOG_LEVELS.error) {
            console.error(JSON.stringify(formatMessage('ERROR', message, meta)));
        }
    },

    warn: (message, meta) => {
        if (currentLevel >= LOG_LEVELS.warn) {
            console.warn(JSON.stringify(formatMessage('WARN', message, meta)));
        }
    },

    info: (message, meta) => {
        if (currentLevel >= LOG_LEVELS.info) {
            console.log(JSON.stringify(formatMessage('INFO', message, meta)));
        }
    },

    debug: (message, meta) => {
        if (currentLevel >= LOG_LEVELS.debug) {
            console.log(JSON.stringify(formatMessage('DEBUG', message, meta)));
        }
    }
};

module.exports = logger;