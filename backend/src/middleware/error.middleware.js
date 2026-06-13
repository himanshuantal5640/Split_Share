import env from '../config/env.js';
import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error
  logger.error(`${req.method} ${req.originalUrl} - Error caught in middleware`, err);

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.nodeEnv === 'development' && { stack: err.stack }),
    ...(err.errors && { errors: err.errors }) // For validation errors (e.g. from zod)
  });
};

export default errorHandler;
