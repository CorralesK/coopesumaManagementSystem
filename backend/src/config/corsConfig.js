/**
 * CORS Configuration
 */

const config = require('./environment');

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) return callback(null, true);

        // List of allowed origins
        const allowedOrigins = [
            config.cors.origin,
            'http://localhost:5173',
            'http://127.0.0.1:5173'
        ];

        // Allow any origin from local network (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
        const localNetworkPattern = /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+):(\d+)$/;

        if (allowedOrigins.includes(origin) || localNetworkPattern.test(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

module.exports = corsOptions;