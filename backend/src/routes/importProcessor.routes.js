import { Router } from 'express';
import * as importProcessorController from '../controllers/importProcessor.controller.js';
import requireAuth from '../middleware/auth.middleware.js';

const router = Router();

// Secure all import processor endpoints
router.use(requireAuth);

// Process approved rows of an import
router.post('/imports/:importId/process', importProcessorController.processImport);

// Get import processing status
router.get('/imports/:importId/status', importProcessorController.getStatus);

// Get detailed import processing report
router.get('/imports/:importId/process-report', importProcessorController.getReport);

export default router;
