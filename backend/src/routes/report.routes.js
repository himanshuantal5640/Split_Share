import { Router } from 'express';
import * as reportController from '../controllers/report.controller.js';
import requireAuth from '../middleware/auth.middleware.js';

const router = Router();

// Secure all report endpoints
router.use(requireAuth);

// Get import summary report
router.get('/reports/import/:importId', reportController.getImportReport);

// Get detailed row-level audit trail
router.get('/reports/audit/:importId', reportController.getAuditTrail);

// Get system-wide aggregates and statistics
router.get('/reports/stats', reportController.getSystemStats);

export default router;
