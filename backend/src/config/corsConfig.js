/**
 * CORS Configuration
 */

const config = require('./environment');

const corsOptions = {
    origin: config.cors.origin,
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

module.exports = corsOptions;