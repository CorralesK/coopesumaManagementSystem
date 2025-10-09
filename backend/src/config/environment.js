/**
 * Environment Configuration
 * Loads and validates environment variables
 */

require('dotenv').config();

const config = {
    // Server
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 5000,

    // Database
    database: {
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
        name: process.env.DATABASE_NAME || 'coopesuma_db',
        user: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || '',
        url: process.env.DATABASE_URL ||
             `postgresql://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`
    },

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },

    // Bcrypt
    bcrypt: {
        rounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10
    },

    // CORS
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
    },

    // Logging
    logLevel: process.env.LOG_LEVEL || 'info',

    // Microsoft OAuth
    microsoft: {
        clientId: process.env.MS_CLIENT_ID || '',
        clientSecret: process.env.MS_CLIENT_SECRET || '',
        tenantId: process.env.MS_TENANT_ID || 'common',
        redirectUri: process.env.MS_REDIRECT_URI || 'http://localhost:5000/api/auth/callback',
        authority: process.env.MS_AUTHORITY || 'https://login.microsoftonline.com/common',
        scopes: (process.env.MS_SCOPES || 'openid profile email User.Read').split(' ')
    },

    // Frontend
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
};

// Validation
const validateConfig = () => {
    const required = [
        'JWT_SECRET',
        'DATABASE_PASSWORD'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0 && config.nodeEnv === 'production') {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
};

validateConfig();

module.exports = config;