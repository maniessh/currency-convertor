require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { apiLimiter } = require('./middleware/rateLimiter');
const { requestLogger } = require('./middleware/logger');
const { errorHandler } = require('./middleware/errorHandler');
const config = require('./config/env');

// Import routes
const currencyRoutes = require('./routes/currencyRoutes');

// Initialize Express app
const app = express();

// ======================
// Security Middleware
// ======================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// ======================
// Core Middleware
// ======================
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ======================
// Request Logging
// ======================
app.use(requestLogger);

// ======================
// Rate Limiting
// ======================
app.use('/api/', apiLimiter);

// ======================
// Routes
// ======================
app.get('/', (req, res) => {
  res.json({
    name: 'Currency Converter API',
    version: '1.0.0',
    description: 'REST API for currency conversion and exchange rates',
    endpoints: {
      convert: 'GET /api/rates?from=USD&to=EUR&amount=100',
      rates: 'GET /api/rates/USD',
      currencies: 'GET /api/currencies',
      cacheStats: 'GET /api/stats/cache',
      clearCache: 'POST /api/cache/clear'
    }
  });
});

app.use('/api', currencyRoutes);

// ======================
// 404 Handler
// ======================
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// ======================
// Error Handler
// ======================
app.use(errorHandler);

module.exports = app;