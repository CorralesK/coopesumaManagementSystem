/**
 * Server Entry Point
 */

const app = require('./app');
const config = require('./config/environment');
const db = require('./config/database');

// Test database connection
const testDatabaseConnection = async () => {
    try {
        await db.query('SELECT NOW()');
        console.log('✅ Database connection test successful');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
};

// Start server
const startServer = async () => {
    try {
        // Test database
        await testDatabaseConnection();

        // Start listening
        app.listen(config.port, () => {
            console.log('🚀 Server started successfully');
            console.log(`📡 Environment: ${config.nodeEnv}`);
            console.log(`🌐 Server running on port ${config.port}`);
            console.log(`🔗 API available at http://localhost:${config.port}`);
            console.log(`💾 Database: ${config.database.name}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err);
    process.exit(1);
});

// Start the server
startServer();