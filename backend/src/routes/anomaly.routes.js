import { Router } from 'express';
import * as anomalyController from '../controllers/anomaly.controller.js';
import requireAuth from '../middleware/auth.middleware.js';

const router = Router();

// Secure all anomaly endpoints
router.use(requireAuth);

// Analyze CSV Import for anomalies
router.post('/imports/:importId/analyze', anomalyController.analyze);

// List all anomalies detected for a specific import
router.get('/imports/:importId/anomalies', anomalyController.listForImport);

// Get details of a single anomaly
router.get('/anomalies/:anomalyId', anomalyController.get);

export default router;
