import * as resolutionService from '../services/resolution.service.js';
import { validateResolveAnomaly } from '../validators/resolution.validator.js';

// Helper to wrap async route handlers and forward exceptions to Express error handler
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * List all pending anomalies across user's groups.
 */
export const getPending = catchAsync(async (req, res) => {
  const anomalies = await resolutionService.getPendingAnomalies(req.user.id);

  res.status(200).json({
    success: true,
    data: { anomalies }
  });
});

/**
 * Approve a pending anomaly.
 */
export const approve = catchAsync(async (req, res) => {
  const { isValid, errors } = validateResolveAnomaly(req.body);
  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  const anomalyId = parseInt(req.params.anomalyId, 10);
  if (isNaN(anomalyId) || anomalyId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid anomaly ID.'
    });
  }

  const anomaly = await resolutionService.resolveAnomaly(
    anomalyId,
    'APPROVED',
    req.body.resolutionNote,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: 'Anomaly approved successfully.',
    data: { anomaly }
  });
});

/**
 * Reject a pending anomaly.
 */
export const reject = catchAsync(async (req, res) => {
  const { isValid, errors } = validateResolveAnomaly(req.body);
  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  const anomalyId = parseInt(req.params.anomalyId, 10);
  if (isNaN(anomalyId) || anomalyId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid anomaly ID.'
    });
  }

  const anomaly = await resolutionService.resolveAnomaly(
    anomalyId,
    'REJECTED',
    req.body.resolutionNote,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: 'Anomaly rejected successfully.',
    data: { anomaly }
  });
});

/**
 * Get import resolution report.
 */
export const getReport = catchAsync(async (req, res) => {
  const importId = parseInt(req.params.importId, 10);
  if (isNaN(importId) || importId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid import ID.'
    });
  }

  const report = await resolutionService.getImportResolutionReport(importId, req.user.id);

  res.status(200).json({
    success: true,
    data: { report }
  });
});

export default {
  getPending,
  approve,
  reject,
  getReport
};
