const app = require('./app');
const config = require('./config/env');
const { logger } = require('./middleware/logger');

// ======================
// Start Server
// ======================
const server = app.listen(config.port, () => {
  logger.info(`🚀 Currency Converter API running`, {
    environment: config.nodeEnv,
    port: config.port,
    nodeVersion: process.version
  });
  logger.info(`📍 Local: http://localhost:${config.port}`);
  logger.info(`📚 API Docs: http://localhost:${config.port}/api-docs`);
});

// ======================
// Graceful Shutdown
// ======================
const gracefulShutdown = () => {
  logger.info('Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });

  // Force shutdown after 10s
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// ======================
// Unhandled Promise Rejections
// ======================
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', { error: err });
  server.close(() => process.exit(1));
});

// ======================
// Uncaught Exceptions
// ======================
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', { error: err });
  server.close(() => process.exit(1));
});