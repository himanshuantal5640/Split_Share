import app from './src/app.js';
import env from './src/config/env.js';
import { connectDb } from './src/config/database.js';
import logger from './src/utils/logger.js';

// Setup server port
const PORT = env.port;

// Connect to Database
await connectDb();

// Start HTTP server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running in ${env.nodeEnv} mode on port ${PORT}`);
  logger.info(`👉 Health check: http://localhost:${PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
  process.exit(1);
});

// Handle termination signals for graceful shutdown
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully...');
  server.close(() => {
    logger.info('💥 Process terminated.');
  });
});
