import * as reportService from '../services/report.service.js';
import { AppError } from '../utils/errors.js';

// Helper to wrap async route handlers and forward exceptions to Express error handler
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Helper to validate and parse route integer params
const parseIdParam = (paramName, paramVal) => {
  const parsed = parseInt(paramVal, 10);
  if (isNaN(parsed) || parsed <= 0) {
    throw new AppError(`Invalid parameter: ${paramName} must be a positive integer.`, 400);
  }
  return parsed;
};

/**
 * Get import report.
 */
export const getImportReport = catchAsync(async (req, res) => {
  const importId = parseIdParam('importId', req.params.importId);
  const report = await reportService.getImportReport(importId, req.user.id);

  res.status(200).json({
    success: true,
    data: {
      report
    }
  });
});

/**
 * Get detailed audit trail.
 */
export const getAuditTrail = catchAsync(async (req, res) => {
  const importId = parseIdParam('importId', req.params.importId);
  const auditTrail = await reportService.getAuditTrail(importId, req.user.id);

  res.status(200).json({
    success: true,
    data: {
      auditTrail
    }
  });
});

/**
 * Get system-wide statistics.
 */
export const getSystemStats = catchAsync(async (req, res) => {
  const stats = await reportService.getSystemStats();

  res.status(200).json({
    success: true,
    data: {
      stats
    }
  });
});

export default {
  getImportReport,
  getAuditTrail,
  getSystemStats
};
