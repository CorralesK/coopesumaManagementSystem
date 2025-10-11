/**
 * Express Application Configuration
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const config = require('./config/environment');
const corsOptions = require('./config/corsConfig');
const errorHandler = require('./middlewares/errorHandler');
const requestLogger = require('./middlewares/requestLogger');

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors(corsOptions));

// Cookie parser
app.use(cookieParser());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logger (only in development)
if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
}

// Custom request logger
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv
    });
});

// API routes
const authRoutes = require('./modules/auth/authRoutes');
const memberRoutes = require('./modules/members/memberRoutes');
const assemblyRoutes = require('./modules/assemblies/assemblyRoutes');
const attendanceRoutes = require('./modules/attendance/attendanceRoutes');
const userRoutes = require('./modules/users/userRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/assemblies', assemblyRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
        error: 'NOT_FOUND'
    });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;