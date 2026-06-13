import * as importProcessorService from '../services/importProcessor.service.js';
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
 * Trigger import processing for approved rows.
 */
export const processImport = catchAsync(async (req, res) => {
  const importId = parseIdParam('importId', req.params.importId);
  const result = await importProcessorService.processImport(importId, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Import processed successfully.',
    data: result
  });
});

/**
 * Get import status.
 */
export const getStatus = catchAsync(async (req, res) => {
  const importId = parseIdParam('importId', req.params.importId);
  const status = await importProcessorService.getImportStatus(importId, req.user.id);

  res.status(200).json({
    success: true,
    data: status
  });
});

/**
 * Get detailed processing report.
 */
export const getReport = catchAsync(async (req, res) => {
  const importId = parseIdParam('importId', req.params.importId);
  const report = await importProcessorService.getProcessingReport(importId, req.user.id);

  res.status(200).json({
    success: true,
    data: {
      report
    }
  });
});

export default {
  processImport,
  getStatus,
  getReport
};
