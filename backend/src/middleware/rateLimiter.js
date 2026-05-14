const rateLimit = require('express-rate-limit');
const config = require('../config/env');

// Rate limiter middleware
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    error: true,
    message: `Too many requests from this IP, please try again after ${config.rateLimit.windowMs / 1000 / 60} minutes`
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});

module.exports = { apiLimiter };