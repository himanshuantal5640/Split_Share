import * as anomalyService from '../services/anomaly.service.js';
import { validateAnalyzeRequest } from '../validators/anomaly.validator.js';

// Helper to wrap async route handlers and forward exceptions to Express error handler
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Analyze CSV Import for anomalies.
 */
export const analyze = catchAsync(async (req, res) => {
  const { isValid, errors } = validateAnalyzeRequest(req.params);
  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  const importId = parseInt(req.params.importId, 10);
  const report = await anomalyService.analyzeImport(importId, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Import analysis completed successfully.',
    data: { report }
  });
});

/**
 * List all anomalies detected for an import.
 */
export const listForImport = catchAsync(async (req, res) => {
  const importId = parseInt(req.params.importId, 10);
  if (isNaN(importId) || importId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid import ID.'
    });
  }

  const anomalies = await anomalyService.getImportAnomalies(importId, req.user.id);

  res.status(200).json({
    success: true,
    data: { anomalies }
  });
});

/**
 * Get detailed information about a single anomaly.
 */
export const get = catchAsync(async (req, res) => {
  const anomalyId = parseInt(req.params.anomalyId, 10);
  if (isNaN(anomalyId) || anomalyId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid anomaly ID.'
    });
  }

  const anomaly = await anomalyService.getAnomalyDetails(anomalyId, req.user.id);

  res.status(200).json({
    success: true,
    data: { anomaly }
  });
});

export default {
  analyze,
  listForImport,
  get
};
