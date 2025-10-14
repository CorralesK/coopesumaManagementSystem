/**
 * Winston Logger Utility
 * Professional logging with file rotation and multiple transports
 *
 * @module utils/logger
 */

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const config = require('../config/environment');

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Define console format (more readable for development)
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(meta).length > 0) {
            msg += ` ${JSON.stringify(meta)}`;
        }
        return msg;
    })
);

// Create logs directory path
const logsDir = path.join(__dirname, '../../logs');

// Define transports
const transports = [];

// Console transport (always enabled in development)
if (config.nodeEnv === 'development') {
    transports.push(
        new winston.transports.Console({
            format: consoleFormat,
            level: config.logLevel || 'debug'
        })
    );
}

// File transport for all logs (with rotation)
transports.push(
    new DailyRotateFile({
        filename: path.join(logsDir, 'application-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d', // Keep logs for 14 days
        format: logFormat,
        level: 'debug'
    })
);

// File transport for error logs only (with rotation)
transports.push(
    new DailyRotateFile({
        filename: path.join(logsDir, 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d', // Keep error logs for 30 days
        format: logFormat,
        level: 'error'
    })
);

// File transport for combined logs (non-rotating, for current session)
transports.push(
    new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
        format: logFormat,
        level: config.logLevel || 'info'
    })
);

// Create the logger
const logger = winston.createLogger({
    level: config.logLevel || 'info',
    format: logFormat,
    transports,
    exitOnError: false
});

// Add request logging helper
logger.logRequest = (req, res, duration) => {
    const logData = {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip || req.connection.remoteAddress
    };

    if (res.statusCode >= 500) {
        logger.error('HTTP Request', logData);
    } else if (res.statusCode >= 400) {
        logger.warn('HTTP Request', logData);
    } else {
        logger.info('HTTP Request', logData);
    }
};

// Add database query logging helper
logger.logQuery = (query, duration, rows) => {
    logger.debug('Database Query', {
        query: typeof query === 'string' ? query : query.text,
        duration: `${duration}ms`,
        rows: rows !== undefined ? rows : 'N/A'
    });
};

module.exports = logger;
