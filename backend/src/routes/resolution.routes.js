import { Router } from 'express';
import * as resolutionController from '../controllers/resolution.controller.js';
import requireAuth from '../middleware/auth.middleware.js';

const router = Router();

// Secure all endpoints under the resolution namespace
router.use(requireAuth);

// Pending Anomaly Queue
router.get('/anomalies/pending', resolutionController.getPending);

// Approve Anomaly
router.patch('/anomalies/:anomalyId/approve', resolutionController.approve);

// Reject Anomaly
router.patch('/anomalies/:anomalyId/reject', resolutionController.reject);

// Get Import Resolution Report
router.get('/imports/:importId/resolution-report', resolutionController.getReport);

export default router;
