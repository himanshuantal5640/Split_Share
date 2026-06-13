import * as systemService from '../services/system.service.js';

// Helper to wrap async route handlers and forward exceptions to Express error handler
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Handle system readiness check.
 */
export const getReadiness = catchAsync(async (req, res) => {
  const result = await systemService.getReadiness();
  const statusCode = result.ready ? 200 : 503;

  res.status(statusCode).json({
    success: result.ready,
    data: result
  });
});

/**
 * Handle system health check.
 */
export const getHealth = catchAsync(async (req, res) => {
  const result = await systemService.getHealth();
  const statusCode = result.healthy ? 200 : 503;

  res.status(statusCode).json({
    success: result.healthy,
    data: result
  });
});

export default {
  getReadiness,
  getHealth
};
