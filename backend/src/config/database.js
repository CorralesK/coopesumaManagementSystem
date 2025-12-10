/**
 * Database Configuration and Connection Pool
 */

const { Pool } = require('pg');
const config = require('./environment');
const { keysToCamel } = require('../utils/caseConverter');

// Create connection pool
const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.on('connect', () => {
    console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected database error:', err);
    process.exit(-1);
});

// Query helper with logging and automatic camelCase conversion
const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;


        // Convert snake_case column names to camelCase
        if (result.rows && result.rows.length > 0) {
            result.rows = keysToCamel(result.rows);
        }

        return result;
    } catch (error) {
        console.error('❌ Query error:', error);
        throw error;
    }
};

// Get client for transactions
const getClient = async () => {
    const client = await pool.connect();
    return client;
};

module.exports = {
    query,
    getClient,
    pool
};